<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMembershipRenewalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'renewal_year' => ['required', 'integer', 'min:2020', 'max:2100'],
            'fee_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'renewal_window_start' => ['nullable', 'date'],
            'renewal_window_end' => ['nullable', 'date', 'after_or_equal:renewal_window_start'],
        ];
    }
}