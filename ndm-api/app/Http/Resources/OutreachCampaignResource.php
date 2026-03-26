<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OutreachCampaignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subject' => $this->subject,
            'channel' => $this->channel,
            'status' => $this->status,
            'audience_segment_id' => $this->audience_segment_id,
            'custom_filters' => $this->custom_filters,
            'scheduled_at' => $this->scheduled_at?->toDateTimeString(),
            'sent_at' => $this->sent_at?->toDateTimeString(),
            'recipient_estimate' => (int) $this->recipient_estimate,
            'sent_count' => (int) $this->sent_count,
            'failed_count' => (int) $this->failed_count,
            'opened_count' => (int) $this->opened_count,
            'clicked_count' => (int) $this->clicked_count,
            'requires_approval' => (bool) $this->requires_approval,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toDateTimeString(),
        ];
    }
}