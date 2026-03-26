<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNominationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // auth enforced at route level
    }

    public function rules(): array
    {
        return [
            'election_id'           => ['required', 'integer', 'exists:elections,id'],
            'proposer_id'           => ['nullable', 'integer', 'exists:members,id'],
            'seconder_id'           => ['nullable', 'integer', 'exists:members,id'],
            'position_title'        => ['nullable', 'string', 'max:255'],
            'candidate_statement'   => ['nullable', 'string', 'max:3000'],
        ];
    }

    public function messages(): array
    {
        return [
            'election_id.exists'  => 'The selected election does not exist.',
            'proposer_id.exists'  => 'The selected proposer is not a valid member.',
            'seconder_id.exists'  => 'The selected seconder is not a valid member.',
        ];
    }
}
