<?php

namespace App\Http\Requests;

use App\Enums\ElectionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreElectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // guarded by admin middleware at route level
    }

    public function rules(): array
    {
        return [
            'title'                 => ['required', 'string', 'max:255'],
            'description'           => ['nullable', 'string', 'max:2000'],
            'election_type'         => ['required', Rule::in(ElectionType::allowedValues())],
            'scope_unit_id'         => ['nullable', 'integer', 'exists:organizational_units,id'],
            'max_votes_per_member'  => ['sometimes', 'integer', 'min:1', 'max:100'],
            'min_proposers'         => ['sometimes', 'integer', 'min:1', 'max:10'],
            'nomination_start_at'   => ['nullable', 'date'],
            'nomination_end_at'     => ['nullable', 'date', 'after_or_equal:nomination_start_at'],
            'voting_start_at'       => ['nullable', 'date', 'after_or_equal:nomination_end_at'],
            'voting_end_at'         => ['nullable', 'date', 'after_or_equal:voting_start_at'],
        ];
    }
}
