<?php

namespace App\Http\Requests\Appointments;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TransferAppointmentRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'toDoctorId' => ['required', 'string', 'regex:/^[a-f0-9]{24}$/i'],
            'reason' => ['nullable', 'string'],
        ];
    }
}
