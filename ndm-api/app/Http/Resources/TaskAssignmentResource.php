<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'task_id'       => $this->task_id,
            'member_id'     => $this->member_id,
            'status'        => $this->status,
            'progress_note' => $this->progress_note,
            'completed_at'  => $this->completed_at?->toDateTimeString(),
            'task'   => $this->whenLoaded('task', fn() => $this->task ? [
                'id'       => $this->task->id,
                'title'    => $this->task->title,
                'status'   => $this->task->status,
                'priority' => $this->task->priority,
                'due_date' => $this->task->due_date?->toDateString(),
            ] : null),
            'member' => $this->whenLoaded('member', fn() => $this->member ? [
                'id'        => $this->member->id,
                'member_id' => $this->member->member_id,
                'full_name' => $this->member->full_name,
                'photo_url' => $this->member->photo_url,
            ] : null),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
