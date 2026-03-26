<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunicationConnectorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'channel' => $this->channel,
            'provider' => $this->provider,
            'is_active' => (bool) $this->is_active,
            'health_status' => $this->health_status,
            'fallback_connector_id' => $this->fallback_connector_id,
            'last_health_checked_at' => $this->last_health_checked_at?->toDateTimeString(),
        ];
    }
}