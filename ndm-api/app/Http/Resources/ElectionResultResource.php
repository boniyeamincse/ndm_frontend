<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ElectionResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'election_id'       => $this->election_id,
            'rank'              => $this->rank,
            'vote_count'        => $this->vote_count,
            'is_winner'         => $this->is_winner,
            'tie_break_method'  => $this->tie_break_method,
            'notes'             => $this->notes,
            'declared_at'       => $this->declared_at?->toDateTimeString(),
            'nomination'        => $this->whenLoaded('nomination', fn() => [
                'id'             => $this->nomination->id,
                'position_title' => $this->nomination->position_title,
                'candidate'      => $this->nomination->candidate ? [
                    'id'        => $this->nomination->candidate->id,
                    'member_id' => $this->nomination->candidate->member_id,
                    'full_name' => $this->nomination->candidate->full_name,
                    'photo_url' => $this->nomination->candidate->photo_url ?? null,
                ] : null,
            ]),
        ];
    }
}
