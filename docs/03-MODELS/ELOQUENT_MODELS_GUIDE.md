# NDM System - Eloquent Models & Relationships

## Complete Data Models Architecture

---

## 1. Role Model (Political Designation)

```php
<?php
// app/Models/Role.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'unit_type',
        'rank_order',
        'description',
        'max_holders',
        'created_by',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Political roles have many position assignments
     */
    public function positions(): HasMany
    {
        return $this->hasMany(MemberPosition::class, 'role_id');
    }

    /**
     * Get all currently active position holders
     */
    public function activeHolders(): HasMany
    {
        return $this->positions()
            ->where('is_active', true)
            ->with('member', 'unit');
    }

    /**
     * Get position history for this role
     */
    public function history(): HasMany
    {
        return $this->hasMany(PositionHistory::class, 'role_id')
            ->orderBy('performed_at', 'desc');
    }

    /**
     * Role was created by admin user
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Query scope: Only active roles
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Query scope: By unit type
     */
    public function scopeByUnitType($query, $unitType)
    {
        return $query->where('unit_type', $unitType);
    }

    /**
     * Get vacancy status
     */
    public function getVacancyStatus(): array
    {
        $activeCount = $this->positions()
            ->where('is_active', true)
            ->count();

        return [
            'total_positions' => $this->max_holders ?? 'Unlimited',
            'filled_positions' => $activeCount,
            'vacancies' => $this->max_holders ? $this->max_holders - $activeCount : null,
            'is_full' => $this->max_holders ? $activeCount >= $this->max_holders : false,
        ];
    }
}
```

---

## 2. Member Model

```php
<?php
// app/Models/Member.php

namespace App\Models;

use App\Enums\Gender;
use App\Enums\MemberStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'member_id',
        'full_name',
        'father_name',
        'mother_name',
        'date_of_birth',
        'gender',
        'nid_or_bc',
        'blood_group',
        'phone',
        'email',
        'present_address',
        'permanent_address',
        'institution',
        'department',
        'session',
        'photo_path',
        'nid_doc_path',
        'student_id_doc_path',
        'status',
        'approved_by',
        'approved_at',
        'join_year',
        'organizational_unit_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'approved_at' => 'datetime',
        'gender' => Gender::class,
        'status' => MemberStatus::class,
        'join_year' => 'integer',
    ];

    protected $appends = [
        'photo_url',
        'is_active_in_system',
        'years_of_membership',
    ];

    /**
     * Relationships: Member has a user account
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Member belongs to organizational unit
     */
    public function organizationalUnit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class);
    }

    /**
     * Alias for organizationalUnit
     */
    public function unit(): BelongsTo
    {
        return $this->organizationalUnit();
    }

    /**
     * Get all positions held by member (including inactive)
     */
    public function positions(): HasMany
    {
        return $this->hasMany(MemberPosition::class, 'member_id')
            ->orderBy('assigned_at', 'desc');
    }

    /**
     * Get only currently active positions
     */
    public function currentPositions(): HasMany
    {
        return $this->positions()
            ->where('is_active', true)
            ->with('role', 'unit');
    }

    /**
     * Get position history for audit trail
     */
    public function positionHistory(): HasMany
    {
        return $this->hasMany(PositionHistory::class, 'member_id')
            ->orderBy('performed_at', 'desc');
    }

    /**
     * Get approver information
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Query scope: only active members
     */
    public function scopeActive($query)
    {
        return $query->where('status', MemberStatus::ACTIVE);
    }

    /**
     * Query scope: pending approval
     */
    public function scopePending($query)
    {
        return $query->where('status', MemberStatus::PENDING);
    }

    /**
     * Query scope: by unit
     */
    public function scopeInUnit($query, $unitId)
    {
        return $query->where('organizational_unit_id', $unitId);
    }

    /**
     * Accessors
     */
    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? 
            asset('storage/' . $this->photo_path) : null;
    }

    public function getIsActiveInSystemAttribute(): bool
    {
        return $this->status === MemberStatus::ACTIVE;
    }

    public function getYearsOfMembershipAttribute(): int
    {
        return now()->year - $this->join_year;
    }

    /**
     * Get member's highest rank role
     */
    public function getHighestRankedPosition(): ?MemberPosition
    {
        return $this->currentPositions()
            ->join('roles', 'member_positions.role_id', '=', 'roles.id')
            ->orderBy('roles.rank_order', 'asc')
            ->first();
    }

    /**
     * Check if member can hold positions
     */
    public function canHoldPosition(): bool
    {
        return $this->is_active_in_system;
    }

    /**
     * Suspend member (deactivate all positions)
     */
    public function suspend(string $remarks = 'Member suspended'): void
    {
        $this->update(['status' => MemberStatus::SUSPENDED]);
        $this->deactivateAllPositions($remarks);
    }

    /**
     * Deactivate all active positions
     */
    public function deactivateAllPositions(string $remarks = 'Positions deactivated'): void
    {
        $activePositions = $this->currentPositions()->get();

        foreach ($activePositions as $position) {
            $position->update([
                'is_active' => false,
                'relieved_at' => now(),
            ]);

            PositionHistory::create([
                'member_id' => $this->id,
                'role_id' => $position->role_id,
                'unit_id' => $position->unit_id,
                'action' => 'relieved',
                'performed_by' => auth()->id() ?? 1,
                'performed_at' => now(),
                'remarks' => $remarks,
            ]);
        }
    }
}
```

