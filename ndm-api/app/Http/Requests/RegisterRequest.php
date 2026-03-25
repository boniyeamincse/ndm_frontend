<?php

namespace App\Http\Requests;

use App\Enums\Gender;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

/**
 * Production-grade registration request validation.
 *
 * OWASP measures:
 *  - Email uniqueness checked against users table
 *  - Password strength enforced via Password::defaults()
 *  - Mobile telephone validated against Bangladesh +880 format
 *  - NID validated for correct digit length (10/13/17)
 *  - File uploads restricted by MIME type and size
 *  - Admin role CANNOT be assigned here — defaults to 'member' in controller
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Account fields ────────────────────────────────────────
            'email'    => ['required', 'string', 'email:rfc', 'max:191', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],

            // ── Personal fields ───────────────────────────────────────
            'full_name'   => ['required', 'string', 'max:191'],
            'father_name' => ['nullable', 'string', 'max:191'],
            'mother_name' => ['nullable', 'string', 'max:191'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender'      => ['nullable', new Enum(Gender::class)],
            'nid_or_bc'   => ['nullable', 'string', 'regex:/^(\d{10}|\d{13}|\d{17})$/'],
            'blood_group' => ['nullable', 'string', 'max:5'],

            // ── Contact fields ────────────────────────────────────────
            // Bangladesh mobile: starts with +8801 or 01, digit 3-9 (operator), 8 digits
            'mobile'  => ['required', 'string', 'regex:/^(\+8801|01)[3-9]\d{8}$/', 'unique:members,mobile'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'present_address'   => ['nullable', 'string', 'max:500'],
            'permanent_address' => ['nullable', 'string', 'max:500'],

            // ── Emergency contact ─────────────────────────────────────
            'emergency_contact_name'  => ['nullable', 'string', 'max:191'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],

            // ── Education fields ──────────────────────────────────────
            'institution' => ['nullable', 'string', 'max:255'],
            'department'  => ['nullable', 'string', 'max:191'],
            'session'     => ['nullable', 'string', 'max:20'],
            'skills'      => ['nullable', 'string', 'max:1000'],

            // ── Organizational unit ───────────────────────────────────
            'organizational_unit_id' => ['nullable', 'integer', 'exists:organizational_units,id'],

            // ── File uploads ──────────────────────────────────────────
            'photo'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'nid_doc'        => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'student_id_doc' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'mobile.regex' => 'Mobile number must be a valid Bangladesh number (+8801XXXXXXXX or 01XXXXXXXX).',
            'nid_or_bc.regex' => 'NID/Birth Certificate must be 10, 13, or 17 digits.',
            'email.email' => 'Please provide a valid email address.',
        ];
    }
}
