<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignPositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // guarded by AdminMiddleware at route level
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'role_id'   => ['required', 'integer', 'exists:roles,id'],
            'unit_id'   => ['required', 'integer', 'exists:organizational_units,id'],
            'notes'     => ['nullable', 'string', 'max:500'],
        ];
    }
}
