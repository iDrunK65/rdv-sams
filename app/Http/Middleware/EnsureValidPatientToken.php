<?php

namespace App\Http\Middleware;

use App\Models\BookingToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureValidPatientToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $plainToken = $request->cookie('patient_token');

        if (! $plainToken) {
            return response()->json(['message' => 'Patient token required'], 401);
        }

        $hash = hash('sha256', $plainToken);
        $bookingToken = BookingToken::query()->where('tokenHash', $hash)->first();

        if (! $bookingToken) {
            return $this->reject();
        }

        $now = now('UTC');
        if (! $bookingToken->expiresAt || $bookingToken->expiresAt->lte($now) || $bookingToken->usedAt !== null) {
            return $this->reject();
        }

        $request->attributes->set('bookingToken', $bookingToken);

        return $next($request);
    }

    private function reject(): Response
    {
        $response = response()->json(['message' => 'Invalid or expired patient token'], 401);

        return $response->withCookie(cookie()->forget('patient_token'));
    }
}
