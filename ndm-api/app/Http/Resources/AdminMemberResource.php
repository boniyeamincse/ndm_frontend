<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin-facing member resource — includes sensitive fields,
 * approval metadata, and document paths for review workflows.
 */
class AdminMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'member_id'   => $this->member_id,
            'full_name'   => $this->full_name,
            'father_name' => $this->father_name,
            'mother_name' => $this->mother_name,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'gender'      => $this->gender?->value,
            'gender_label' => $this->gender?->label(),
            'blood_group' => $this->blood_group,

            // Contact
            'email'       => $this->email,
            'mobile'      => $this->mobile,
            'phone'       => $this->phone,
            'present_address'   => $this->present_address,
            'permanent_address' => $this->permanent_address,
            'division'    => $this->division,
            'district'    => $this->district,
            'upazila'     => $this->upazila,
            'union'       => $this->union,
            'ward'        => $this->ward,

            // Emergency
            'emergency_contact_name'  => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,

            // Education
            'institution' => $this->institution,
            'department'  => $this->department,
            'session'     => $this->session,
            'skills'      => $this->skills,
            'join_year'   => $this->join_year,

            // Status & approval
            'status'       => $this->status?->value,
            'status_label' => $this->status?->label(),
            'approved_at'  => $this->approved_at?->toDateTimeString(),
            'approved_by'  => $this->whenLoaded('approver', fn() => [
                'id'    => $this->approver->id,
                'email' => $this->approver->email,
            ]),

            // Photo & documents
            'photo_url'          => $this->photo_url,
            'nid_doc_path'       => $this->nid_doc_path,
            'student_id_doc_path' => $this->student_id_doc_path,

            // Relationships
            'organizational_unit' => $this->whenLoaded('organizationalUnit', fn() => [
                'id'   => $this->organizationalUnit->id,
                'name' => $this->organizationalUnit->name,
                'type' => $this->organizationalUnit->type?->value,
                'type_label' => $this->organizationalUnit->type?->label(),
            ]),
            'member_role' => $this->whenLoaded('memberRole', fn() => $this->memberRole ? [
                'role'        => $this->memberRole->role,
                'assigned_at' => $this->memberRole->assigned_at?->toDateTimeString(),
            ] : null),
            'positions' => $this->whenLoaded('positions', fn() =>
                $this->positions->map(fn($p) => [
                    'id'          => $p->id,
                    'role'        => $p->role?->title,
                    'unit'        => $p->unit?->name,
                    'is_active'   => (bool) $p->is_active,
                    'assigned_at' => $p->assigned_at?->toDateTimeString(),
                    'relieved_at' => $p->relieved_at?->toDateTimeString(),
                ])->values()
            ),

            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
