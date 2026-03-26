<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Services\ElectionAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Task 169 — Election and voting analytics.
 * Turnout, unit-wise participation, candidate performance, cycle comparison.
 */
class ElectionAnalyticsController extends Controller
{
    public function __construct(private ElectionAnalyticsService $analytics) {}

    /**
     * GET summary — turnout and nomination stats for a single election.
     */
    public function summary(int $electionId): JsonResponse
    {
        $election = Election::find($electionId);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->analytics->electionSummary($election),
        ]);
    }

    /**
     * GET unit-participation — unit-wise voter count breakdown.
     */
    public function unitParticipation(int $electionId): JsonResponse
    {
        $election = Election::find($electionId);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->analytics->unitWiseParticipation($election),
        ]);
    }

    /**
     * GET candidate-performance — vote counts and share per candidate.
     */
    public function candidatePerformance(int $electionId): JsonResponse
    {
        $election = Election::find($electionId);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->analytics->candidatePerformance($election),
        ]);
    }

    /**
     * GET cycle-comparison — compare turnout across multiple election IDs.
     * Query param: ids=1,2,3
     */
    public function cycleComparison(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids'   => ['required', 'string'],
        ]);

        $ids = array_filter(array_map('intval', explode(',', $validated['ids'])));

        if (empty($ids)) {
            return response()->json(['message' => 'Provide at least one election ID via the ids parameter.'], 422);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->analytics->electionCycleComparison($ids),
        ]);
    }
}
