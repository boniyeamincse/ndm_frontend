<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOutreachCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message_body' => ['required', 'string'],
            'channel' => ['required', Rule::in(['sms', 'whatsapp', 'email'])],
            'audience_segment_id' => ['nullable', 'exists:audience_segments,id'],
            'custom_filters' => ['nullable', 'array'],
            'template_meta' => ['nullable', 'array'],
            'requires_approval' => ['nullable', 'boolean'],
            'scheduled_at' => ['nullable', 'date'],
        ];
    }
}