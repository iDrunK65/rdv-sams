<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\AppointmentType;
use App\Models\AvailabilityException;
use App\Models\AvailabilityRule;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use MongoDB\BSON\ObjectId;

class AvailabilityService
{
    /**
     * @return array<int, array{startAt: Carbon, endAt: Carbon}>
     */
    public function buildSlots(
        string $doctorId,
        string $calendarId,
        Carbon $from,
        Carbon $to,
        AppointmentType $appointmentType,
        ?string $ignoreAppointmentId = null
    ): array
    {
        $timezone = config('app.timezone', 'Europe/Paris');
        $fromLocal = $from->copy()->setTimezone($timezone);
        $toLocal = $to->copy()->setTimezone($timezone);

        $durationMinutes = $this->durationMinutes($appointmentType);
        if ($durationMinutes <= 0) {
            return [];
        }
        $bufferBeforeMinutes = $this->bufferBeforeMinutes($appointmentType);
        $bufferAfterMinutes = $this->bufferAfterMinutes($appointmentType);

        $rules = AvailabilityRule::query()
            ->where('doctorId', new ObjectId($doctorId))
            ->where('calendarId', new ObjectId($calendarId))
            ->get();

        $exceptions = AvailabilityException::query()
            ->where('doctorId', new ObjectId($doctorId))
            ->where('calendarId', new ObjectId($calendarId))
            ->whereBetween('date', [$fromLocal->toDateString(), $toLocal->toDateString()])
            ->get();

        $slots = [];

        foreach ($rules as $rule) {
            $periodStart = $fromLocal->copy()->startOfDay();
            $periodEnd = $toLocal->copy()->startOfDay();

            $period = CarbonPeriod::create($periodStart, $periodEnd);

            foreach ($period as $date) {
                if ((int) $date->dayOfWeek !== (int) $rule->dayOfWeek) {
                    continue;
                }

                if ($rule->validFrom && $date->lt($rule->validFrom)) {
                    continue;
                }

                if ($rule->validTo && $date->gt($rule->validTo)) {
                    continue;
                }

                $windowStart = Carbon::createFromFormat(
                    'Y-m-d H:i',
                    $date->toDateString().' '.$rule->startTime,
                    $timezone
                );
                $windowEnd = Carbon::createFromFormat(
                    'Y-m-d H:i',
                    $date->toDateString().' '.$rule->endTime,
                    $timezone
                );

                $slots = array_merge(
                    $slots,
                    $this->buildSlotsForWindow(
                        $windowStart,
                        $windowEnd,
                        $fromLocal,
                        $toLocal,
                        $durationMinutes,
                        $bufferBeforeMinutes,
                        $bufferAfterMinutes
                    )
                );
            }
        }

        $slots = $this->applyExceptions(
            $slots,
            $exceptions,
            $fromLocal,
            $toLocal,
            $durationMinutes,
            $bufferBeforeMinutes,
            $bufferAfterMinutes
        );
        $slots = $this->removeOverlapsWithAppointments(
            $slots,
            $doctorId,
            $fromLocal,
            $toLocal,
            $bufferBeforeMinutes,
            $bufferAfterMinutes,
            $ignoreAppointmentId
        );

        return $this->dedupeAndSort($slots);
    }

    /**
     * @return array<int, array{startAt: string, endAt: string}>
     */
    public function getSlots(string $doctorId, string $calendarId, Carbon $from, Carbon $to, AppointmentType $appointmentType): array
    {
        return array_map(
            fn (array $slot) => [
                'startAt' => $slot['startAt']->toIso8601String(),
                'endAt' => $slot['endAt']->toIso8601String(),
            ],
            $this->buildSlots($doctorId, $calendarId, $from, $to, $appointmentType)
        );
    }

    /**
     * @return array<int, array{startAt: string, endAt: string}>
     */
    public function getSlotBlocks(string $doctorId, string $calendarId, Carbon $from, Carbon $to, AppointmentType $appointmentType): array
    {
        return array_map(
            fn (array $slot) => [
                'startAt' => $slot['startAt']->toIso8601String(),
                'endAt' => $slot['endAt']->toIso8601String(),
            ],
            $this->mergeContiguousSlots(
                $this->buildSlots($doctorId, $calendarId, $from, $to, $appointmentType)
            )
        );
    }

