<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CastVoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // auth + active.member enforced at route level
    }

    public function rules(): array
    {
        return [
            'nomination_ids'   => ['required', 'array', 'min:1'],
            'nomination_ids.*' => ['required', 'integer', 'exists:election_nominations,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nomination_ids.required'   => 'You must select at least one candidate to vote for.',
            'nomination_ids.*.exists'   => 'One or more selected nominees are invalid.',
        ];
    }
}
