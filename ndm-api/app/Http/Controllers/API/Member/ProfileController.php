<?php

namespace App\Http\Controllers\API\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\MemberResource;
use App\Models\AuditLog;
use App\Services\AuditLogService;
use App\Services\DocumentUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function __construct(
        private readonly AuditLogService       $auditLog,
        private readonly DocumentUploadService $docService,
    ) {}

    /**
     * Task alias: GET /members/me
     */
    public function me(Request $request): JsonResponse
    {
        return $this->show($request);
    }

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
            'data' => new MemberResource($member->load([
                'organizationalUnit', 
                'memberRole',
                'positions.role',
                'positions.unit',
                'committeeRoles.committee'
            ]))
        ]);
    }

    /**
     * Update the authenticated member's profile.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $validated = $request->validated();
        $oldData = $member->only(array_keys($validated));

        $member->update($validated);

        // Professional Audit Logging
        $this->auditLog->log('member.profile_updated', $member, $oldData, $member->only(array_keys($validated)));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully!',
            'data' => new MemberResource($member->fresh([
                'organizationalUnit',
                'memberRole',
                'positions.role',
                'positions.unit',
                'committeeRoles.committee'
            ]))
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

    /**
     * Remove profile photo.
     */
    public function removePhoto(Request $request): JsonResponse
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        if ($member->photo_path) {
            $this->docService->delete($member->photo_path);
            $member->update(['photo_path' => null]);
            $this->auditLog->log('member.photo_removed', $member, [], ['photo_path' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile photo removed successfully.',
        ]);
    }

    /**
     * Change account password for authenticated member.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'max:72', 'confirmed', 'different:current_password'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->string('current_password')->toString(), $user->password)) {
            return response()->json([
                'errors' => [
                    'current_password' => ['Current password is incorrect.'],
                ],
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->string('new_password')->toString()),
        ]);

        $this->auditLog->log('member.password_changed', $user, [], []);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    /**
     * Get recent activity log for the authenticated member.
     */
    public function activity(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', 20), 50));

        $logs = AuditLog::query()
            ->where('user_id', $request->user()->id)
            ->where(function ($query) {
                $query->where('action', 'like', 'member.%')
                    ->orWhere('action', 'like', 'auth.%')
                    ->orWhere('action', 'like', 'position.%');
            })
            ->orderByDesc('performed_at')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }
}
