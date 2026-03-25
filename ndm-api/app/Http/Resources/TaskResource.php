<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'description'    => $this->description,
            'status'         => $this->status,
            'priority'       => $this->priority,
            'due_date'       => $this->due_date?->toDateString(),
            'parent_task_id' => $this->parent_task_id,
            'parent_task'    => $this->whenLoaded('parent', fn() => $this->parent ? [
                'id'    => $this->parent->id,
                'title' => $this->parent->title,
            ] : null),
            'sub_tasks' => $this->whenLoaded('subTasks', fn() =>
                TaskResource::collection($this->subTasks)
            ),
            'assignments' => $this->whenLoaded('assignments', fn() =>
                $this->assignments->map(fn($a) => [
                    'id'            => $a->id,
                    'member_id'     => $a->member_id,
                    'member_name'   => $a->member?->full_name,
                    'status'        => $a->status,
                    'progress_note' => $a->progress_note,
                    'completed_at'  => $a->completed_at?->toDateTimeString(),
                ])->values()
            ),
            'assigned_count' => $this->whenCounted('assignments'),
            'created_by'     => $this->whenLoaded('creator', fn() => $this->creator ? [
                'id'    => $this->creator->id,
                'email' => $this->creator->email,
            ] : null),
            'created_at'  => $this->created_at?->toDateTimeString(),
            'updated_at'  => $this->updated_at?->toDateTimeString(),
            'deleted_at'  => $this->deleted_at?->toDateTimeString(),
        ];
    }
}
