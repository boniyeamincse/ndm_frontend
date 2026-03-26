<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'campaign_id' => $this->donation_campaign_id,
            'campaign_title' => $this->campaign?->title,
            'member' => $this->member ? [
                'id' => $this->member->id,
                'full_name' => $this->member->full_name,
            ] : null,
            'donor_name' => $this->donor_name,
            'donor_email' => $this->donor_email,
            'donor_mobile' => $this->donor_mobile,
            'amount' => $this->amount,
            'payment_channel' => $this->payment_channel,
            'payment_reference' => $this->payment_reference,
            'transaction_id' => $this->transaction_id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->color(),
            'verified_at' => $this->verified_at?->toDateTimeString(),
            'verifier_name' => $this->verifier?->name,
            'verification_note' => $this->verification_note,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
