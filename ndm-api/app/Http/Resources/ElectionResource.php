<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ElectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'title'                 => $this->title,
            'description'           => $this->description,
            'election_type'         => $this->election_type?->value,
            'election_type_label'   => $this->election_type?->label(),
            'status'                => $this->status?->value,
            'status_label'          => $this->status?->label(),
            'max_votes_per_member'  => $this->max_votes_per_member,
            'min_proposers'         => $this->min_proposers,
            'nomination_start_at'   => $this->nomination_start_at?->toDateTimeString(),
            'nomination_end_at'     => $this->nomination_end_at?->toDateTimeString(),
            'voting_start_at'       => $this->voting_start_at?->toDateTimeString(),
            'voting_end_at'         => $this->voting_end_at?->toDateTimeString(),
            'result_published_at'   => $this->result_published_at?->toDateTimeString(),
            'scope_unit'            => $this->whenLoaded('scopeUnit', fn() => [
                'id'   => $this->scopeUnit->id,
                'name' => $this->scopeUnit->name,
            ]),
            'total_nominations'     => $this->whenLoaded('nominations', fn() => $this->nominations->count()),
            'total_votes_cast'      => $this->when(
                $this->relationLoaded('voterReceipts'),
                fn() => $this->voterReceipts->count()
            ),
            'created_by'            => $this->whenLoaded('creator', fn() => [
                'id'    => $this->creator->id,
                'name'  => $this->creator->name,
            ]),
            'created_at'            => $this->created_at?->toDateTimeString(),
            'updated_at'            => $this->updated_at?->toDateTimeString(),
        ];
    }
}
