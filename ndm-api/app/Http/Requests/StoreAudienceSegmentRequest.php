<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAudienceSegmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $segmentId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('audience_segments', 'slug')->ignore($segmentId)],
            'description' => ['nullable', 'string'],
            'segment_type' => ['required', Rule::in(['all_members', 'role_based', 'unit_based', 'status_based', 'custom'])],
            'filters' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}