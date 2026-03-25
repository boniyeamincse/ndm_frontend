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
use Illuminate\Support\Facades\DB;
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

        if (! $this->canApprove($member)) {
            return response()->json(['success' => false, 'message' => 'Member is not in pending state.'], 422);
        }

        $this->approveMember($member);

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

        if (! $this->canReject($member)) {
            return response()->json(['success' => false, 'message' => 'Cannot reject this member.'], 422);
        }

        $this->rejectMember($member, $request->input('reason'));

        return response()->json(['success' => true, 'message' => 'Member registration rejected and removed.']);
    }

    // ── Suspend ───────────────────────────────────────────────────────

    public function suspend(int $id, Request $request): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        $member = Member::findOrFail($id);

        if (! $this->canSuspend($member)) {
            return response()->json(['success' => false, 'message' => 'Only active members can be suspended.'], 422);
        }

        $this->suspendMember($member, $request->input('reason'));

        return response()->json(['success' => true, 'message' => "Member {$member->member_id} suspended."]);
    }

    // ── Expel ─────────────────────────────────────────────────────────

    public function expel(int $id, Request $request): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        $member = Member::findOrFail($id);

        if (! $this->canExpel($member)) {
            return response()->json(['success' => false, 'message' => 'Only pending, active, or suspended members can be expelled.'], 422);
        }

        $this->expelMember($member, $request->input('reason'));

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

    public function destroy(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $member = Member::findOrFail($id);

        if (! $this->canHardDelete($member)) {
            return response()->json([
                'success' => false,
                'message' => 'Hard delete is only allowed for pending or expelled members. Use suspend or expel first for recoverability.',
            ], 422);
        }

        $this->hardDeleteMember($member, $request->input('reason'));

        return response()->json(['success' => true, 'message' => 'Member permanently removed according to deletion policy.']);
    }

    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action'   => ['required', 'in:approve,reject,suspend,expel,delete'],
            'ids'      => ['required', 'array', 'min:1', 'max:200'],
            'ids.*'    => ['integer', 'distinct', 'exists:members,id'],
            'reason'   => ['nullable', 'string', 'max:500'],
        ]);

        if ($validated['action'] === 'delete' && blank($validated['reason'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'A reason is required for bulk delete operations.',
            ], 422);
        }

        $members = Member::with('user')->whereIn('id', $validated['ids'])->get()->keyBy('id');
        $processed = [];
        $skipped = [];

        foreach ($validated['ids'] as $memberId) {
            $member = $members->get($memberId);

            if (! $member) {
                $skipped[] = ['id' => $memberId, 'reason' => 'Member not found.'];
                continue;
            }

            switch ($validated['action']) {
                case 'approve':
                    if (! $this->canApprove($member)) {
                        $skipped[] = ['id' => $memberId, 'reason' => 'Only pending members can be approved.'];
                        continue 2;
                    }
                    $this->approveMember($member);
                    break;

                case 'reject':
                    if (! $this->canReject($member)) {
                        $skipped[] = ['id' => $memberId, 'reason' => 'Only pending or active members can be rejected.'];
                        continue 2;
                    }
                    $this->rejectMember($member, $validated['reason'] ?? null);
                    break;

                case 'suspend':
                    if (! $this->canSuspend($member)) {
                        $skipped[] = ['id' => $memberId, 'reason' => 'Only active members can be suspended.'];
                        continue 2;
                    }
                    $this->suspendMember($member, $validated['reason'] ?? null);
                    break;

                case 'expel':
                    if (! $this->canExpel($member)) {
                        $skipped[] = ['id' => $memberId, 'reason' => 'Only pending, active, or suspended members can be expelled.'];
                        continue 2;
                    }
                    $this->expelMember($member, $validated['reason'] ?? null);
                    break;

                case 'delete':
                    if (! $this->canHardDelete($member)) {
                        $skipped[] = ['id' => $memberId, 'reason' => 'Hard delete is only allowed for pending or expelled members.'];
                        continue 2;
                    }
                    $this->hardDeleteMember($member, $validated['reason']);
                    break;
            }

            $processed[] = [
                'id' => $memberId,
                'member_id' => $member->member_id,
                'action' => $validated['action'],
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Bulk member action processed.',
            'data' => [
                'action' => $validated['action'],
                'processed_count' => count($processed),
                'skipped_count' => count($skipped),
                'processed' => $processed,
                'skipped' => $skipped,
            ],
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'unit_id' => ['nullable', 'integer', 'exists:organizational_units,id'],
        ]);

        $memberQuery = Member::query()
            ->when($validated['unit_id'] ?? null, fn ($query, $unitId) => $query->where('organizational_unit_id', $unitId));

        $summary = [
            'total' => (clone $memberQuery)->count(),
            'active' => (clone $memberQuery)->where('status', 'active')->count(),
            'pending' => (clone $memberQuery)->where('status', 'pending')->count(),
            'suspended' => (clone $memberQuery)->where('status', 'suspended')->count(),
            'expelled' => (clone $memberQuery)->where('status', 'expelled')->count(),
        ];

        $approvalsByPeriod = Member::query()
            ->selectRaw('DATE(approved_at) as period, COUNT(*) as count')
            ->whereNotNull('approved_at')
            ->when($validated['unit_id'] ?? null, fn ($query, $unitId) => $query->where('organizational_unit_id', $unitId))
            ->when($validated['from'] ?? null, fn ($query, $from) => $query->whereDate('approved_at', '>=', $from))
            ->when($validated['to'] ?? null, fn ($query, $to) => $query->whereDate('approved_at', '<=', $to))
            ->groupBy(DB::raw('DATE(approved_at)'))
            ->orderBy('period')
            ->get()
            ->map(fn ($row) => ['period' => $row->period, 'count' => (int) $row->count])
            ->values();

        $statusChanges = DB::table('audit_logs')
            ->selectRaw('action, COUNT(*) as count')
            ->whereIn('action', ['member.approved', 'member.rejected', 'member.suspended', 'member.expelled', 'member.deleted'])
            ->when($validated['from'] ?? null, fn ($query, $from) => $query->whereDate('performed_at', '>=', $from))
            ->when($validated['to'] ?? null, fn ($query, $to) => $query->whereDate('performed_at', '<=', $to))
            ->groupBy('action')
            ->orderBy('action')
            ->get()
            ->map(fn ($row) => ['action' => $row->action, 'count' => (int) $row->count])
            ->values();

        $pendingByUnit = DB::table('members')
            ->leftJoin('organizational_units', 'members.organizational_unit_id', '=', 'organizational_units.id')
            ->selectRaw('organizational_units.id as unit_id, COALESCE(organizational_units.name, ?) as unit_name, COUNT(members.id) as count', ['Unassigned'])
            ->where('members.status', 'pending')
            ->when($validated['unit_id'] ?? null, fn ($query, $unitId) => $query->where('members.organizational_unit_id', $unitId))
            ->groupBy('organizational_units.id', 'organizational_units.name')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'unit_id' => $row->unit_id,
                'unit_name' => $row->unit_name,
                'count' => (int) $row->count,
            ])
            ->values();

        $membersByUnit = DB::table('members')
            ->leftJoin('organizational_units', 'members.organizational_unit_id', '=', 'organizational_units.id')
            ->selectRaw('organizational_units.id as unit_id, COALESCE(organizational_units.name, ?) as unit_name, members.status, COUNT(members.id) as count', ['Unassigned'])
            ->when($validated['unit_id'] ?? null, fn ($query, $unitId) => $query->where('members.organizational_unit_id', $unitId))
            ->groupBy('organizational_units.id', 'organizational_units.name', 'members.status')
            ->orderBy('unit_name')
            ->orderBy('members.status')
            ->get()
            ->map(fn ($row) => [
                'unit_id' => $row->unit_id,
                'unit_name' => $row->unit_name,
                'status' => $row->status,
                'count' => (int) $row->count,
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'approvals_by_period' => $approvalsByPeriod,
                'status_changes' => $statusChanges,
                'pending_by_unit' => $pendingByUnit,
                'members_by_unit' => $membersByUnit,
            ],
        ]);
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

    private function canApprove(Member $member): bool
    {
        return $member->status->value === 'pending';
    }

    private function canReject(Member $member): bool
    {
        return in_array($member->status->value, ['pending', 'active'], true);
    }

    private function canSuspend(Member $member): bool
    {
        return $member->status->value === 'active';
    }

    private function canExpel(Member $member): bool
    {
        return in_array($member->status->value, ['pending', 'active', 'suspended'], true);
    }

    private function canHardDelete(Member $member): bool
    {
        return in_array($member->status->value, ['pending', 'expelled'], true);
    }

    private function approveMember(Member $member): void
    {
        $old = $member->only(['status', 'approved_by', 'approved_at']);

        $member->update([
            'status' => 'active',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        MemberRole::updateOrCreate(
            ['member_id' => $member->id],
            ['role' => 'general_member', 'assigned_by' => auth()->id(), 'assigned_at' => now()]
        );

        $this->auditLog->log('member.approved', $member, $old, $member->only(['status', 'approved_by', 'approved_at']));
        $member->user?->notify(new MemberApprovedNotification($member));
    }

    private function rejectMember(Member $member, ?string $reason = null): void
    {
        $this->auditLog->log('member.rejected', $member, $member->only(['status']), [], $reason);
        $member->user?->notify(new MemberRejectedNotification($member, $reason));
        User::destroy($member->user_id);
    }

    private function suspendMember(Member $member, ?string $reason = null): void
    {
        $old = $member->only(['status']);
        $member->update(['status' => 'suspended']);
        $member->deactivateAllPositions('Suspended by admin.');
        $this->auditLog->log('member.suspended', $member, $old, $member->only(['status']), $reason);
        $member->user?->notify(new MemberSuspendedNotification($member, $reason));
    }

    private function expelMember(Member $member, ?string $reason = null): void
    {
        $old = $member->only(['status']);
        $member->update(['status' => 'expelled']);
        $member->deactivateAllPositions('Expelled by admin.');
        $this->auditLog->log('member.expelled', $member, $old, $member->only(['status']), $reason);
        $member->user?->notify(new MemberExpelledNotification($member, $reason));
    }

    private function hardDeleteMember(Member $member, string $reason): void
    {
        $snapshot = $member->toArray();

        $this->docService->delete($member->photo_path);
        $this->docService->delete($member->nid_doc_path, 'local');
        $this->docService->delete($member->student_id_doc_path, 'local');

        $this->auditLog->log('member.deleted', $member, $snapshot, [], $reason);

        User::destroy($member->user_id);
    }
}
