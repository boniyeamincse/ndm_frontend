<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'summary' => $this->summary,
            'campaign_type' => $this->campaign_type,
            'status' => $this->status?->value ?? $this->status,
            'status_label' => $this->status?->label() ?? ucfirst((string) $this->status),
            'objective' => $this->objective,
            'resource_plan' => $this->resource_plan,
            'messaging_tracks' => $this->messaging_tracks,
            'starts_on' => $this->starts_on?->toDateString(),
            'ends_on' => $this->ends_on?->toDateString(),
            'unit' => $this->whenLoaded('unit', fn () => [
                'id' => $this->unit?->id,
                'name' => $this->unit?->name,
            ]),
            'checkpoint_count' => $this->whenLoaded('checkpoints', fn () => $this->checkpoints->count()),
            'task_count' => $this->whenLoaded('tasks', fn () => $this->tasks->count()),
        ];
    }
}