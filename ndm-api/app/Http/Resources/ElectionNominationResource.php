<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ElectionNominationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'election_id'           => $this->election_id,
            'position_title'        => $this->position_title,
            'candidate_statement'   => $this->candidate_statement,
            'status'                => $this->status?->value,
            'status_label'          => $this->status?->label(),
            'is_published'          => $this->is_published,
            'rejection_reason'      => $this->when(
                in_array($this->status?->value, ['rejected']),
                $this->rejection_reason
            ),
            'candidate'             => $this->whenLoaded('candidate', fn() => [
                'id'        => $this->candidate->id,
                'member_id' => $this->candidate->member_id,
                'full_name' => $this->candidate->full_name,
                'photo_url' => $this->candidate->photo_url ?? null,
            ]),
            'proposer'              => $this->whenLoaded('proposer', fn() => $this->proposer ? [
                'id'        => $this->proposer->id,
                'full_name' => $this->proposer->full_name,
            ] : null),
            'seconder'              => $this->whenLoaded('seconder', fn() => $this->seconder ? [
                'id'        => $this->seconder->id,
                'full_name' => $this->seconder->full_name,
            ] : null),
            'vote_count'            => $this->when(
                $this->relationLoaded('voteEntries'),
                fn() => $this->voteEntries->count()
            ),
            'reviewed_at'           => $this->reviewed_at?->toDateTimeString(),
            'created_at'            => $this->created_at?->toDateTimeString(),
        ];
    }
}
