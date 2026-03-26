<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeadershipPipelineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'exists:members,id'],
            'competency_level' => ['required', Rule::in(['foundation', 'intermediate', 'advanced', 'strategic'])],
            'readiness_score' => ['nullable', 'integer', 'between:0,100'],
            'mentorship_track' => ['nullable', 'string', 'max:255'],
            'recommended_role' => ['nullable', 'string', 'max:255'],
            'eligible_for_promotion' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }
}