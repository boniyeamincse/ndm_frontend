<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainingCourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'curriculum_outline' => $this->curriculum_outline,
            'organizational_unit_id' => $this->organizational_unit_id,
            'trainer_member_id' => $this->trainer_member_id,
            'starts_on' => $this->starts_on?->toDateString(),
            'ends_on' => $this->ends_on?->toDateString(),
            'status' => $this->status,
            'enrollments_count' => $this->whenCounted('enrollments'),
        ];
    }
}