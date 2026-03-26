<?php

namespace App\Http\Requests;

use App\Enums\CampaignStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string', 'max:4000'],
            'campaign_type' => ['required', Rule::in(['digital', 'field', 'hybrid'])],
            'status' => ['sometimes', Rule::in(CampaignStatus::allowedValues())],
            'objective' => ['nullable', 'string', 'max:3000'],
            'resource_plan' => ['nullable', 'array'],
            'messaging_tracks' => ['nullable', 'array'],
            'organizational_unit_id' => ['nullable', 'integer', 'exists:organizational_units,id'],
            'owner_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'starts_on' => ['nullable', 'date'],
            'ends_on' => ['nullable', 'date', 'after_or_equal:starts_on'],
            'checkpoints' => ['nullable', 'array'],
            'checkpoints.*.title' => ['required_with:checkpoints', 'string', 'max:255'],
            'checkpoints.*.notes' => ['nullable', 'string', 'max:1000'],
            'checkpoints.*.due_date' => ['nullable', 'date'],
        ];
    }
}