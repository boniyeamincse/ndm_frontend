<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberPublicResource;
use App\Models\Member;
use Illuminate\Http\JsonResponse;

class MemberController extends Controller
{
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
