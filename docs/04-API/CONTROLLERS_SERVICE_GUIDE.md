# NDM System - Controllers & Business Logic Implementation

## Complete Controller Architecture

---

## 1. RoleAssignment Service (Business Logic)

```php
<?php
// app/Services/RoleAssignmentService.php

namespace App\Services;

use App\Models\Member;
use App\Models\Role;
use App\Models\OrganizationalUnit;
use App\Models\MemberPosition;
use App\Models\PositionHistory;
use App\Exceptions\RoleAssignmentException;
use App\Enums\MemberStatus;
use Illuminate\Support\Facades\DB;

class RoleAssignmentService
{
    /**
     * Validate if role can be assigned
     */
    public function validateAssignment(
        int $memberId,
        int $roleId,
        int $unitId,
        string $remarks = ''
    ): array {
        $member = Member::find($memberId);
        $role = Role::find($roleId);
        $unit = OrganizationalUnit::find($unitId);

        // Validation 1: Member exists and is active
        if (!$member || $member->status !== MemberStatus::ACTIVE) {
            throw new RoleAssignmentException(
                'Member must exist and be in active status'
            );
        }

        // Validation 2: Role exists and is active
        if (!$role || !$role->is_active) {
            throw new RoleAssignmentException(
                'Selected role is not available'
            );
        }

        // Validation 3: Unit exists
        if (!$unit) {
            throw new RoleAssignmentException(
                'Organizational unit does not exist'
            );
        }

        // Validation 4: Role type matches unit type
        if ($role->unit_type !== $unit->type) {
            throw new RoleAssignmentException(
                sprintf(
                    'Role "%s" is for %s units, not %s units',
                    $role->title,
                    $role->unit_type,
                    $unit->type
                )
            );
        }

        // Validation 5: Check vacancy in single-holder role
        if ($role->max_holders === 1) {
            $existingHolder = MemberPosition::where('role_id', $roleId)
                ->where('unit_id', $unitId)
                ->where('is_active', true)
                ->first();

            if ($existingHolder && $existingHolder->member_id !== $memberId) {
                throw new RoleAssignmentException(
                    sprintf(
                        'Position already held by %s. Relieve them first.',
                        $existingHolder->member->full_name
                    )
                );
            }
        }

        // Validation 6: Check if member already holds this role in this unit
        $duplicate = MemberPosition::where('member_id', $memberId)
            ->where('role_id', $roleId)
            ->where('unit_id', $unitId)
            ->where('is_active', true)
            ->first();

        if ($duplicate) {
            throw new RoleAssignmentException(
                'Member already holds this position in this unit'
            );
        }

        return [
            'valid' => true,
            'member' => $member,
            'role' => $role,
            'unit' => $unit,
        ];
    }

    /**
     * Assign role to member (with auto-relieve for single-holder roles)
     */
    public function assignRole(
        int $memberId,
        int $roleId,
        int $unitId,
        string $remarks = '',
        ?int $performedBy = null
    ): MemberPosition {
        return DB::transaction(function () use (
            $memberId,
            $roleId,
            $unitId,
            $remarks,
            $performedBy
        ) {
            // Validate
            $this->validateAssignment($memberId, $roleId, $unitId, $remarks);

            $role = Role::find($roleId);
            $performedBy = $performedBy ?? auth()->id() ?? 1;

            // Auto-relieve if single-holder role
            if ($role->max_holders === 1) {
                $existing = MemberPosition::where('role_id', $roleId)
                    ->where('unit_id', $unitId)
                    ->where('is_active', true)
                    ->first();

                if ($existing) {
                    $this->relieveRole(
                        $existing->id,
                        'Auto-relieved due to new assignment',
                        $performedBy
                    );
                }
            }

            // Create new position
            $position = MemberPosition::create([
                'member_id' => $memberId,
                'role_id' => $roleId,
                'unit_id' => $unitId,
                'assigned_at' => now(),
                'is_active' => true,
                'remarks' => $remarks,
            ]);

            // Create audit log
            PositionHistory::create([
                'member_id' => $memberId,
                'role_id' => $roleId,
                'unit_id' => $unitId,
                'action' => 'assigned',
                'performed_by' => $performedBy,
                'performed_at' => now(),
                'remarks' => $remarks,
            ]);

            return $position->load('member', 'role', 'unit');
        });
    }

    /**
     * Relieve (end) a role assignment
     */
    public function relieveRole(
        int $positionId,
        string $remarks = '',
        ?int $performedBy = null
    ): MemberPosition {
        return DB::transaction(function () use ($positionId, $remarks, $performedBy) {
            $position = MemberPosition::find($positionId);

            if (!$position || !$position->is_active) {
                throw new RoleAssignmentException(
                    'Position is not active or does not exist'
                );
            }

            $performedBy = $performedBy ?? auth()->id() ?? 1;

            // Update position
            $position->update([
                'is_active' => false,
                'relieved_at' => now(),
            ]);

            // Create audit log
            PositionHistory::create([
                'member_id' => $position->member_id,
                'role_id' => $position->role_id,
                'unit_id' => $position->unit_id,
                'action' => 'relieved',
                'performed_by' => $performedBy,
                'performed_at' => now(),
                'remarks' => $remarks,
            ]);

            return $position->load('member', 'role', 'unit');
        });
    }

    /**
     * Transfer role from one member to another
     */
    public function transferRole(
        int $positionId,
        int $newMemberId,
        string $remarks = '',
        ?int $performedBy = null
    ): MemberPosition {
        return DB::transaction(function () use (
            $positionId,
            $newMemberId,
            $remarks,
            $performedBy
        ) {
            $oldPosition = MemberPosition::find($positionId);

            if (!$oldPosition || !$oldPosition->is_active) {
                throw new RoleAssignmentException(
                    'Position to transfer is not active or does not exist'
                );
            }

            // Relieve old holder
            $this->relieveRole(
                $positionId,
                "Transferred: $remarks",
                $performedBy
            );

            // Assign to new member
            return $this->assignRole(
                $newMemberId,
                $oldPosition->role_id,
                $oldPosition->unit_id,
                "Transferred from {$oldPosition->member->full_name}: $remarks",
                $performedBy
            );
        });
    }

    /**
     * Get vacancy information for a role in a unit
     */
    public function getRoleVacancy(int $roleId, int $unitId): array
    {
        $role = Role::find($roleId);

        if (!$role) {
            throw new RoleAssignmentException('Role not found');
        }

        $activeCount = MemberPosition::where('role_id', $roleId)
            ->where('unit_id', $unitId)
            ->where('is_active', true)
            ->count();

        $maxHolders = $role->max_holders;

        return [
            'role' => $role,
            'unit_id' => $unitId,
            'max_holders' => $maxHolders,
            'filled_positions' => $activeCount,
            'vacancies' => $maxHolders ? max(0, $maxHolders - $activeCount) : null,
            'is_full' => $maxHolders ? $activeCount >= $maxHolders : false,
            'can_assign_more' => !$maxHolders || $activeCount < $maxHolders,
        ];
    }
}
```

