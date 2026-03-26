<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainingEnrollmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'training_course_id' => $this->training_course_id,
            'member_id' => $this->member_id,
            'attendance_rate' => (int) $this->attendance_rate,
            'assessment_score' => (int) $this->assessment_score,
            'progress_percent' => (int) $this->progress_percent,
            'status' => $this->status,
            'enrolled_at' => $this->enrolled_at?->toDateTimeString(),
            'completed_at' => $this->completed_at?->toDateTimeString(),
            'course' => $this->whenLoaded('course', fn () => [
                'id' => $this->course?->id,
                'title' => $this->course?->title,
                'slug' => $this->course?->slug,
            ]),
            'member' => $this->whenLoaded('member', fn () => [
                'id' => $this->member?->id,
                'member_id' => $this->member?->member_id,
                'full_name' => $this->member?->full_name,
            ]),
            'certificate' => $this->whenLoaded('certificate', fn () => [
                'id' => $this->certificate?->id,
                'verification_id' => $this->certificate?->verification_id,
                'issued_at' => $this->certificate?->issued_at?->toDateTimeString(),
                'revoked_at' => $this->certificate?->revoked_at?->toDateTimeString(),
            ]),
        ];
    }
}