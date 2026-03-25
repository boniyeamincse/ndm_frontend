<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:users,email|max:191',
            'password' => 'required|string|min:8|confirmed',
            'full_name' => 'required|string|max:191',
            'phone' => 'nullable|string|max:20',
            'institution' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:191',
            'session' => 'nullable|string|max:20',
            'unit_id' => 'nullable|exists:organizational_units,id',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'present_address' => 'nullable|string',
        ];
    }
}
