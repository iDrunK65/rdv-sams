<?php

namespace App\Http\Requests\Availability;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAvailabilityExceptionRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date' => ['sometimes', 'date'],
            'kind' => ['sometimes', 'string'],
            'startTime' => ['sometimes', 'date_format:H:i'],
            'endTime' => ['sometimes', 'date_format:H:i'],
            'reason' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
