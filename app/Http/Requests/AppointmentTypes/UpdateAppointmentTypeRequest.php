<?php

namespace App\Http\Requests\AppointmentTypes;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentTypeRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['sometimes', 'string'],
            'label' => ['sometimes', 'string'],
            'durationMinutes' => ['sometimes', 'integer', 'min:1'],
            'bufferBeforeMinutes' => ['sometimes', 'integer', 'min:0'],
            'bufferAfterMinutes' => ['sometimes', 'integer', 'min:0'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
