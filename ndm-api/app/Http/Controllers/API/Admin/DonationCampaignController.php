<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DonationCampaignResource;
use App\Models\DonationCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DonationCampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $campaigns = DonationCampaign::with(['unit'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('unit_id'), fn ($q) => $q->where('organizational_unit_id', $request->unit_id))
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => DonationCampaignResource::collection($campaigns)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'required|numeric|min:1',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'organizational_unit_id' => 'nullable|exists:organizational_units,id',
            'status' => 'nullable|string|in:active,paused,completed,cancelled',
        ]);

        $campaign = DonationCampaign::create(array_merge($validated, [
            'created_by' => auth()->id(),
            'current_amount' => 0,
        ]));

        return response()->json([
            'success' => true, 
            'message' => 'Donation campaign created successfully.', 
            'data' => new DonationCampaignResource($campaign)
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $campaign = DonationCampaign::with(['unit'])->withCount('donations')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => new DonationCampaignResource($campaign)
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $campaign = DonationCampaign::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'sometimes|numeric|min:1',
            'starts_at' => 'sometimes|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'organizational_unit_id' => 'nullable|exists:organizational_units,id',
            'status' => 'sometimes|string|in:active,paused,completed,cancelled',
        ]);

        $campaign->update($validated);

        return response()->json(['success' => true, 'message' => 'Campaign updated.', 'data' => new DonationCampaignResource($campaign)]);
    }

    public function destroy(int $id): JsonResponse
    {
        $campaign = DonationCampaign::findOrFail($id);
        
        if ($campaign->donations()->exists()) {
            return response()->json(['success' => false, 'message' => 'Cannot delete campaign with existing donations.'], 422);
        }

        $campaign->delete();

        return response()->json(['success' => true, 'message' => 'Campaign deleted.']);
    }
}
