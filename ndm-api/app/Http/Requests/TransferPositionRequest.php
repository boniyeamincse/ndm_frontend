<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferPositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // guarded by AdminMiddleware at route level
    }

    public function rules(): array
    {
        return [
            'new_member_id' => ['required', 'integer', 'exists:members,id'],
            'notes'         => ['nullable', 'string', 'max:500'],
        ];
    }
}
