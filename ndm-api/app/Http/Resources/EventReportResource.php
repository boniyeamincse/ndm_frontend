<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'summary' => $this->summary,
            'outcomes' => $this->outcomes,
            'attendance_insights' => $this->attendance_insights,
            'budget_effort_notes' => $this->budget_effort_notes,
            'approval_status' => $this->approval_status,
            'submitted_at' => $this->submitted_at?->toDateTimeString(),
            'approved_at' => $this->approved_at?->toDateTimeString(),
            'moderation_notes' => $this->moderation_notes,
            'media' => $this->whenLoaded('media', fn () => $this->media->map(fn ($item) => [
                'id' => $item->id,
                'media_type' => $item->media_type,
                'title' => $item->title,
                'file_path' => $item->file_path,
                'caption' => $item->caption,
                'is_public' => $item->is_public,
                'moderation_status' => $item->moderation_status,
            ])->values()),
        ];
    }
}