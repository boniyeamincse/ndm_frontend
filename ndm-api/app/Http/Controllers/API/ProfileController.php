<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\AuditLogService;
use App\Services\DocumentUploadService;
use Illuminate\Http\JsonResponse;

/**
 * Member — Own profile management.
 *
 * Security:
 *  - Auth guard via upstream auth:api middleware
 *  - ActiveMemberMiddleware ensures only active members can edit
 *  - NID re-encryption transparent via Eloquent `encrypted` cast
 */
class ProfileController extends Controller
{
    public function __construct(
        private readonly AuditLogService       $auditLog,
        private readonly DocumentUploadService $docService,
    ) {}

    public function me(): JsonResponse
    {
        $member = auth()->user()->member()->with([
            'organizationalUnit',
            'positions.role',
            'positions.organizationalUnit',
            'memberRole',
        ])->firstOrFail();

        return response()->json(['success' => true, 'data' => $member]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $member    = auth()->user()->member;
        $validated = $request->validated();
        $old       = $member->only(array_keys($validated));

        $member->update($validated);

        $this->auditLog->log('member.profile_updated', $member, $old, $member->only(array_keys($validated)));

        return response()->json(['success' => true, 'data' => $member]);
    }

    public function uploadPhoto(): JsonResponse
    {
        request()->validate([
            'photo' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $member = auth()->user()->member;

        // Delete old photo if exists
        if ($member->photo_path) {
            $this->docService->delete($member->photo_path);
        }

        $path = $this->docService->upload(request()->file('photo'), 'photos', 'profile');
        $member->update(['photo_path' => $path]);

        $this->auditLog->log('member.photo_updated', $member, [], ['photo_path' => $path]);

        return response()->json([
            'success'   => true,
            'photo_url' => $this->docService->url($path),
        ]);
    }
}
