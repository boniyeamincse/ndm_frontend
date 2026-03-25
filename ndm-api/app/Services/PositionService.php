<?php

namespace App\Services;

use App\Models\MemberPosition;
use App\Models\PositionHistory;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Centralizes all position assignment, relief, and transfer business logic.
 * Every operation is wrapped in a DB transaction and writes to position_history.
 */
class PositionService
{
    /**
     * Assign a member to a role in a unit.
     *
     * - Rejects duplicate active assignments for the same member+role+unit.
     * - Auto-relieves the current holder of that role+unit (if any).
     * - Creates the new MemberPosition and logs both history events.
     *
     * @throws InvalidArgumentException if the member already holds this position.
     */
    public function assign(array $data, int $actorId): MemberPosition
    {
        return DB::transaction(function () use ($data, $actorId) {
            // Guard: prevent duplicate active assignment
            if (MemberPosition::where([
                'member_id' => $data['member_id'],
                'role_id'   => $data['role_id'],
                'unit_id'   => $data['unit_id'],
                'is_active' => true,
            ])->exists()) {
                throw new InvalidArgumentException(
                    'This member already holds this position in the selected unit.'
                );
            }

            // Auto-relieve the current holder (if any)
            $existing = MemberPosition::where([
                'role_id'   => $data['role_id'],
                'unit_id'   => $data['unit_id'],
                'is_active' => true,
            ])->first();

            if ($existing) {
                $this->logHistory($existing, 'relieved', $actorId, 'Auto-relieved: replaced by new assignment.');
                $existing->delete();
            }

            // Clean any stale inactive records (unique index safety)
            MemberPosition::where('role_id', $data['role_id'])
                ->where('unit_id', $data['unit_id'])
                ->delete();

            // Create new position
            $position = MemberPosition::create([
                'member_id'   => $data['member_id'],
                'role_id'     => $data['role_id'],
                'unit_id'     => $data['unit_id'],
                'assigned_by' => $actorId,
                'assigned_at' => now(),
                'is_active'   => true,
                'notes'       => $data['notes'] ?? null,
            ]);

            $this->logHistory($position, 'assigned', $actorId, $data['notes'] ?? null);

            return $position->load(['member', 'role', 'unit']);
        });
    }

    /**
     * Relieve (remove) a position and log it.
     */
    public function relieve(MemberPosition $position, int $actorId, string $remarks = 'Manually relieved by admin.'): void
    {
        DB::transaction(function () use ($position, $actorId, $remarks) {
            $this->logHistory($position, 'relieved', $actorId, $remarks);
            $position->delete();
        });
    }

    /**
     * Transfer a position from its current holder to a new member atomically.
     *
     * 1. Relieves the existing holder
     * 2. Assigns the new member to the same role+unit
     *
     * @throws InvalidArgumentException if the new member already holds this position.
     */
    public function transfer(MemberPosition $position, int $newMemberId, int $actorId, ?string $notes = null): MemberPosition
    {
        return DB::transaction(function () use ($position, $newMemberId, $actorId, $notes) {
            // Guard: prevent re-assigning to the same member
            if ($position->member_id === $newMemberId) {
                throw new InvalidArgumentException('Cannot transfer position to the same member.');
            }

            // Guard: new member must not already hold this position elsewhere in same unit
            if (MemberPosition::where([
                'member_id' => $newMemberId,
                'role_id'   => $position->role_id,
                'unit_id'   => $position->unit_id,
                'is_active' => true,
            ])->exists()) {
                throw new InvalidArgumentException(
                    'The target member already holds this position in the selected unit.'
                );
            }

            // Relieve current holder
            $this->logHistory($position, 'transferred', $actorId, 'Position transferred out to another member.');
            $position->delete();

            // Assign new holder
            $newPosition = MemberPosition::create([
                'member_id'   => $newMemberId,
                'role_id'     => $position->role_id,
                'unit_id'     => $position->unit_id,
                'assigned_by' => $actorId,
                'assigned_at' => now(),
                'is_active'   => true,
                'notes'       => $notes,
            ]);

            $this->logHistory($newPosition, 'transferred', $actorId, 'Position transferred in from another member.' . ($notes ? " Notes: {$notes}" : ''));


            return $newPosition->load(['member', 'role', 'unit']);
        });
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private function logHistory(MemberPosition $position, string $action, int $actorId, ?string $remarks): void
    {
        PositionHistory::create([
            'member_id'    => $position->member_id,
            'role_id'      => $position->role_id,
            'unit_id'      => $position->unit_id,
            'action'       => $action,
            'performed_by' => $actorId,
            'performed_at' => now(),
            'remarks'      => $remarks,
        ]);
    }
}
