<?php

namespace App\Http\Controllers\Api\BookingTokens;

use App\Http\Controllers\Controller;
use App\Models\Calendar;
use App\Models\User;
use App\Services\BookingTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use MongoDB\BSON\ObjectId;

class BookingTokenController extends Controller
{
    public function __construct(private BookingTokenService $bookingTokenService)
    {
    }

    public function store(Request $request, string $calendarId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $calendar = Calendar::query()->where('_id', new ObjectId($calendarId))->first();
        if (! $calendar) {
            return response()->json(['message' => 'Calendar not found'], 404);
        }

        if (! $calendar->doctorId) {
            return response()->json([
                'message' => 'Doctor required',
                'errors' => ['calendarId' => ['Calendar does not have a doctor']],
            ], 422);
        }

        if ($calendar->scope === 'sams') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (! $this->isAdmin($user) && (string) $calendar->doctorId !== $user->getKey()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $result = $this->bookingTokenService->generateForCalendar($calendar, $user);
        $plainToken = $result['token'];
        $bookingToken = $result['bookingToken'];
        $message = $calendar->message ? str_replace('{{TOKEN}}', $plainToken, $calendar->message) : null;

        return response()->json([
            'message' => 'Booking token created',
            'data' => [
                'token' => $plainToken,
                'message' => $message,
                'expiresAt' => $bookingToken->expiresAt->toIso8601String(),
            ],
        ]);
    }
}
