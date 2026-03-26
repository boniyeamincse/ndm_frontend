<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\DonationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\DonationResource;
use App\Models\Donation;
use App\Models\DonationCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $donations = Donation::with(['campaign', 'member', 'verifier'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('campaign_id'), fn ($q) => $q->where('donation_campaign_id', $request->campaign_id))
            ->when($request->filled('payment_channel'), fn ($q) => $q->where('payment_channel', $request->payment_channel))
            ->when($request->filled('transaction_id'), fn ($q) => $q->where('transaction_id', 'LIKE', '%' . $request->transaction_id . '%'))
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => DonationResource::collection($donations)]);
    }

    public function show(int $id): JsonResponse
    {
        $donation = Donation::with(['campaign', 'member', 'verifier'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => new DonationResource($donation)
        ]);
    }

    public function verify(Request $request, int $id): JsonResponse
    {
        $donation = Donation::findOrFail($id);
        
        if ($donation->status === DonationStatus::VERIFIED) {
            return response()->json(['success' => false, 'message' => 'Donation is already verified.'], 422);
        }

        $validated = $request->validate([
            'note' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($donation, $validated) {
            $donation->update([
                'status' => DonationStatus::VERIFIED,
                'verified_at' => now(),
                'verified_by' => auth()->id(),
                'verification_note' => $validated['note'] ?? $donation->verification_note,
            ]);

            // Update Campaign Progress
            $campaign = $donation->campaign;
            $campaign->increment('current_amount', $donation->amount);
        });

        return response()->json(['success' => true, 'message' => 'Donation verified successfully.']);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $donation = Donation::findOrFail($id);

        if ($donation->status === DonationStatus::VERIFIED) {
            return response()->json(['success' => false, 'message' => 'Cannot reject verified donation. Revert manually if needed.'], 422);
        }

        $validated = $request->validate([
            'note' => 'required|string|max:1000',
        ]);

        $donation->update([
            'status' => DonationStatus::REJECTED,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'verification_note' => $validated['note'],
        ]);

        return response()->json(['success' => true, 'message' => 'Donation rejected.']);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_verified_amount' => Donation::where('status', DonationStatus::VERIFIED)->sum('amount'),
            'total_pending_amount' => Donation::where('status', DonationStatus::PENDING)->sum('amount'),
            'recent_donations_count' => Donation::where('created_at', '>=', now()->subDays(30))->count(),
            'campaign_performance' => DonationCampaign::withCount(['donations' => fn($q) => $q->where('status', DonationStatus::VERIFIED)])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn($c) => [
                    'title' => $c->title,
                    'target' => $c->target_amount,
                    'current' => $c->current_amount,
                    'percent' => $c->target_amount > 0 ? round(($c->current_amount / $c->target_amount) * 100, 2) : 0,
                ]),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }
}