---

## 2. Position Controller (API Endpoints)

```php
<?php
// app/Http/Controllers/Api/PositionController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePositionRequest;
use App\Http\Requests\UpdatePositionRequest;
use App\Http\Requests\TransferPositionRequest;
use App\Http\Resources\PositionResource;
use App\Http\Resources\PositionHistoryResource;
use App\Models\MemberPosition;
use App\Models\PositionHistory;
use App\Services\RoleAssignmentService;
use App\Exceptions\RoleAssignmentException;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class PositionController extends Controller
{
    private RoleAssignmentService $roleService;

    public function __construct(RoleAssignmentService $roleService)
    {
        $this->roleService = $roleService;
    }

    /**
     * POST /api/positions/assign
     * Assign a role to a member
     */
    public function assign(StorePositionRequest $request)
    {
        try {
            $position = $this->roleService->assignRole(
                memberId: $request->validated('member_id'),
                roleId: $request->validated('role_id'),
                unitId: $request->validated('unit_id'),
                remarks: $request->validated('remarks', ''),
            );

            return response()->json([
                'success' => true,
                'message' => 'Role assigned successfully',
                'data' => new PositionResource($position),
            ], 201);
        } catch (RoleAssignmentException $e) {
            return response()->json([
                'error' => true,
                'message' => 'Role assignment failed',
                'details' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * POST /api/positions/{id}/relieve
     * Relieve (end) a role assignment
     */
    public function relieve(int $id, Request $request)
    {
        $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        try {
            $position = $this->roleService->relieveRole(
                positionId: $id,
                remarks: $request->input('remarks', ''),
            );

            return response()->json([
                'success' => true,
                'message' => 'Position relieved successfully',
                'data' => new PositionResource($position),
            ]);
        } catch (RoleAssignmentException $e) {
            return response()->json([
                'error' => true,
                'message' => 'Position relief failed',
                'details' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * POST /api/positions/{id}/transfer
     * Transfer role to another member
     */
    public function transfer(int $id, TransferPositionRequest $request)
    {
        try {
            $position = $this->roleService->transferRole(
                positionId: $id,
                newMemberId: $request->validated('member_id'),
                remarks: $request->validated('remarks', ''),
            );

            return response()->json([
                'success' => true,
                'message' => 'Position transferred successfully',
                'data' => new PositionResource($position),
            ]);
        } catch (RoleAssignmentException $e) {
            return response()->json([
                'error' => true,
                'message' => 'Position transfer failed',
                'details' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * GET /api/positions/current
     * Get active position assignments
     */
    public function current(Request $request)
    {
        $query = MemberPosition::where('is_active', true)
            ->with('member', 'role', 'unit');

        // Filter by unit
        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->input('unit_id'));
        }

        // Filter by role
        if ($request->has('role_id')) {
            $query->where('role_id', $request->input('role_id'));
        }

        // Filter by member
        if ($request->has('member_id')) {
            $query->where('member_id', $request->input('member_id'));
        }

        $positions = $query->paginate($request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => PositionResource::collection($positions),
            'pagination' => [
                'current_page' => $positions->currentPage(),
                'per_page' => $positions->perPage(),
                'total' => $positions->total(),
                'last_page' => $positions->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/positions/history
     * Get position history (audit trail)
     */
    public function history(Request $request)
    {
        $query = PositionHistory::query()
            ->with('member', 'role', 'unit', 'performedBy');

        // Filter by member
        if ($request->has('member_id')) {
            $query->where('member_id', $request->input('member_id'));
        }

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->input('action'));
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('performed_at', '>=', $request->input('start_date'));
        }
        if ($request->has('end_date')) {
            $query->where('performed_at', '<=', $request->input('end_date'));
        }

        $history = $query->orderBy('performed_at', 'desc')
            ->paginate($request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => PositionHistoryResource::collection($history),
            'pagination' => [
                'current_page' => $history->currentPage(),
                'per_page' => $history->perPage(),
                'total' => $history->total(),
                'last_page' => $history->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/positions/{id}/history
     * Get history for a specific position
     */
    public function positionHistory(int $id)
    {
        $position = MemberPosition::find($id);

        if (!$position) {
            return response()->json([
                'error' => true,
                'message' => 'Position not found',
            ], 404);
        }

        $history = PositionHistory::where('member_id', $position->member_id)
            ->where('role_id', $position->role_id)
            ->where('unit_id', $position->unit_id)
            ->with('performedBy')
            ->orderBy('performed_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'position' => new PositionResource($position),
            'history' => PositionHistoryResource::collection($history),
        ]);
    }
}
```

