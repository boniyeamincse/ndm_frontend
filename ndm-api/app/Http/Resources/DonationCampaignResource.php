<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonationCampaignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'target_amount' => $this->target_amount,
            'current_amount' => $this->current_amount,
            'starts_at' => $this->starts_at->toDateTimeString(),
            'ends_at' => $this->ends_at?->toDateTimeString(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'unit' => $this->unit ? [
                'id' => $this->unit->id,
                'name' => $this->unit->name,
            ] : null,
            'donations_count' => $this->donations_count ?? $this->donations()->count(),
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
