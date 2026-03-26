<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReverificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'profile_update_payload' => ['nullable', 'array'],
            'document_recheck_required' => ['sometimes', 'boolean'],
            'unit_confirmation_required' => ['sometimes', 'boolean'],
        ];
    }
}