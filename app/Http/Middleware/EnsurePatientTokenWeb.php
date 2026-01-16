<?php

namespace App\Http\Middleware;

use App\Services\PatientTokenService;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EnsurePatientTokenWeb
{
    public function __construct(private PatientTokenService $patientTokenService)
    {
    }

    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $cookieValue = $this->patientTokenService->getCookieValue($request);
        if (! $cookieValue) {
            return redirect('/');
        }

        $bookingToken = $this->patientTokenService->resolveValidTokenFromCookie($cookieValue);
        if (! $bookingToken) {
            return redirect('/')->withCookie(cookie()->forget(PatientTokenService::COOKIE_NAME));
        }

        $request->attributes->set('bookingToken', $bookingToken);
        $request->attributes->set(
            'patientTokenContext',
            $this->patientTokenService->buildContext($bookingToken)
        );

        return $next($request);
    }
}
