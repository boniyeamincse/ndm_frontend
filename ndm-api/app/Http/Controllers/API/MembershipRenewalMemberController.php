<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMembershipRenewalRequest;
use App\Http\Requests\StoreReverificationRequest;
use App\Http\Resources\MembershipRenewalResource;
use App\Http\Resources\ReverificationResource;
use App\Models\MemberReverificationRequest;
use App\Models\MembershipRenewal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipRenewalMemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $member = $request->user()?->member;

        if (! $member) {
            return response()->json(['success' => false, 'message' => 'Member profile not found.'], 404);
        }

        $renewals = MembershipRenewal::where('member_id', $member->id)->latest()->get();
        $reverification = MemberReverificationRequest::where('member_id', $member->id)->latest()->get();

        return response()->json([
            'success' => true,
            'data' => [
                'member' => [
                    'id' => $member->id,
                    'member_id' => $member->member_id,
                    'full_name' => $member->full_name,
                    'membership_expires_at' => $member->membership_expires_at?->toDateString(),
                    'last_renewed_at' => $member->last_renewed_at?->toDateString(),
                    'status' => $member->status,
                ],
                'renewals' => MembershipRenewalResource::collection($renewals),
                'reverification_requests' => ReverificationResource::collection($reverification),
            ],
        ]);
    }

    public function submitRenewal(StoreMembershipRenewalRequest $request): JsonResponse
    {
        $member = $request->user()?->member;

        if (! $member) {
            return response()->json(['success' => false, 'message' => 'Member profile not found.'], 404);
        }

        $renewal = MembershipRenewal::create([
            'member_id' => $member->id,
            'renewal_year' => $request->integer('renewal_year'),
            'renewal_window_start' => $request->input('renewal_window_start') ?? now()->startOfYear()->toDateString(),
            'renewal_window_end' => $request->input('renewal_window_end') ?? now()->endOfYear()->toDateString(),
            'fee_amount' => $request->input('fee_amount', 0),
            'payment_reference' => $request->input('payment_reference'),
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Membership renewal submitted successfully.',
            'data' => new MembershipRenewalResource($renewal),
        ], 201);
    }

    public function submitReverification(StoreReverificationRequest $request): JsonResponse
    {
        $member = $request->user()?->member;

        if (! $member) {
            return response()->json(['success' => false, 'message' => 'Member profile not found.'], 404);
        }

        $reverification = MemberReverificationRequest::create([
            'member_id' => $member->id,
            'profile_update_payload' => $request->input('profile_update_payload', []),
            'document_recheck_required' => $request->boolean('document_recheck_required'),
            'unit_confirmation_required' => $request->boolean('unit_confirmation_required'),
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Re-verification request submitted successfully.',
            'data' => new ReverificationResource($reverification),
        ], 201);
    }
}