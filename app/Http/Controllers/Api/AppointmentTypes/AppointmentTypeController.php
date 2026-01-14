<?php

namespace App\Http\Controllers\Api\AppointmentTypes;

use App\Http\Controllers\Controller;
use App\Http\Requests\AppointmentTypes\StoreAppointmentTypeRequest;
use App\Http\Requests\AppointmentTypes\UpdateAppointmentTypeRequest;
use App\Models\AppointmentType;
use App\Models\Calendar;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use MongoDB\BSON\ObjectId;

class AppointmentTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, string $calendarId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $calendar = Calendar::query()->where('_id', new ObjectId($calendarId))->first();
        if (! $calendar) {
            return response()->json(['message' => 'Calendar not found'], 404);
        }

        if (! $this->isAdmin($user)) {
            if ($calendar->scope === 'sams') {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $calendarDoctorId = $calendar->doctorId ? (string) $calendar->doctorId : null;
            $hasSpecialty = $calendar->specialtyId
                ? in_array((string) $calendar->specialtyId, $user->specialtyIds ?? [], true)
                : false;

            if ($calendarDoctorId !== $user->getKey() && ! $hasSpecialty) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $query = AppointmentType::query()->where('calendarId', new ObjectId($calendarId));
        if (! $this->isAdmin($user)) {
            $query->where('doctorId', new ObjectId($user->getKey()));
        }

        return response()->json([
            'message' => 'Appointment types loaded',
            'data' => $query->get(),
        ]);
    }

    public function store(StoreAppointmentTypeRequest $request, string $calendarId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $calendar = Calendar::query()->where('_id', new ObjectId($calendarId))->first();
        if (! $calendar) {
            return response()->json(['message' => 'Calendar not found'], 404);
        }

        if (! $this->isAdmin($user)) {
            if ($calendar->scope === 'sams') {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $calendarDoctorId = $calendar->doctorId ? (string) $calendar->doctorId : null;
            $hasSpecialty = $calendar->specialtyId
                ? in_array((string) $calendar->specialtyId, $user->specialtyIds ?? [], true)
                : false;

            if ($calendarDoctorId !== $user->getKey() && ! $hasSpecialty) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $data = $request->validated();
        $doctorId = $this->isAdmin($user)
            ? ($data['doctorId'] ?? ($calendar->doctorId ? (string) $calendar->doctorId : null))
            : $user->getKey();

        if (! $doctorId) {
            return response()->json([
                'message' => 'Doctor required',
                'errors' => ['doctorId' => ['Doctor is required']],
            ], 422);
        }

        if ($calendar->doctorId && (string) $calendar->doctorId !== $doctorId) {
            return response()->json([
                'message' => 'Calendar mismatch',
                'errors' => ['calendarId' => ['Calendar does not belong to this doctor']],
            ], 422);
        }

        $exists = AppointmentType::query()
            ->where('doctorId', new ObjectId($doctorId))
            ->where('calendarId', new ObjectId($calendarId))
            ->where('code', $data['code'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Appointment type code already exists',
                'errors' => ['code' => ['Appointment type code already exists']],
            ], 422);
        }

        $appointmentType = AppointmentType::query()->create([
            'doctorId' => $doctorId,
            'calendarId' => $calendarId,
            'specialtyId' => $data['specialtyId'] ?? $calendar->specialtyId,
            'code' => $data['code'],
            'label' => $data['label'],
            'durationMinutes' => $data['durationMinutes'],
            'bufferBeforeMinutes' => $data['bufferBeforeMinutes'] ?? 0,
            'bufferAfterMinutes' => $data['bufferAfterMinutes'] ?? 0,
            'isActive' => $data['isActive'] ?? true,
        ]);

        return response()->json([
            'message' => 'Appointment type created',
            'data' => $appointmentType,
        ]);
    }

    public function update(UpdateAppointmentTypeRequest $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $appointmentType = AppointmentType::query()->where('_id', new ObjectId($id))->first();
        if (! $appointmentType) {
            return response()->json(['message' => 'Appointment type not found'], 404);
        }

        if (! $this->isAdmin($user) && (string) $appointmentType->doctorId !== $user->getKey()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validated();
        if (isset($data['code'])) {
            $exists = AppointmentType::query()
                ->where('doctorId', new ObjectId((string) $appointmentType->doctorId))
                ->where('calendarId', new ObjectId((string) $appointmentType->calendarId))
                ->where('code', $data['code'])
                ->where('_id', '!=', new ObjectId($id))
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Appointment type code already exists',
                    'errors' => ['code' => ['Appointment type code already exists']],
                ], 422);
            }
        }

        $appointmentType->fill($data);
        $appointmentType->save();

        return response()->json([
            'message' => 'Appointment type updated',
            'data' => $appointmentType,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $appointmentType = AppointmentType::query()->where('_id', new ObjectId($id))->first();
        if (! $appointmentType) {
            return response()->json(['message' => 'Appointment type not found'], 404);
        }

        if (! $this->isAdmin($user) && (string) $appointmentType->doctorId !== $user->getKey()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $appointmentType->delete();

        return response()->json([
            'message' => 'Appointment type deleted',
            'data' => null,
        ]);
    }
}
