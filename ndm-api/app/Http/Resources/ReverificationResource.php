<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReverificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'profile_update_payload' => $this->profile_update_payload,
            'document_recheck_required' => (bool) $this->document_recheck_required,
            'unit_confirmation_required' => (bool) $this->unit_confirmation_required,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at?->toDateTimeString(),
            'processed_at' => $this->processed_at?->toDateTimeString(),
            'admin_note' => $this->admin_note,
            'member' => $this->whenLoaded('member', fn () => [
                'id' => $this->member?->id,
                'member_id' => $this->member?->member_id,
                'full_name' => $this->member?->full_name,
            ]),
        ];
    }
}