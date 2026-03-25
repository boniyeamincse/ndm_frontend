<?php

namespace App\Http\Controllers\API\Member;

use App\Http\Controllers\Controller;
use App\Services\AuditLogService;
use App\Services\DocumentUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function __construct(
        private readonly AuditLogService       $auditLog,
        private readonly DocumentUploadService $docService,
    ) {}

    /**
     * Get the authenticated member's profile.
     */
    public function show(Request $request): JsonResponse
    {
        $member = $request->user()->member;
        
        if (!$member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $member->load([
                'organizationalUnit', 
                'memberRole.role',
                'positions.role',
                'positions.organizationalUnit'
            ])
        ]);
    }

    /**
     * Update the authenticated member's profile.
     */
    public function update(Request $request): JsonResponse
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $updatableFields = [
            'full_name',
            'father_name',
            'mother_name',
            'date_of_birth',
            'gender',
            'blood_group',
            'mobile',
            'phone',
            'institution',
            'department',
            'session',
            'present_address',
            'permanent_address',
            'division',
            'district',
            'upazila',
            'union',
            'ward',
            'emergency_contact_name',
            'emergency_contact_phone',
        ];

        $validator = Validator::make($request->only($updatableFields), [
            'full_name' => 'required|string|max:255',
            'father_name' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'blood_group' => 'nullable|string|max:5',
            'mobile' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'institution' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:191',
            'session' => 'nullable|string|max:50',
            'present_address' => 'required|string|max:500',
            'permanent_address' => 'required|string|max:500',
            'division' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'upazila' => 'nullable|string|max:100',
            'union' => 'nullable|string|max:100',
            'ward' => 'nullable|string|max:100',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $oldData = $member->only(array_keys($validated));

        $member->update($validated);

        // Professional Audit Logging
        $this->auditLog->log('member.profile_updated', $member, $oldData, $member->only(array_keys($validated)));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully!',
            'data' => $member->fresh(['organizationalUnit'])
        ]);
    }

    /**
     * Upload profile photo.
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $member = $request->user()->member;

        if (!$member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        // Delete old photo if exists
        if ($member->photo_path) {
            $this->docService->delete($member->photo_path);
        }

        $path = $this->docService->upload($request->file('photo'), 'photos', 'profile');
        $member->update(['photo_path' => $path]);

        $this->auditLog->log('member.photo_updated', $member, [], ['photo_path' => $path]);

        return response()->json([
            'success'   => true,
            'photo_url' => $this->docService->url($path),
            'message'   => 'Photo updated successfully.'
        ]);
    }
}
