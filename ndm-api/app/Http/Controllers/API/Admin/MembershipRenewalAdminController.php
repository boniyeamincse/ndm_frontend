<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MembershipRenewalResource;
use App\Http\Resources\ReverificationResource;
use App\Models\MemberReverificationRequest;
use App\Models\MembershipRenewal;
use App\Models\RenewalReminder;
use App\Services\MembershipRenewalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipRenewalAdminController extends Controller
{
    public function __construct(private readonly MembershipRenewalService $service) {}

    public function renewalsIndex(Request $request): JsonResponse
    {
        $query = MembershipRenewal::query()->with('member');

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($year = $request->integer('year')) {
            $query->where('renewal_year', $year);
        }

        $renewals = $query->latest('submitted_at')->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => MembershipRenewalResource::collection($renewals),
            'meta' => [
                'current_page' => $renewals->currentPage(),
                'last_page' => $renewals->lastPage(),
                'per_page' => $renewals->perPage(),
                'total' => $renewals->total(),
            ],
        ]);
    }

    public function renewalsApprove(MembershipRenewal $renewal): JsonResponse
    {
        $renewal->update([
            'status' => 'approved',
            'processed_at' => now(),
            'processed_by' => auth()->id(),
            'admin_note' => request('admin_note'),
        ]);

        $renewal->member?->update([
            'last_renewed_at' => now()->toDateString(),
            'membership_expires_at' => now()->addYear()->toDateString(),
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Membership renewal approved.',
            'data' => new MembershipRenewalResource($renewal->fresh('member')),
        ]);
    }

    public function renewalsReject(MembershipRenewal $renewal): JsonResponse
    {
        $renewal->update([
            'status' => 'rejected',
            'processed_at' => now(),
            'processed_by' => auth()->id(),
            'admin_note' => request('admin_note'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Membership renewal rejected.',
            'data' => new MembershipRenewalResource($renewal->fresh('member')),
        ]);
    }

    public function reverificationIndex(Request $request): JsonResponse
    {
        $query = MemberReverificationRequest::query()->with('member');

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        $items = $query->latest('submitted_at')->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => ReverificationResource::collection($items),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function reverificationApprove(MemberReverificationRequest $reverification): JsonResponse
    {
        $reverification->update([
            'status' => 'approved',
            'processed_at' => now(),
            'processed_by' => auth()->id(),
            'admin_note' => request('admin_note'),
        ]);

        $payload = $reverification->profile_update_payload ?? [];
        if (! empty($payload) && $reverification->member) {
            $allowed = collect($payload)
                ->only(['full_name', 'phone', 'program', 'session', 'department', 'email'])
                ->all();

            if (! empty($allowed)) {
                $reverification->member->update($allowed);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Re-verification request approved.',
            'data' => new ReverificationResource($reverification->fresh('member')),
        ]);
    }

    public function reverificationReject(MemberReverificationRequest $reverification): JsonResponse
    {
        $reverification->update([
            'status' => 'rejected',
            'processed_at' => now(),
            'processed_by' => auth()->id(),
            'admin_note' => request('admin_note'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Re-verification request rejected.',
            'data' => new ReverificationResource($reverification->fresh('member')),
        ]);
    }

    public function reminders(Request $request): JsonResponse
    {
        $query = RenewalReminder::query()->with('member');

        if ($status = $request->string('delivery_status')->value()) {
            $query->where('delivery_status', $status);
        }

        if ($type = $request->string('reminder_type')->value()) {
            $query->where('reminder_type', $type);
        }

        $items = $query->latest()->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function queueReminders(): JsonResponse
    {
        return response()->json($this->service->queueReminders());
    }

    public function processExpiry(): JsonResponse
    {
        return response()->json($this->service->processAutoExpiry());
    }

    public function retentionReport(Request $request): JsonResponse
    {
        $report = $this->service->renewalRetentionReport([
            'from' => $request->query('from'),
            'to' => $request->query('to'),
        ]);

        return response()->json(['success' => true, 'data' => $report]);
    }
}