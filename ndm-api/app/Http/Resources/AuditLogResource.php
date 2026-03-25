<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'action'       => $this->action,
            'model_type'   => $this->model_type,
            'model_id'     => $this->model_id,
            'old_values'   => $this->old_values,
            'new_values'   => $this->new_values,
            'ip_address'   => $this->ip_address,
            'notes'        => $this->notes,
            'performed_at' => $this->performed_at?->toDateTimeString(),
            'actor'        => $this->whenLoaded('user', fn() => $this->user ? [
                'id'    => $this->user->id,
                'email' => $this->user->email,
                'type'  => $this->user->user_type,
            ] : null),
        ];
    }
}
