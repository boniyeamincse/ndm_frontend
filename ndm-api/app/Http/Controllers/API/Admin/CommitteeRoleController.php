<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Committee;
use App\Models\CommitteeRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class CommitteeRoleController extends Controller
{
    /**
     * Assign a member to a specific role in a committee.
     */
    public function store(Request $request, $committee_id): JsonResponse
    {
        $committee = Committee::find($committee_id);

        if (!$committee) {
            return response()->json(['message' => 'Committee not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'member_id' => 'required|exists:members,id',
            'designation' => 'required|string|max:100', // e.g., President, General Secretary
            'assigned_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if member already has an active role of THIS type in THIS committee
        $existing = CommitteeRole::where('committee_id', $committee_id)
            ->where('member_id', $request->member_id)
            ->where('designation', $request->designation)
            ->where('status', 'active')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Member is already actively assigned to this designation.'], 409);
        }

        $role = CommitteeRole::create([
            'committee_id' => $committee_id,
            'member_id' => $request->member_id,
            'designation' => $request->designation,
            'assigned_date' => $request->assigned_date ?? now(),
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role assigned successfully',
            'data' => $role->load('member')
        ], 201);
    }

    /**
     * Update the role assignment (Status / Designation change).
     */
    public function update(Request $request, $committee_id, $role_id): JsonResponse
    {
        $role = CommitteeRole::where('committee_id', $committee_id)->find($role_id);

        if (!$role) {
            return response()->json(['message' => 'Role assignment not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'designation' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|in:active,resigned,removed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Role assignment updated successfully',
            'data' => $role
        ]);
    }

    /**
     * Completely remove a role assignment from the committee.
     */
    public function destroy($committee_id, $role_id): JsonResponse
    {
        $role = CommitteeRole::where('committee_id', $committee_id)->find($role_id);

        if (!$role) {
            return response()->json(['message' => 'Role assignment not found'], 404);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role assignment removed successfully'
        ]);
    }
}