---

## 3. MemberPosition Model (Assignment)

```php
<?php
// app/Models/MemberPosition.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MemberPosition extends Model
{
    protected $fillable = [
        'member_id',
        'role_id',
        'unit_id',
        'assigned_at',
        'relieved_at',
        'is_active',
        'remarks',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'relieved_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Position is held by a member
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Position is a specific role
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Position is in a unit
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'unit_id');
    }

    /**
     * Get all history records for this position
     */
    public function history(): HasMany
    {
        return $this->hasMany(PositionHistory::class, 'role_id', 'role_id')
            ->where('unit_id', $this->unit_id)
            ->where('member_id', $this->member_id)
            ->orderBy('performed_at', 'desc');
    }

    /**
     * Query scope: currently active positions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Query scope: by role in unit
     */
    public function scopeInUnitByRole($query, $unitId, $roleId)
    {
        return $query->where('unit_id', $unitId)
            ->where('role_id', $roleId)
            ->where('is_active', true);
    }

    /**
     * Relieve (retire) this position
     */
    public function relieve(string $remarks = 'Position relieved'): void
    {
        $this->update([
            'is_active' => false,
            'relieved_at' => now(),
        ]);

        PositionHistory::create([
            'member_id' => $this->member_id,
            'role_id' => $this->role_id,
            'unit_id' => $this->unit_id,
            'action' => 'relieved',
            'performed_by' => auth()->id() ?? 1,
            'performed_at' => now(),
            'remarks' => $remarks,
        ]);
    }

    /**
     * Transfer to another member
     */
    public function transferTo(int $newMemberId, string $remarks = 'Position transferred'): MemberPosition
    {
        $this->relieve("Transferred to another member: $remarks");

        return MemberPosition::create([
            'member_id' => $newMemberId,
            'role_id' => $this->role_id,
            'unit_id' => $this->unit_id,
            'assigned_at' => now(),
            'is_active' => true,
            'remarks' => $remarks,
        ]);
    }

    /**
     * Get duration of position
     */
    public function getDurationDays(): int
    {
        $endDate = $this->relieved_at ?? now();
        return $this->assigned_at->diffInDays($endDate);
    }

    /**
     * Check if position is vacant
     */
    public function isVacant(): bool
    {
        return !$this->is_active && ($this->relieved_at !== null);
    }
}
```

---

## 4. PositionHistory Model (Audit Trail)

```php
<?php
// app/Models/PositionHistory.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PositionHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'member_id',
        'role_id',
        'unit_id',
        'action',
        'performed_by',
        'performed_at',
        'remarks',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
    ];

    /**
     * Immutable: no updates allowed
     */
    public function update(array $attributes = [], array $options = [])
    {
        return false;
    }

    /**
     * Action performed on member
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Action involved this role
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Action in this unit
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'unit_id');
    }

    /**
     * Action performed by this user
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Query scope: by action type
     */
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Query scope: recent records
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('performed_at', '>=', now()->subDays($days))
            ->orderBy('performed_at', 'desc');
    }

    /**
     * Query scope: by performer
     */
    public function scopePerformedBy($query, $userId)
    {
        return $query->where('performed_by', $userId);
    }
}
```

---

## 5. OrganizationalUnit Model (Hierarchy)

