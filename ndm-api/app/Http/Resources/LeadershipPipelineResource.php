<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadershipPipelineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'competency_level' => $this->competency_level,
            'readiness_score' => (int) $this->readiness_score,
            'mentorship_track' => $this->mentorship_track,
            'recommended_role' => $this->recommended_role,
            'eligible_for_promotion' => (bool) $this->eligible_for_promotion,
            'notes' => $this->notes,
            'member' => $this->whenLoaded('member', fn () => [
                'id' => $this->member?->id,
                'member_id' => $this->member?->member_id,
                'full_name' => $this->member?->full_name,
            ]),
        ];
    }
}