---

## 3. Member Controller (Management)

```php
<?php
// app/Http/Controllers/Api/MemberController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Http\Resources\MemberResource;
use App\Models\Member;
use App\Enums\MemberStatus;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    /**
     * GET /api/members
     * List all members
     */
    public function index(Request $request)
    {
        $query = Member::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by unit
        if ($request->has('organizational_unit_id')) {
            $query->where('organizational_unit_id', $request->input('organizational_unit_id'));
        }

        // Search by name or member_id
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'ilike', "%$search%")
                  ->orWhere('member_id', 'ilike', "%$search%")
                  ->orWhere('email', 'ilike', "%$search%");
            });
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $members = $query->with('user', 'organizationalUnit', 'currentPositions.role')
            ->paginate($request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => MemberResource::collection($members),
            'pagination' => [
                'current_page' => $members->currentPage(),
                'per_page' => $members->perPage(),
                'total' => $members->total(),
                'last_page' => $members->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/members/{id}
     * Get member details
     */
    public function show(int $id)
    {
        $member = Member::with(
            'user',
            'organizationalUnit',
            'currentPositions.role',
            'currentPositions.unit',
            'positionHistory'
        )->find($id);

        if (!$member) {
            return response()->json([
                'error' => true,
                'message' => 'Member not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new MemberResource($member),
        ]);
    }

    /**
     * POST /api/members
     * Create new member
     */
    public function store(StoreMemberRequest $request)
    {
        $member = Member::create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Member created successfully',
            'data' => new MemberResource($member->load('user', 'organizationalUnit')),
        ], 201);
    }

    /**
     * PUT /api/members/{id}
     * Update member
     */
    public function update(int $id, UpdateMemberRequest $request)
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'error' => true,
                'message' => 'Member not found',
            ], 404);
        }

        $member->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Member updated successfully',
            'data' => new MemberResource($member->load('user', 'organizationalUnit')),
        ]);
    }

    /**
     * POST /api/members/{id}/approve
     * Approve pending member
     */
    public function approve(int $id, Request $request)
    {
        $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'error' => true,
                'message' => 'Member not found',
            ], 404);
        }

        if ($member->status !== MemberStatus::PENDING) {
            return response()->json([
                'error' => true,
                'message' => 'Only pending members can be approved',
            ], 422);
        }

        $member->update([
            'status' => MemberStatus::ACTIVE,
            'approved_by' => auth()->id() ?? 1,
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member approved successfully',
            'data' => new MemberResource($member),
        ]);
    }

    /**
     * POST /api/members/{id}/suspend
     * Suspend a member
     */
    public function suspend(int $id, Request $request)
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'error' => true,
                'message' => 'Member not found',
            ], 404);
        }

        $member->suspend('Member suspended by admin');

        return response()->json([
            'success' => true,
            'message' => 'Member suspended and all positions relieved',
            'data' => new MemberResource($member),
        ]);
    }

    /**
     * GET /api/members/{id}/positions
     * Get member's positions (current and history)
     */
    public function positions(int $id, Request $request)
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'error' => true,
                'message' => 'Member not found',
            ], 404);
        }

        $currentPositions = $member->currentPositions()->get();
        $history = $member->positionHistory()
            ->when($request->has('limit'), fn($q) => $q->limit($request->input('limit')))
            ->get();

        return response()->json([
            'success' => true,
            'member' => new MemberResource($member),
            'current_positions' => $currentPositions,
            'position_history' => $history,
        ]);
    }
}
```

