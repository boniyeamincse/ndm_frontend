<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Committee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class CommitteeController extends Controller
{
    /**
     * Display a listing of committees.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Committee::with(['parent', 'children']);

        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $committees = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $committees
        ]);
    }

    /**
     * Store a newly created committee.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'level' => 'required|in:central,division,district,upazila,union,ward,institutional',
            'parent_id' => 'nullable|exists:committees,id',
            'status' => 'nullable|in:active,expired,dissolved',
            'established_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:established_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $committee = Committee::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Committee created successfully',
            'data' => $committee->fresh(['parent'])
        ], 201);
    }

    /**
     * Display the specified committee.
     */
    public function show($id): JsonResponse
    {
        $committee = Committee::with(['parent', 'children', 'roles.member.user'])->find($id);

        if (!$committee) {
            return response()->json(['message' => 'Committee not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $committee
        ]);
    }

    /**
     * Update the specified committee.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $committee = Committee::find($id);

        if (!$committee) {
            return response()->json(['message' => 'Committee not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'level' => 'sometimes|required|in:central,division,district,upazila,union,ward,institutional',
            'parent_id' => 'nullable|exists:committees,id',
            'status' => 'sometimes|required|in:active,expired,dissolved',
            'established_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:established_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $committee->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Committee updated successfully',
            'data' => $committee->fresh(['parent'])
        ]);
    }

    /**
     * Remove the specified committee.
     */
    public function destroy($id): JsonResponse
    {
        $committee = Committee::find($id);

        if (!$committee) {
            return response()->json(['message' => 'Committee not found'], 404);
        }

        $committee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Committee deleted successfully'
        ]);
    }
}
