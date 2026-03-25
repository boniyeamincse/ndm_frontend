<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'unit_type'   => $this->unit_type?->value,
            'unit_type_label' => $this->unit_type?->label(),
            'rank_order'  => $this->rank_order,
            'description' => $this->description,
            'is_active'   => (bool) $this->is_active,
            'permissions' => $this->whenLoaded('permissions', fn() =>
                $this->permissions->map(fn($p) => [
                    'id'    => $p->id,
                    'name'  => $p->name,
                    'group' => $p->group,
                ])->values()
            ),
            'created_by' => $this->whenLoaded('createdBy', fn() => [
                'id'    => $this->createdBy->id,
                'email' => $this->createdBy->email,
            ]),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
