<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipRenewalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'renewal_year' => $this->renewal_year,
            'renewal_window_start' => $this->renewal_window_start?->toDateString(),
            'renewal_window_end' => $this->renewal_window_end?->toDateString(),
            'fee_amount' => $this->fee_amount,
            'payment_reference' => $this->payment_reference,
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