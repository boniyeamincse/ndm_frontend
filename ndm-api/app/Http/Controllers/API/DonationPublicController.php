<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\DonationCampaignResource;
use App\Http\Resources\DonationResource;
use App\Models\Donation;
use App\Models\DonationCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DonationPublicController extends Controller
{
    public function campaigns(): JsonResponse
    {
        $campaigns = DonationCampaign::with(['unit'])
            ->where('status', 'active')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => DonationCampaignResource::collection($campaigns)
        ]);
    }

    public function submitDonation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'donation_campaign_id' => 'required|exists:donation_campaigns,id',
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'nullable|email|max:255',
            'donor_mobile' => 'nullable|string|max:20',
            'amount' => 'required|numeric|min:1',
            'payment_channel' => 'required|string|max:50',
            'payment_reference' => 'nullable|string|max:100',
            'transaction_id' => 'nullable|string|max:100',
        ]);

        $donation = Donation::create(array_merge($validated, [
            'status' => 'pending',
            'member_id' => auth('sanctum')->id() ? auth('sanctum')->user()->member?->id : null,
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your donation record has been submitted for verification.',
            'data' => new DonationResource($donation)
        ], 201);
    }
}
