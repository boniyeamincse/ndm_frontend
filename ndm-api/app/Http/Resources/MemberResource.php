<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'mobile' => $this->mobile,
            'phone' => $this->phone,
            'institution' => $this->institution,
            'department' => $this->department,
            'session' => $this->session,
            'present_address' => $this->present_address,
            'permanent_address' => $this->permanent_address,
            'division' => $this->division,
            'district' => $this->district,
            'upazila' => $this->upazila,
            'union' => $this->union,
            'ward' => $this->ward,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'join_year' => $this->join_year,
            'status' => $this->status?->value ?? $this->status,
            'status_label' => $this->status?->label() ?? ucfirst((string) $this->status),
            'photo_url' => $this->photo_url,
            'organizational_unit' => $this->whenLoaded('organizationalUnit', function () {
                return [
                    'id' => $this->organizationalUnit->id,
                    'name' => $this->organizationalUnit->name,
                    'type' => $this->organizationalUnit->type?->value ?? $this->organizationalUnit->type,
                ];
            }),
            'positions' => $this->whenLoaded('positions', function () {
                return $this->positions->map(function ($position) {
                    return [
                        'id' => $position->id,
                        'role' => $position->role?->title,
                        'unit' => $position->unit?->name,
                        'is_active' => (bool) $position->is_active,
                        'assigned_at' => $position->assigned_at,
                    ];
                })->values();
            }),
            'member_role' => $this->whenLoaded('memberRole', function () {
                return [
                    'role' => $this->memberRole?->role,
                    'assigned_at' => $this->memberRole?->assigned_at,
                ];
            }),
            'committee_roles' => $this->whenLoaded('committeeRoles', function () {
                return $this->committeeRoles->map(function ($item) {
                    return [
                        'committee' => $item->committee?->name,
                        'role' => $item->role_name,
                        'assigned_at' => $item->assigned_at,
                    ];
                })->values();
            }),
        ];
    }
}
