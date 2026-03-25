<?php

namespace App\Services;

use App\Http\Requests\RegisterRequest;
use App\Models\Member;
use App\Models\User;
use App\Notifications\MemberRegistrationReceivedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * MemberService — centralises the full member admission workflow.
 *
 * Responsibilities:
 *  - Atomic user + member creation inside a DB transaction
 *  - Member-ID generation via MemberIdService
 *  - Secure file uploads via DocumentUploadService
 *  - Audit logging on admission
 *  - Registration notification dispatch
 */
class MemberService
{
    public function __construct(
        private readonly MemberIdService       $memberIdService,
        private readonly DocumentUploadService $documentUploadService,
        private readonly AuditLogService       $auditLog,
    ) {}

    /**
     * Admit a new member from a public registration request.
     *
     * Wraps the entire workflow in a DB transaction so that a failure in any
     * step (ID generation, file upload, member insert) leaves no orphaned rows.
     *
     * @return Member  The newly created, pending member.
     */
    public function admit(RegisterRequest $request): Member
    {
        return DB::transaction(function () use ($request): Member {
            // 1. Create auth-user account
            $user = User::create([
                'email'     => $request->string('email')->toString(),
                'password'  => Hash::make($request->string('password')->toString()),
                'user_type' => 'member',
                'is_active' => true,
            ]);

            // 2. Generate unique member ID  (NDM-SW-YYYY-XXXX)
            $memberId = $this->memberIdService->generate();

            // 3. Upload supporting documents
            $photoPath = $request->hasFile('photo')
                ? $this->documentUploadService->upload($request->file('photo'), 'photos', 'profile')
                : null;

            $nidPath = $request->hasFile('nid_doc')
                ? $this->documentUploadService->upload($request->file('nid_doc'), 'documents', 'nid')
                : null;

            $studentIdPath = $request->hasFile('student_id_doc')
                ? $this->documentUploadService->upload($request->file('student_id_doc'), 'documents', 'sid')
                : null;

            // 4. Create member profile  — all fillable fields explicitly mapped
            $member = Member::create([
                'user_id'   => $user->id,
                'member_id' => $memberId,

                // Personal
                'full_name'   => $request->string('full_name')->toString(),
                'father_name' => $request->input('father_name'),
                'mother_name' => $request->input('mother_name'),
                'date_of_birth' => $request->input('date_of_birth'),
                'gender'      => $request->input('gender'),
                'nid_or_bc'   => $request->input('nid_or_bc'), // encrypted at rest via model cast
                'blood_group' => $request->input('blood_group'),

                // Contact
                'email'            => $request->string('email')->toString(),
                'phone'            => $request->input('phone'),
                'mobile'           => $request->input('mobile'),
                'present_address'  => $request->input('present_address'),
                'permanent_address' => $request->input('permanent_address'),

                // Emergency contact
                'emergency_contact_name'  => $request->input('emergency_contact_name'),
                'emergency_contact_phone' => $request->input('emergency_contact_phone'),

                // Education
                'institution' => $request->input('institution'),
                'department'  => $request->input('department'),
                'session'     => $request->input('session'),
                'skills'      => $request->input('skills'),

                // Political / geographic area
                'division' => $request->input('division'),
                'district' => $request->input('district'),
                'upazila'  => $request->input('upazila'),
                'union'    => $request->input('union'),
                'ward'     => $request->input('ward'),

                // Organisational placement
                'organizational_unit_id' => $request->input('organizational_unit_id'),

                // Uploaded files
                'photo_path'         => $photoPath,
                'nid_doc_path'       => $nidPath,
                'student_id_doc_path' => $studentIdPath,

                // Admission meta
                'join_year' => now()->year,
                'status'    => 'pending',
            ]);

            // 5. Audit log — no actor yet (unauthenticated registration)
            $this->auditLog->log('member.registered', $member, [], $member->only([
                'member_id', 'full_name', 'email', 'status', 'join_year',
            ]));

            // 6. Notify registrant (e-mail / database channel)
            $user->notify(new MemberRegistrationReceivedNotification($member));

            return $member;
        });
    }
}
