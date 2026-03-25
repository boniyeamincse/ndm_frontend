<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationalUnitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'code'        => $this->code,
            'type'        => $this->type?->value,
            'type_label'  => $this->type?->label(),
            'description' => $this->description,
            'is_active'   => (bool) $this->is_active,
            'parent_id'   => $this->parent_id,
            'parent'      => $this->whenLoaded('parent', fn() => $this->parent ? [
                'id'   => $this->parent->id,
                'name' => $this->parent->name,
                'type' => $this->parent->type?->value,
            ] : null),
            'children' => $this->whenLoaded('children', fn() =>
                OrganizationalUnitResource::collection($this->children)
            ),
            'members_count' => $this->whenCounted('members'),
            'created_at'    => $this->created_at?->toDateTimeString(),
            'updated_at'    => $this->updated_at?->toDateTimeString(),
        ];
    }
}
