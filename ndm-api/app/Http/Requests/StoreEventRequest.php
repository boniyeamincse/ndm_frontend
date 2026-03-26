<?php

namespace App\Http\Requests;

use App\Enums\EventStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'event_type' => ['required', Rule::in(['seminar', 'rally', 'meeting', 'campus_program', 'training', 'other'])],
            'status' => ['sometimes', Rule::in(EventStatus::allowedValues())],
            'visibility' => ['sometimes', Rule::in(['public', 'members_only', 'private'])],
            'organizational_unit_id' => ['nullable', 'integer', 'exists:organizational_units,id'],
            'venue' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'requires_approval' => ['sometimes', 'boolean'],
        ];
    }
}