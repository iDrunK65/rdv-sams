<?php

namespace App\Http\Controllers\Api\Doctors;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use MongoDB\BSON\ObjectId;

class DoctorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $doctors = User::query()
            ->where('isActive', true)
            ->where('roles', 'doctor')
            ->get();

        return response()->json([
            'message' => 'Doctors loaded',
            'data' => $doctors,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $doctorId): JsonResponse
    {
        $doctor = User::query()->where('_id', new ObjectId($doctorId))->first();
        if (! $doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        return response()->json([
            'message' => 'Doctor loaded',
            'data' => $doctor,
        ]);
    }

    public function showPatient(Request $request, string $doctorId): JsonResponse
    {
        $bookingToken = $request->attributes->get('bookingToken');
        if ($bookingToken && (string) $bookingToken->doctorId !== $doctorId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $doctor = User::query()
            ->where('_id', new ObjectId($doctorId))
            ->where('isActive', true)
            ->where('roles', 'doctor')
            ->first();

        if (! $doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        return response()->json([
            'message' => 'Doctor loaded',
            'data' => $doctor,
        ]);
    }
}
