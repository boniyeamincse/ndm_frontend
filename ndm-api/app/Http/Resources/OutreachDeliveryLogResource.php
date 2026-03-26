<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OutreachDeliveryLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'outreach_campaign_id' => $this->outreach_campaign_id,
            'member_id' => $this->member_id,
            'channel' => $this->channel,
            'status' => $this->status,
            'attempt_count' => (int) $this->attempt_count,
            'failure_reason' => $this->failure_reason,
            'sent_at' => $this->sent_at?->toDateTimeString(),
            'delivered_at' => $this->delivered_at?->toDateTimeString(),
            'opened_at' => $this->opened_at?->toDateTimeString(),
            'clicked_at' => $this->clicked_at?->toDateTimeString(),
        ];
    }
}