```php
<?php
// app/Models/OrganizationalUnit.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrganizationalUnit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'parent_id',
        'name',
        'type',
        'code',
        'description',
    ];

    /**
     * Self-referential: parent unit
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'parent_id');
    }

    /**
     * Self-referential: child units
     */
    public function children(): HasMany
    {
        return $this->hasMany(OrganizationalUnit::class, 'parent_id')
            ->orderBy('name');
    }

    /**
     * Recursive: all children at all levels
     */
    public function allChildren(): HasMany
    {
        return $this->hasMany(OrganizationalUnit::class, 'parent_id')
            ->with('allChildren');
    }

    /**
     * Members in this unit
     */
    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'organizational_unit_id')
            ->where('status', 'active');
    }

    /**
     * All positions in unit
     */
    public function positions(): HasMany
    {
        return $this->hasMany(MemberPosition::class, 'unit_id');
    }

    /**
     * Active positions in unit
     */
    public function activePositions(): HasMany
    {
        return $this->positions()
            ->where('is_active', true)
            ->with('member', 'role');
    }

    /**
     * Committees in this unit
     */
    public function committees(): HasMany
    {
        return $this->hasMany(Committee::class, 'organizational_unit_id');
    }

    /**
     * Query scope: by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Query scope: root nodes only
     */
    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get full path from root
     */
    public function getHierarchyPath(): array
    {
        $path = [];
        $current = $this;

        while ($current) {
            array_unshift($path, $current);
            $current = $current->parent;
        }

        return $path;
    }

    /**
     * Get president of unit
     */
    public function getPresident(): ?MemberPosition
    {
        return $this->activePositions()
            ->join('roles', 'member_positions.role_id', '=', 'roles.id')
            ->where('roles.title', 'President')
            ->first('member_positions.*');
    }

    /**
     * Get general secretary
     */
    public function getGeneralSecretary(): ?MemberPosition
    {
        return $this->activePositions()
            ->join('roles', 'member_positions.role_id', '=', 'roles.id')
            ->where('roles.title', 'General Secretary')
            ->first('member_positions.*');
    }

    /**
     * Get all members recursively (including sub-units)
     */
    public function getAllMembers(): \Illuminate\Database\Eloquent\Collection
    {
        $members = $this->members;

        foreach ($this->children as $child) {
            $members = $members->merge($child->getAllMembers());
        }

        return $members;
    }

    /**
     * Get member count (recursive)
     */
    public function getMemberCount(): int
    {
        return $this->getAllMembers()->count();
    }
}
```

---

## 6. Committee Model

```php
<?php
// app/Models/Committee.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Committee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organizational_unit_id',
        'name',
        'description',
        'established_date',
        'is_active',
    ];

    protected $casts = [
        'established_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Committee belongs to organizational unit
     */
    public function organizationalUnit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class);
    }

    /**
     * Get committee roles/assignments
     */
    public function roles(): HasMany
    {
        return $this->hasMany(CommitteeRole::class)
            ->where('is_active', true);
    }

    /**
     * Get all members in committee
     */
    public function members()
    {
        return $this->hasManyThrough(
            Member::class,
            CommitteeRole::class,
            'committee_id',
            'id',
            'id',
            'member_id'
        )->where('committee_roles.is_active', true);
    }

    /**
     * Assign member to committee role
     */
    public function assignMember(int $memberId, int $roleId): CommitteeRole
    {
        return CommitteeRole::create([
            'committee_id' => $this->id,
            'member_id' => $memberId,
            'role_id' => $roleId,
            'assigned_at' => now(),
            'is_active' => true,
        ]);
    }

    /**
     * Remove member from committee
     */
    public function removeMember(int $memberId, int $roleId): void
    {
        CommitteeRole::where('committee_id', $this->id)
            ->where('member_id', $memberId)
            ->where('role_id', $roleId)
            ->update([
                'is_active' => false,
                'relieved_at' => now(),
            ]);
    }
}
```

---

## Relationship Summary Diagram

```
User (1) ──────── (1) Member
                    │
                    ├─── (1) OrganizationalUnit
                    ├─ (N) MemberPosition
                    │         │
                    │         ├─── (1) Role
                    │         │
                    │         └─── (1) OrganizationalUnit
                    │
                    └─ (N) PositionHistory

OrganizationalUnit (1) ─── (N) Children (self-ref)
                    │
                    ├─── (1) Parent (self-ref)
                    ├─── (N) Members
                    ├─── (N) Positions
                    └─── (N) Committees

Role (1) ─── (N) MemberPosition
        │                    
        │─── (N) PositionHistory

Committee (1) ─── (N) CommitteeRole
         │                │
         │                └─── (1) Member
         │                      (1) Role
         │
         └─── (1) OrganizationalUnit
```

---

**Document Status:** Complete  
**Version:** 1.0.0  
**Last Updated:** March 2026
