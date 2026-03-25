<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\MemberPosition;
use App\Models\PositionHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PositionController extends Controller
{
    /**
     * GET /admin/positions
     * List all positions (default: active). Filterable by unit_id, role_id, is_active.
     */
    public function index(Request $request)
    {
        $query = MemberPosition::with(['member', 'role', 'unit', 'assignedBy'])
            ->when($request->unit_id, fn ($q) => $q->where('unit_id', $request->unit_id))
            ->when($request->role_id, fn ($q) => $q->where('role_id', $request->role_id))
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderByDesc('assigned_at');

        return response()->json(['data' => $query->paginate(20)]);
    }

    /**
     * GET /admin/positions/history
     * Full audit log of all position actions.
     */
    public function history(Request $request)
    {
        $query = PositionHistory::with(['member', 'role', 'unit', 'performedBy'])
            ->when($request->member_id, fn ($q) => $q->where('member_id', $request->member_id))
            ->when($request->action, fn ($q) => $q->where('action', $request->action))
            ->orderByDesc('performed_at');

        return response()->json(['data' => $query->paginate(20)]);
    }

    /**
     * POST /admin/positions
     * Assign a member to a role within an organisational unit.
     * Auto-relieves the current holder of that role in the same unit.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'member_id' => 'required|integer|exists:members,id',
            'role_id'   => 'required|integer|exists:roles,id',
            'unit_id'   => 'required|integer|exists:organizational_units,id',
            'notes'     => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Prevent assigning the same role to the same member in the same unit twice.
        if (MemberPosition::where([
            'member_id' => $data['member_id'],
            'role_id'   => $data['role_id'],
            'unit_id'   => $data['unit_id'],
            'is_active' => true,
        ])->exists()) {
            return response()->json([
                'message' => 'This member already holds this position in the selected unit.',
            ], 422);
        }

        // Relieve the current holder of this role+unit (if any) and log it.
        $existing = MemberPosition::where([
            'role_id'   => $data['role_id'],
            'unit_id'   => $data['unit_id'],
            'is_active' => true,
        ])->first();

        if ($existing) {
            PositionHistory::create([
                'member_id'    => $existing->member_id,
                'role_id'      => $existing->role_id,
                'unit_id'      => $existing->unit_id,
                'action'       => 'relieved',
                'performed_by' => Auth::id(),
                'performed_at' => now(),
                'remarks'      => 'Auto-relieved: replaced by new assignment.',
            ]);
            $existing->delete();
        }

        // Remove any stale inactive record for the same role+unit to satisfy the unique index.
        MemberPosition::where('role_id', $data['role_id'])
            ->where('unit_id', $data['unit_id'])
            ->delete();

        $position = MemberPosition::create([
            'member_id'   => $data['member_id'],
            'role_id'     => $data['role_id'],
            'unit_id'     => $data['unit_id'],
            'assigned_by' => Auth::id(),
            'assigned_at' => now(),
            'is_active'   => true,
            'notes'       => $data['notes'] ?? null,
        ]);

        PositionHistory::create([
            'member_id'    => $data['member_id'],
            'role_id'      => $data['role_id'],
            'unit_id'      => $data['unit_id'],
            'action'       => 'assigned',
            'performed_by' => Auth::id(),
            'performed_at' => now(),
            'remarks'      => $data['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Position assigned successfully.',
            'data'    => $position->load(['member', 'role', 'unit']),
        ], 201);
    }

    /**
     * DELETE /admin/positions/{id}
     * Relieve (remove) a position and log it to position_history.
     */
    public function destroy(int $id)
    {
        $position = MemberPosition::findOrFail($id);

        PositionHistory::create([
            'member_id'    => $position->member_id,
            'role_id'      => $position->role_id,
            'unit_id'      => $position->unit_id,
            'action'       => 'relieved',
            'performed_by' => Auth::id(),
            'performed_at' => now(),
            'remarks'      => 'Manually relieved by admin.',
        ]);

        $position->delete();

        return response()->json(['message' => 'Position relieved successfully.']);
    }
}
