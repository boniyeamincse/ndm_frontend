<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignPositionRequest;
use App\Http\Requests\TransferPositionRequest;
use App\Models\MemberPosition;
use App\Models\PositionHistory;
use App\Services\PositionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

/**
 * Admin — Organizational Position management.
 *
 * Routes (admin middleware group):
 *  GET    /admin/positions                  → index()
 *  GET    /admin/positions/history          → history()
 *  POST   /admin/positions                  → store()    — assign
 *  POST   /admin/positions/{id}/transfer    → transfer() — transfer to new member
 *  DELETE /admin/positions/{id}             → destroy()  — relieve
 */
class PositionController extends Controller
{
    public function __construct(private readonly PositionService $service) {}

    /**
     * GET /admin/positions
     * List positions, filterable by unit_id, role_id, is_active.
     */
    public function index(Request $request): JsonResponse
    {
        $positions = MemberPosition::with(['member', 'role', 'unit', 'assignedBy'])
            ->when($request->unit_id, fn ($q) => $q->where('unit_id', $request->unit_id))
            ->when($request->role_id, fn ($q) => $q->where('role_id', $request->role_id))
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderByDesc('assigned_at')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $positions]);
    }

    /**
     * GET /admin/positions/history
     * Full audit log of all position actions.
     */
    public function history(Request $request): JsonResponse
    {
        $history = PositionHistory::with(['member', 'role', 'unit', 'performedBy'])
            ->when($request->member_id, fn ($q) => $q->where('member_id', $request->member_id))
            ->when($request->action, fn ($q) => $q->where('action', $request->action))
            ->orderByDesc('performed_at')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $history]);
    }

    /**
     * POST /admin/positions
     * Assign a member to a role within an organisational unit.
     */
    public function store(AssignPositionRequest $request): JsonResponse
    {
        try {
            $position = $this->service->assign($request->validated(), Auth::id());
        } catch (InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Position assigned successfully.',
            'data'    => $position,
        ], 201);
    }

    /**
     * POST /admin/positions/{id}/transfer
     * Transfer a position from its current holder to another member.
     */
    public function transfer(int $id, TransferPositionRequest $request): JsonResponse
    {
        $position = MemberPosition::findOrFail($id);

        try {
            $newPosition = $this->service->transfer(
                $position,
                $request->validated('new_member_id'),
                Auth::id(),
                $request->validated('notes')
            );
        } catch (InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Position transferred successfully.',
            'data'    => $newPosition,
        ]);
    }

    /**
     * DELETE /admin/positions/{id}
     * Relieve (remove) a position.
     */
    public function destroy(int $id): JsonResponse
    {
        $position = MemberPosition::findOrFail($id);
        $this->service->relieve($position, Auth::id());

        return response()->json(['success' => true, 'message' => 'Position relieved successfully.']);
    }
}
