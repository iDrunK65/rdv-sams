<?php

namespace App\Http\Requests\Patient;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GetPatientAvailabilitySlotsRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'doctorId' => ['required', 'string', 'regex:/^[a-f0-9]{24}$/i'],
            'calendarId' => ['required', 'string', 'regex:/^[a-f0-9]{24}$/i'],
            'appointmentTypeId' => ['required', 'string', 'regex:/^[a-f0-9]{24}$/i'],
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ];
    }
}