    public function isSlotAvailable(
        string $doctorId,
        string $calendarId,
        Carbon $startAt,
        AppointmentType $appointmentType,
        ?string $ignoreAppointmentId = null
    ): bool
    {
        $durationMinutes = $this->durationMinutes($appointmentType);
        if ($durationMinutes <= 0) {
            return false;
        }

        $endAt = $startAt->copy()->addMinutes($durationMinutes);
        $slots = $this->buildSlots($doctorId, $calendarId, $startAt, $endAt, $appointmentType, $ignoreAppointmentId);
        $timezone = config('app.timezone', 'Europe/Paris');
        $startAtLocal = $startAt->copy()->setTimezone($timezone);
        $endAtLocal = $endAt->copy()->setTimezone($timezone);

        foreach ($slots as $slot) {
            if ($slot['startAt']->equalTo($startAtLocal) && $slot['endAt']->equalTo($endAtLocal)) {
                return true;
            }
        }

        return false;
    }

    private function durationMinutes(AppointmentType $appointmentType): int
    {
        return max((int) $appointmentType->durationMinutes, 0);
    }

    private function bufferBeforeMinutes(AppointmentType $appointmentType): int
    {
        return max((int) ($appointmentType->bufferBeforeMinutes ?? 0), 0);
    }

    private function bufferAfterMinutes(AppointmentType $appointmentType): int
    {
        return max((int) ($appointmentType->bufferAfterMinutes ?? 0), 0);
    }

    /**
     * @param array<int, array{startAt: Carbon, endAt: Carbon}> $slots
     * @return array<int, array{startAt: Carbon, endAt: Carbon}>
     */
    private function applyExceptions(
        array $slots,
        $exceptions,
        Carbon $fromLocal,
        Carbon $toLocal,
        int $durationMinutes,
        int $bufferBeforeMinutes,
        int $bufferAfterMinutes
    ): array
    {
        $timezone = config('app.timezone', 'Europe/Paris');

        foreach ($exceptions as $exception) {
            if (! $exception->date || ! $exception->startTime || ! $exception->endTime) {
                continue;
            }

            $start = Carbon::createFromFormat(
                'Y-m-d H:i',
                $exception->date->toDateString().' '.$exception->startTime,
                $timezone
            );
            $end = Carbon::createFromFormat(
                'Y-m-d H:i',
                $exception->date->toDateString().' '.$exception->endTime,
                $timezone
            );

            if ($exception->kind === 'add') {
                $slots = array_merge(
                    $slots,
                    $this->buildSlotsForWindow(
                        $start,
                        $end,
                        $fromLocal,
                        $toLocal,
                        $durationMinutes,
                        $bufferBeforeMinutes,
                        $bufferAfterMinutes
                    )
                );
                continue;
            }

            $slots = array_values(array_filter($slots, function (array $slot) use (
                $start,
                $end,
                $bufferBeforeMinutes,
                $bufferAfterMinutes
            ) {
                [$bufferedStart, $bufferedEnd] = $this->bufferedRange(
                    $slot['startAt'],
                    $slot['endAt'],
                    $bufferBeforeMinutes,
                    $bufferAfterMinutes
                );

                return ! ($bufferedStart->lt($end) && $bufferedEnd->gt($start));
            }));
        }

        return $slots;
    }

    /**
     * @param array<int, array{startAt: Carbon, endAt: Carbon}> $slots
     * @return array<int, array{startAt: Carbon, endAt: Carbon}>
     */
    private function removeOverlapsWithAppointments(
        array $slots,
        string $doctorId,
        Carbon $from,
        Carbon $to,
        int $bufferBeforeMinutes,
        int $bufferAfterMinutes,
        ?string $ignoreAppointmentId = null
    ): array
    {
        $queryFrom = $from->copy()->subMinutes($bufferBeforeMinutes);
        $queryTo = $to->copy()->addMinutes($bufferAfterMinutes);

        $appointmentsQuery = Appointment::query()
            ->where('doctorId', new ObjectId($doctorId))
            ->where('startAt', '<', $queryTo)
            ->where('endAt', '>', $queryFrom)
            ->whereNotIn('status', ['cancelled', 'canceled']);

        if ($ignoreAppointmentId) {
            $appointmentsQuery->where('_id', '!=', new ObjectId($ignoreAppointmentId));
        }

        $appointments = $appointmentsQuery->get();

        return array_values(array_filter($slots, function (array $slot) use (
            $appointments,
            $bufferBeforeMinutes,
            $bufferAfterMinutes
        ) {
            [$bufferedStart, $bufferedEnd] = $this->bufferedRange(
                $slot['startAt'],
                $slot['endAt'],
                $bufferBeforeMinutes,
                $bufferAfterMinutes
            );
            foreach ($appointments as $appointment) {
                if ($appointment->startAt < $bufferedEnd && $appointment->endAt > $bufferedStart) {
                    return false;
                }
            }

            return true;
        }));
    }

