<?php

namespace App\Http\Requests;

use App\Enums\Gender;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

/**
 * Validates member's own profile update.
 * Blocked fields: member_id, status, join_year, user_id, approved_by
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Route is already protected by auth:api
    }

    public function rules(): array
    {
        return [
            'full_name'   => ['sometimes', 'string', 'max:191'],
            'father_name' => ['sometimes', 'nullable', 'string', 'max:191'],
            'mother_name' => ['sometimes', 'nullable', 'string', 'max:191'],
            'date_of_birth' => ['sometimes', 'nullable', 'date', 'before:today'],
            'gender'      => ['sometimes', 'nullable', new Enum(Gender::class)],
            'blood_group' => ['sometimes', 'nullable', 'string', 'max:5'],
            'mobile'      => [
                'sometimes', 'nullable', 'string',
                'regex:/^(\+8801|01)[3-9]\d{8}$/',
                'unique:members,mobile,' . $this->user()->member?->id,
            ],
            'phone'       => ['sometimes', 'nullable', 'string', 'max:20'],
            'present_address'   => ['sometimes', 'nullable', 'string', 'max:500'],
            'permanent_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'emergency_contact_name'  => ['sometimes', 'nullable', 'string', 'max:191'],
            'emergency_contact_phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'institution' => ['sometimes', 'nullable', 'string', 'max:255'],
            'department'  => ['sometimes', 'nullable', 'string', 'max:191'],
            'session'     => ['sometimes', 'nullable', 'string', 'max:20'],
            'skills'      => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}
