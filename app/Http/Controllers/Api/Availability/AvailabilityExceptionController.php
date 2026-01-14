<?php

namespace App\Http\Controllers\Api\Availability;

use App\Http\Controllers\Controller;
use App\Http\Requests\Availability\StoreAvailabilityExceptionRequest;
use App\Http\Requests\Availability\UpdateAvailabilityExceptionRequest;
use App\Models\AvailabilityException;
use App\Models\Calendar;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use MongoDB\BSON\ObjectId;

class AvailabilityExceptionController extends Controller
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

            if ((string) $calendar->doctorId !== $user->getKey()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $query = AvailabilityException::query()->where('calendarId', new ObjectId($calendarId));
        if (! $this->isAdmin($user)) {
            $query->where('doctorId', new ObjectId($user->getKey()));
        }

        return response()->json([
            'message' => 'Availability exceptions loaded',
            'data' => $query->get(),
        ]);
    }

    public function store(StoreAvailabilityExceptionRequest $request, string $calendarId): JsonResponse
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

            if ((string) $calendar->doctorId !== $user->getKey()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $doctorId = $this->isAdmin($user) ? (string) $calendar->doctorId : $user->getKey();
        if (! $doctorId) {
            return response()->json([
                'message' => 'Doctor required',
                'errors' => ['doctorId' => ['Doctor is required']],
            ], 422);
        }

        $data = $request->validated();
        $exception = AvailabilityException::query()->create([
            'doctorId' => $doctorId,
            'calendarId' => $calendarId,
            'date' => $data['date'],
            'kind' => $data['kind'],
            'startTime' => $data['startTime'],
            'endTime' => $data['endTime'],
            'reason' => $data['reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'Availability exception created',
            'data' => $exception,
        ]);
    }

    public function update(UpdateAvailabilityExceptionRequest $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $exception = AvailabilityException::query()->where('_id', new ObjectId($id))->first();
        if (! $exception) {
            return response()->json(['message' => 'Availability exception not found'], 404);
        }

        if (! $this->isAdmin($user)) {
            if ((string) $exception->doctorId !== $user->getKey()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $exception->fill($request->validated());
        $exception->save();

        return response()->json([
            'message' => 'Availability exception updated',
            'data' => $exception,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $exception = AvailabilityException::query()->where('_id', new ObjectId($id))->first();
        if (! $exception) {
            return response()->json(['message' => 'Availability exception not found'], 404);
        }

        if (! $this->isAdmin($user)) {
            if ((string) $exception->doctorId !== $user->getKey()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $exception->delete();

        return response()->json([
            'message' => 'Availability exception deleted',
            'data' => null,
        ]);
    }
}