    /**
     * @param array<int, array{startAt: Carbon, endAt: Carbon}> $slots
     * @return array<int, array{startAt: Carbon, endAt: Carbon}>
     */
    private function dedupeAndSort(array $slots): array
    {
        $deduped = [];

        foreach ($slots as $slot) {
            $key = $slot['startAt']->format('c').'-'.$slot['endAt']->format('c');
            $deduped[$key] = $slot;
        }

        $slots = array_values($deduped);

        usort($slots, function (array $a, array $b) {
            return $a['startAt']->getTimestamp() <=> $b['startAt']->getTimestamp();
        });

        return $slots;
    }

    /**
     * @return array<int, array{startAt: Carbon, endAt: Carbon}>
     */
    private function buildSlotsForWindow(
        Carbon $windowStart,
        Carbon $windowEnd,
        Carbon $fromLocal,
        Carbon $toLocal,
        int $durationMinutes,
        int $bufferBeforeMinutes,
        int $bufferAfterMinutes
    ): array
    {
        if ($durationMinutes <= 0) {
            return [];
        }

        $slots = [];
        $slotStart = $windowStart->copy();

        while ($slotStart->copy()->addMinutes($durationMinutes)->lte($windowEnd)) {
            $slotEnd = $slotStart->copy()->addMinutes($durationMinutes);
            [$bufferedStart, $bufferedEnd] = $this->bufferedRange(
                $slotStart,
                $slotEnd,
                $bufferBeforeMinutes,
                $bufferAfterMinutes
            );

            if ($bufferedStart->lt($windowStart) || $bufferedEnd->gt($windowEnd)) {
                $slotStart->addMinutes($durationMinutes);
                continue;
            }

            if ($slotStart->lt($fromLocal) || $slotEnd->gt($toLocal)) {
                $slotStart->addMinutes($durationMinutes);
                continue;
            }

            $slots[] = [
                'startAt' => $slotStart->copy(),
                'endAt' => $slotEnd->copy(),
            ];

            $slotStart->addMinutes($durationMinutes);
        }

        return $slots;
    }

    /**
     * @return array{Carbon, Carbon}
     */
    private function bufferedRange(
        Carbon $slotStart,
        Carbon $slotEnd,
        int $bufferBeforeMinutes,
        int $bufferAfterMinutes
    ): array
    {
        $bufferedStart = $slotStart->copy()->subMinutes($bufferBeforeMinutes);
        $bufferedEnd = $slotEnd->copy()->addMinutes($bufferAfterMinutes);

        return [$bufferedStart, $bufferedEnd];
    }

    /**
     * @param array<int, array{startAt: Carbon, endAt: Carbon}> $slots
     * @return array<int, array{startAt: Carbon, endAt: Carbon}>
     */
    private function mergeContiguousSlots(array $slots): array
    {
        $slots = $this->dedupeAndSort($slots);

        $merged = [];

        foreach ($slots as $slot) {
            if (count($merged) === 0) {
                $merged[] = $slot;
                continue;
            }

            $lastIndex = count($merged) - 1;
            $last = $merged[$lastIndex];

            if ($slot['startAt']->lte($last['endAt'])) {
                if ($slot['endAt']->gt($last['endAt'])) {
                    $merged[$lastIndex]['endAt'] = $slot['endAt'];
                }
                continue;
            }

            $merged[] = $slot;
        }

        return $merged;
    }
}
