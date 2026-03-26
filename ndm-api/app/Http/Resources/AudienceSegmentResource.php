<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AudienceSegmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'segment_type' => $this->segment_type,
            'filters' => $this->filters,
            'is_active' => (bool) $this->is_active,
            'campaigns_count' => $this->whenCounted('campaigns'),
        ];
    }
}