---

## 4. Reference Implementation: Request Validation

```php
<?php
// app/Http/Requests/StorePositionRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Member;
use App\Models\Role;
use App\Enums\MemberStatus;

class StorePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->can('manage.positions');
    }

    public function rules(): array
    {
        return [
            'member_id' => [
                'required',
                'integer',
                Rule::exists('members', 'id'),
                function ($attribute, $value, $fail) {
                    $member = Member::find($value);
                    if ($member && $member->status !== MemberStatus::ACTIVE->value) {
                        $fail('Member must be in active status.');
                    }
                },
            ],
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id'),
                function ($attribute, $value, $fail) {
                    $role = Role::find($value);
                    if ($role && !$role->is_active) {
                        $fail('Selected role is not active.');
                    }
                },
            ],
            'unit_id' => [
                'required',
                'integer',
                Rule::exists('organizational_units', 'id'),
                function ($attribute, $value, $fail) {
                    $unit = \App\Models\OrganizationalUnit::find($value);
                    $roleId = $this->input('role_id');
                    
                    if ($unit && $roleId) {
                        $role = Role::find($roleId);
                        if ($role && $role->unit_type !== $unit->type) {
                            $fail(sprintf(
                                'Role "%s" can only be assigned to %s units.',
                                $role->title,
                                $role->unit_type
                            ));
                        }
                    }
                },
            ],
            'remarks' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'member_id.required' => 'Member selection is required',
            'member_id.exists' => 'Selected member does not exist',
            'role_id.required' => 'Role selection is required',
            'role_id.exists' => 'Selected role does not exist',
            'unit_id.required' => 'Unit selection is required',
            'unit_id.exists' => 'Selected unit does not exist',
        ];
    }
}
```

---

## 5. Resource Transformers (API Response Formatting)

```php
<?php
// app/Http/Resources/PositionResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PositionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'member' => [
                'id' => $this->member->id,
                'member_id' => $this->member->member_id,
                'full_name' => $this->member->full_name,
            ],
            'role' => [
                'id' => $this->role->id,
                'title' => $this->role->title,
                'rank_order' => $this->role->rank_order,
            ],
            'unit' => [
                'id' => $this->unit->id,
                'name' => $this->unit->name,
                'code' => $this->unit->code,
                'type' => $this->unit->type,
            ],
            'assigned_at' => $this->assigned_at->toIso8601String(),
            'relieved_at' => $this->relieved_at?->toIso8601String(),
            'is_active' => $this->is_active,
            'duration_days' => $this->getDurationDays(),
            'remarks' => $this->remarks,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
```

---

**Document Status:** Complete  
**Version:** 1.0.0  
**Last Updated:** March 2026
