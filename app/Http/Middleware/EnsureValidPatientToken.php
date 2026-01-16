<?php

namespace App\Http\Middleware;

use App\Services\PatientTokenService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureValidPatientToken
{
    public function __construct(private PatientTokenService $patientTokenService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $cookieValue = $this->patientTokenService->getCookieValue($request);
        if (! $cookieValue) {
            return response()->json(['message' => 'Patient token required'], 401);
        }

        $bookingToken = $this->patientTokenService->resolveValidTokenFromCookie($cookieValue);
        if (! $bookingToken) {
            return $this->reject();
        }

        $request->attributes->set('bookingToken', $bookingToken);
        $request->attributes->set(
            'patientTokenContext',
            $this->patientTokenService->buildContext($bookingToken)
        );

        return $next($request);
    }

    private function reject(): Response
    {
        $response = response()->json(['message' => 'Invalid or expired patient token'], 401);

        return $response->withCookie(cookie()->forget(PatientTokenService::COOKIE_NAME));
    }
}
