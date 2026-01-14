<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetDoctorPasswordRequest;
use App\Http\Requests\Admin\StoreDoctorRequest;
use App\Http\Requests\Admin\UpdateDoctorRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use MongoDB\BSON\ObjectId;

class DoctorManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $doctors = User::query()->where('roles', 'doctor')->get();

        return response()->json([
            'message' => 'Doctors loaded',
            'data' => $doctors,
        ]);
    }

    public function store(StoreDoctorRequest $request): JsonResponse
    {
        $data = $request->validated();
        $doctor = User::query()->create([
            'identifier' => $data['identifier'],
            'password' => $data['password'],
            'name' => $data['name'] ?? null,
            'roles' => $data['roles'],
            'specialtyIds' => $data['specialtyIds'] ?? [],
            'isActive' => $data['isActive'] ?? true,
        ]);

        return response()->json([
            'message' => 'Doctor created',
            'data' => $doctor,
        ]);
    }

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

    public function update(UpdateDoctorRequest $request, string $doctorId): JsonResponse
    {
        $doctor = User::query()->where('_id', new ObjectId($doctorId))->first();
        if (! $doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $doctor->fill($request->validated());
        $doctor->save();

        return response()->json([
            'message' => 'Doctor updated',
            'data' => $doctor,
        ]);
    }

    public function resetPassword(ResetDoctorPasswordRequest $request, string $doctorId): JsonResponse
    {
        $doctor = User::query()->where('_id', new ObjectId($doctorId))->first();
        if (! $doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $doctor->password = $request->validated()['password'];
        $doctor->save();

        return response()->json([
            'message' => 'Password reset',
            'data' => $doctor,
        ]);
    }

    public function destroy(string $doctorId): JsonResponse
    {
        $doctor = User::query()->where('_id', new ObjectId($doctorId))->first();
        if (! $doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $doctor->delete();

        return response()->json([
            'message' => 'Doctor deleted',
            'data' => null,
        ]);
    }
}
