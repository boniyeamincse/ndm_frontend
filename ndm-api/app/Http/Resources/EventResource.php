<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'event_type' => $this->event_type,
            'status' => $this->status?->value ?? $this->status,
            'status_label' => $this->status?->label() ?? ucfirst((string) $this->status),
            'visibility' => $this->visibility,
            'venue' => $this->venue,
            'capacity' => $this->capacity,
            'starts_at' => $this->starts_at?->toDateTimeString(),
            'ends_at' => $this->ends_at?->toDateTimeString(),
            'published_at' => $this->published_at?->toDateTimeString(),
            'unit' => $this->whenLoaded('unit', fn () => [
                'id' => $this->unit?->id,
                'name' => $this->unit?->name,
            ]),
            'rsvp_count' => $this->whenLoaded('rsvps', fn () => $this->rsvps->count()),
            'attendance_count' => $this->whenLoaded('rsvps', fn () => $this->rsvps->whereIn('attendance_status', ['checked_in', 'checked_out'])->count()),
        ];
    }
}