<?php

namespace App\Http\Requests\Availability;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAvailabilityRuleRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'dayOfWeek' => ['sometimes', 'integer', 'between:0,6'],
            'startTime' => ['sometimes', 'date_format:H:i'],
            'endTime' => ['sometimes', 'date_format:H:i'],
            'validFrom' => ['sometimes', 'nullable', 'date'],
            'validTo' => ['sometimes', 'nullable', 'date', 'after_or_equal:validFrom'],
            'timezone' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
