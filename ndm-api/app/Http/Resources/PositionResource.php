<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PositionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'member_id'   => $this->member_id,
            'is_active'   => (bool) $this->is_active,
            'assigned_at' => $this->assigned_at?->toDateTimeString(),
            'relieved_at' => $this->relieved_at?->toDateTimeString(),
            'notes'       => $this->notes,
            'role' => $this->whenLoaded('role', fn() => $this->role ? [
                'id'         => $this->role->id,
                'title'      => $this->role->title,
                'rank_order' => $this->role->rank_order,
                'unit_type'  => $this->role->unit_type?->value,
            ] : null),
            'unit' => $this->whenLoaded('unit', fn() => $this->unit ? [
                'id'   => $this->unit->id,
                'name' => $this->unit->name,
                'type' => $this->unit->type?->value,
                'type_label' => $this->unit->type?->label(),
            ] : null),
            'member' => $this->whenLoaded('member', fn() => $this->member ? [
                'id'        => $this->member->id,
                'member_id' => $this->member->member_id,
                'full_name' => $this->member->full_name,
                'photo_url' => $this->member->photo_url,
            ] : null),
            'assigned_by' => $this->whenLoaded('assignedBy', fn() => $this->assignedBy ? [
                'id'    => $this->assignedBy->id,
                'email' => $this->assignedBy->email,
            ] : null),
        ];
    }
}
