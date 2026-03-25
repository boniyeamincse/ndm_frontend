<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberPublicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'member_id' => $this->member_id,
            'full_name' => $this->full_name,
            'institution' => $this->institution,
            'join_year' => $this->join_year,
            'photo_url' => $this->photo_url,
            'unit' => $this->whenLoaded('unit', function () {
                return [
                    'id' => $this->unit->id,
                    'name' => $this->unit->name,
                    'type' => $this->unit->type?->value ?? $this->unit->type,
                ];
            }),
            'positions' => $this->whenLoaded('positions', function () {
                return $this->positions
                    ->map(function ($position) {
                        return [
                            'role' => $position->role?->title,
                            'unit' => $position->unit?->name,
                            'since' => $position->assigned_at?->toDateString(),
                            'rank_order' => $position->role?->rank_order,
                        ];
                    })
                    ->sortBy('rank_order')
                    ->values();
            }),
        ];
    }
}
