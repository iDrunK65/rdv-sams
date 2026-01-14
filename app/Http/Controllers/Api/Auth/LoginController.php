<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::query()->where('identifier', $credentials['identifier'])->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (! $user->isActive) {
            return response()->json(['message' => 'User inactive'], 403);
        }

        if (! Auth::attempt(['identifier' => $credentials['identifier'], 'password' => $credentials['password']])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful',
            'data' => Auth::user(),
        ]);
    }
}
