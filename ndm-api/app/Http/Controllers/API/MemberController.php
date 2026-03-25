<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberPublicResource;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'unit_id' => ['nullable', 'integer', 'exists:organizational_units,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = Member::query()
            ->where('status', 'active')
            ->with(['unit'])
            ->when($request->unit_id, fn ($q) => $q->where('organizational_unit_id', $request->unit_id))
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = '%' . trim((string) $request->q) . '%';
                $q->where(function ($inner) use ($term) {
                    $inner->where('full_name', 'like', $term)
                        ->orWhere('member_id', 'like', $term)
                        ->orWhere('institution', 'like', $term);
                });
            })
            ->orderBy('full_name');

        $members = $query->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => MemberPublicResource::collection($members),
            'meta' => [
                'current_page' => $members->currentPage(),
                'per_page' => $members->perPage(),
                'total' => $members->total(),
                'last_page' => $members->lastPage(),
            ],
        ]);
    }

    public function publicProfile(string $memberId): JsonResponse
    {
        $member = Member::where('member_id', $memberId)
            ->where('status', 'active')
            ->with(['unit', 'positions.role', 'positions.unit'])
            ->first();

        if (! $member) {
            return response()->json([
                'success' => false,
                'error' => 'Member not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new MemberPublicResource($member),
        ]);
    }
}
