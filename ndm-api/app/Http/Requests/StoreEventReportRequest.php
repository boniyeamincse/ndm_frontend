<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'summary' => ['required', 'string', 'max:5000'],
            'outcomes' => ['nullable', 'string', 'max:4000'],
            'attendance_insights' => ['nullable', 'string', 'max:3000'],
            'budget_effort_notes' => ['nullable', 'string', 'max:3000'],
            'approval_status' => ['sometimes', Rule::in(['pending', 'approved', 'rejected'])],
            'moderation_notes' => ['nullable', 'string', 'max:2000'],
            'media' => ['nullable', 'array'],
            'media.*.media_type' => ['required_with:media', Rule::in(['image', 'video', 'document'])],
            'media.*.title' => ['nullable', 'string', 'max:255'],
            'media.*.file_path' => ['required_with:media', 'string', 'max:500'],
            'media.*.caption' => ['nullable', 'string', 'max:1000'],
            'media.*.is_public' => ['sometimes', 'boolean'],
            'media.*.moderation_status' => ['sometimes', Rule::in(['pending', 'approved', 'rejected'])],
        ];
    }
}