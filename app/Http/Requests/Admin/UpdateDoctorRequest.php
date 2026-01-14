<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDoctorRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $doctorId = $this->route('doctorId') ?? $this->route('id');

        return [
            'identifier' => ['sometimes', 'string', Rule::unique('users', 'identifier')->ignore($doctorId, '_id')],
            'name' => ['sometimes', 'nullable', 'string'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['string'],
            'specialtyIds' => ['sometimes', 'array'],
            'specialtyIds.*' => ['string', 'regex:/^[a-f0-9]{24}$/i'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
