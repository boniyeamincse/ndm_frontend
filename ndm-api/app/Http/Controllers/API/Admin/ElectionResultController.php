<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ElectionResultResource;
use App\Models\Election;
use App\Models\ElectionResult;
use App\Services\ElectionResultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Task 168 — Automated result generation.
 * Tally votes, declare winners, publish results, download reports.
 */
class ElectionResultController extends Controller
{
    public function __construct(private ElectionResultService $resultService) {}

    /**
     * GET results for an election (after tally/publish).
     */
    public function index(int $electionId): JsonResponse
    {
        $election = Election::find($electionId);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        $results = ElectionResult::where('election_id', $electionId)
            ->with(['nomination.candidate'])
            ->orderBy('rank')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => ElectionResultResource::collection($results),
        ]);
    }

    /**
     * POST tally — count votes and persist ranked results.
     */
    public function tally(int $electionId): JsonResponse
    {
        $election = Election::find($electionId);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        $result = $this->resultService->tally($election);

        return response()->json(
            array_merge(['success' => $result['success']], ['message' => $result['message']]),
            $result['success'] ? 200 : 422
        );
    }

    /**
     * POST declare-winners — mark winner rows and note tie-break method.
     */
    public function declareWinners(Request $request, int $electionId): JsonResponse
    {
        $validated = $request->validate([
            'winner_result_ids'  => ['required', 'array', 'min:1'],
            'winner_result_ids.*'=> ['required', 'integer'],
            'tie_break_method'   => ['nullable', 'string', 'in:lot,seniority,admin_decision,re_vote'],
        ]);

        $election = Election::find($electionId);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        $result = $this->resultService->declareWinners(
            $election,
            $validated['winner_result_ids'],
            $validated['tie_break_method'] ?? null,
            Auth::id()
        );

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * POST publish — finalize and publish election results.
     */
    public function publish(int $electionId): JsonResponse
    {
        $election = Election::find($electionId);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        $result = $this->resultService->publishResults($election, Auth::id());

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * GET report — downloadable summary for authorized roles.
     */
    public function report(int $electionId): JsonResponse
    {
        $election = Election::find($electionId);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        $report = $this->resultService->generateReport($election);

        return response()->json(['success' => true, 'data' => $report]);
    }
}
