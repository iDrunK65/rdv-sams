<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDoctorRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string', Rule::unique('users', 'identifier')],
            'password' => ['required', 'string', 'min:8'],
            'name' => ['nullable', 'string'],
            'roles' => ['required', 'array'],
            'roles.*' => ['string'],
            'specialtyIds' => ['nullable', 'array'],
            'specialtyIds.*' => ['string', 'regex:/^[a-f0-9]{24}$/i'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
