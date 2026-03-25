<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PromoteMemberRoleRequest;
use App\Models\Member;
use App\Models\MemberRole;
use App\Models\User;
use App\Notifications\MemberApprovedNotification;
use App\Notifications\MemberExpelledNotification;
use App\Notifications\MemberRejectedNotification;
use App\Notifications\MemberSuspendedNotification;
use App\Services\AuditLogService;
use App\Services\DocumentUploadService;
use App\Services\MemberIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Admin — Full member lifecycle management.
 *
 * Implements:
 *  - Paginated / filtered member listing
 *  - Pending approval queue
 *  - Approve / Reject / Suspend / Expel
 *  - Role promotion (general_member → organizer → admin)
 *  - Data update & deletion
 *
 * OWASP:
 *  - All actions audited via AuditLogService
 *  - Admin role protected by AdminMiddleware (upstream)
 *  - Privilege escalation prevented in PromoteMemberRoleRequest
 */
class AdminMemberController extends Controller
{
    public function __construct(
        private readonly AuditLogService       $auditLog,
        private readonly DocumentUploadService  $docService,
        private readonly MemberIdService        $memberIdService,
    ) {}

    // ── Store (admin manual add) ──────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name'              => ['required', 'string', 'max:191'],
            'email'                  => ['required', 'email', 'max:191', 'unique:users,email'],
            'password'               => ['required', 'string', 'min:8', 'max:72'],
            'mobile'                 => ['nullable', 'string', 'max:20'],
            'phone'                  => ['nullable', 'string', 'max:20'],
            'institution'            => ['nullable', 'string', 'max:255'],
            'department'             => ['nullable', 'string', 'max:191'],
            'gender'                 => ['nullable', 'in:male,female,other'],
            'date_of_birth'          => ['nullable', 'date', 'before:today'],
            'blood_group'            => ['nullable', 'string', 'max:5'],
            'organizational_unit_id' => ['nullable', 'integer', 'exists:organizational_units,id'],
            'status'                 => ['nullable', 'in:active,pending'],
            'join_year'              => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'present_address'        => ['nullable', 'string', 'max:500'],
        ]);

        $user = User::create([
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'user_type' => 'member',
            'is_active' => true,
        ]);

        $status   = $validated['status'] ?? 'active';
        $memberId = $this->memberIdService->generate();
        $joinYear = $validated['join_year'] ?? (int) now()->year;

        $member = Member::create([
            'user_id'                => $user->id,
            'member_id'              => $memberId,
            'full_name'              => $validated['full_name'],
            'email'                  => $validated['email'],
            'mobile'                 => $validated['mobile'] ?? null,
            'phone'                  => $validated['phone'] ?? null,
            'institution'            => $validated['institution'] ?? null,
            'department'             => $validated['department'] ?? null,
            'gender'                 => $validated['gender'] ?? null,
            'date_of_birth'          => $validated['date_of_birth'] ?? null,
            'blood_group'            => $validated['blood_group'] ?? null,
            'organizational_unit_id' => $validated['organizational_unit_id'] ?? null,
            'present_address'        => $validated['present_address'] ?? null,
            'status'                 => $status,
            'join_year'              => $joinYear,
            'approved_by'            => $status === 'active' ? auth()->id() : null,
            'approved_at'            => $status === 'active' ? now() : null,
        ]);

        if ($status === 'active') {
            MemberRole::create([
                'member_id'   => $member->id,
                'role'        => 'general_member',
                'assigned_by' => auth()->id(),
                'assigned_at' => now(),
            ]);
        }

        $this->auditLog->log('member.created_by_admin', $member, [], $member->only(['member_id', 'full_name', 'status']));

        return response()->json([
            'success' => true,
            'message' => "Member {$memberId} created successfully.",
            'data'    => $member,
        ], 201);
    }

    // ── List ─────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status'   => ['nullable', 'in:pending,active,suspended,expelled'],
            'unit_id'  => ['nullable', 'integer', 'exists:organizational_units,id'],
            'unit_type' => ['nullable', 'in:central,division,district,upazila,union,ward,campus'],
            'join_year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'search'   => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
            'sort_by'  => ['nullable', 'in:full_name,join_year,status,created_at'],
            'sort_dir' => ['nullable', 'in:asc,desc'],
        ]);

        $query = Member::with(['user', 'organizationalUnit', 'positions.role'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->unit_id, fn ($q) => $q->where('organizational_unit_id', $request->unit_id))
            ->when($request->unit_type, fn ($q) => $q->whereHas('organizationalUnit', function ($unitQuery) use ($request) {
                $unitQuery->where('type', $request->unit_type);
            }))
            ->when($request->join_year, fn ($q) => $q->where('join_year', $request->join_year))
            ->when($request->search, function ($q) use ($request) {
                $term = '%' . $request->search . '%';
                $q->where(function ($inner) use ($term) {
                    $inner->where('full_name', 'like', $term)
                          ->orWhere('member_id', 'like', $term)
                          ->orWhere('institution', 'like', $term)
                          ->orWhere('mobile', 'like', $term);
                });
            })
            ->orderBy(
                $request->input('sort_by', 'created_at'),
                $request->input('sort_dir', 'desc')
            );

        return response()->json([
            'success' => true,
            'data'    => $query->paginate($request->integer('per_page', 20)),
        ]);
    }

    public function pending(Request $request): JsonResponse
    {
        $members = Member::with(['organizationalUnit'])
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $members]);
    }

    public function show(int $id): JsonResponse
    {
        $member = Member::with([
            'user', 'organizationalUnit', 'positions.role', 'positions.unit', 'memberRole',
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $member]);
    }

    // ── Approve ───────────────────────────────────────────────────────

    public function approve(int $id): JsonResponse
    {
        $member = Member::findOrFail($id);

        if ($member->status->value !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Member is not in pending state.'], 422);
        }

        $old = $member->only(['status', 'approved_by', 'approved_at']);
        $member->update([
            'status'      => 'active',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        // Assign default role: general_member
        MemberRole::updateOrCreate(
            ['member_id' => $member->id],
            ['role' => 'general_member', 'assigned_by' => auth()->id(), 'assigned_at' => now()]
        );

        $this->auditLog->log('member.approved', $member, $old, $member->only(['status', 'approved_by', 'approved_at']));

        $member->user?->notify(new MemberApprovedNotification($member));

        return response()->json([
            'success' => true,
            'message' => "Member {$member->member_id} approved successfully.",
            'data'    => ['member_id' => $member->member_id, 'status' => 'active'],
        ]);
    }

    // ── Reject ────────────────────────────────────────────────────────

    public function reject(int $id, Request $request): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        $member = Member::findOrFail($id);

        if (! in_array($member->status->value, ['pending', 'active'], true)) {
            return response()->json(['success' => false, 'message' => 'Cannot reject this member.'], 422);
        }

        $this->auditLog->log('member.rejected', $member, $member->only(['status']), [], $request->input('reason'));

        // Notify the registrant before deleting the user record
        $member->user?->notify(new MemberRejectedNotification($member, $request->input('reason')));

        // Cascade-deletes member record via DB constraint
        User::destroy($member->user_id);

        return response()->json(['success' => true, 'message' => 'Member registration rejected and removed.']);
    }

    // ── Suspend ───────────────────────────────────────────────────────

    public function suspend(int $id, Request $request): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        $member = Member::findOrFail($id);

        if ($member->status->value !== 'active') {
            return response()->json(['success' => false, 'message' => 'Only active members can be suspended.'], 422);
        }

        $old = $member->only(['status']);
        $member->update(['status' => 'suspended']);
        $member->deactivateAllPositions('Suspended by admin.');

        $this->auditLog->log('member.suspended', $member, $old, $member->only(['status']), $request->input('reason'));

        $member->user?->notify(new MemberSuspendedNotification($member, $request->input('reason')));

        return response()->json(['success' => true, 'message' => "Member {$member->member_id} suspended."]);
    }

    // ── Expel ─────────────────────────────────────────────────────────

    public function expel(int $id, Request $request): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        $member = Member::findOrFail($id);
        $old    = $member->only(['status']);
        $member->update(['status' => 'expelled']);
        $member->deactivateAllPositions('Expelled by admin.');

        $this->auditLog->log('member.expelled', $member, $old, $member->only(['status']), $request->input('reason'));

        $member->user?->notify(new MemberExpelledNotification($member, $request->input('reason')));

        return response()->json(['success' => true, 'message' => "Member {$member->member_id} expelled."]);
    }

    // ── Update ────────────────────────────────────────────────────────

    public function update(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name'              => ['sometimes', 'string', 'max:191'],
            'institution'            => ['sometimes', 'nullable', 'string', 'max:255'],
            'department'             => ['sometimes', 'nullable', 'string', 'max:191'],
            'organizational_unit_id' => ['sometimes', 'nullable', 'integer', 'exists:organizational_units,id'],
            'blood_group'            => ['sometimes', 'nullable', 'string', 'max:5'],
        ]);

        $member = Member::findOrFail($id);
        $old    = $member->only(array_keys($validated));
        $member->update($validated);

        $this->auditLog->log('member.updated', $member, $old, $member->only(array_keys($validated)));

        return response()->json(['success' => true, 'data' => $member]);
    }

    // ── Destroy ───────────────────────────────────────────────────────

    public function destroy(int $id): JsonResponse
    {
        $member = Member::findOrFail($id);

        // Delete uploaded documents
        $this->docService->delete($member->photo_path);
        $this->docService->delete($member->nid_doc_path, 'local');
        $this->docService->delete($member->student_id_doc_path, 'local');

        $this->auditLog->log('member.deleted', $member, $member->toArray());

        User::destroy($member->user_id);

        return response()->json(['success' => true, 'message' => 'Member permanently removed.']);
    }

    // ── Promote Role ──────────────────────────────────────────────────

    public function promoteRole(PromoteMemberRoleRequest $request): JsonResponse
    {
        $member = Member::findOrFail($request->integer('member_id'));

        if ($member->status->value !== 'active') {
            return response()->json(['success' => false, 'message' => 'Only active members can be promoted.'], 422);
        }

        $old = $member->memberRole?->only(['role']) ?? ['role' => 'none'];

        MemberRole::updateOrCreate(
            ['member_id' => $member->id],
            [
                'role'        => $request->input('role'),
                'assigned_by' => auth()->id(),
                'assigned_at' => now(),
            ]
        );

        $this->auditLog->log(
            'member.role_promoted',
            $member,
            $old,
            ['role' => $request->input('role')]
        );

        return response()->json([
            'success' => true,
            'message' => "Member promoted to [{$request->input('role')}].",
        ]);
    }

    // ── Documents ─────────────────────────────────────────────────────

    public function documents(int $id): JsonResponse
    {
        $member = Member::findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => [
                'photo_url'    => $this->docService->url($member->photo_path),
                'nid_doc_url'  => $this->docService->url($member->nid_doc_path, 'local'),
                'student_id_url' => $this->docService->url($member->student_id_doc_path, 'local'),
            ],
        ]);
    }
}
