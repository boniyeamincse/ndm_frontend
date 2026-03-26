<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommunicationConnectorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'channel' => ['required', Rule::in(['sms', 'whatsapp', 'email'])],
            'provider' => ['required', 'string', 'max:255'],
            'credentials' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
            'health_status' => ['nullable', Rule::in(['healthy', 'degraded', 'down'])],
            'fallback_connector_id' => ['nullable', 'exists:communication_connectors,id'],
        ];
    }
}