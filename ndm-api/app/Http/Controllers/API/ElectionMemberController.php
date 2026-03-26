<?php

namespace App\Http\Controllers\API;

use App\Enums\ElectionStatus;
use App\Enums\MemberStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CastVoteRequest;
use App\Http\Requests\StoreNominationRequest;
use App\Http\Resources\ElectionNominationResource;
use App\Http\Resources\ElectionResource;
use App\Http\Resources\ElectionResultResource;
use App\Models\Election;
use App\Models\ElectionNomination;
use App\Models\ElectionResult;
use App\Models\Member;
use App\Services\VotingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Member-facing election endpoints.
 * Task 166 — nomination submission by self.
 * Task 167 — cast vote.
 */
class ElectionMemberController extends Controller
{
    public function __construct(private VotingService $votingService) {}

    /**
     * List open/active elections visible to the authenticated member.
     */
    public function index(): JsonResponse
    {
        $elections = Election::with('scopeUnit')
            ->whereIn('status', [
                ElectionStatus::NOMINATION_OPEN->value,
                ElectionStatus::NOMINATION_CLOSED->value,
                ElectionStatus::VOTING_OPEN->value,
                ElectionStatus::VOTING_CLOSED->value,
                ElectionStatus::RESULT_PUBLISHED->value,
            ])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => ElectionResource::collection($elections),
        ]);
    }

    /**
     * View a single election with published nominees (no voter details exposed).
     */
    public function show(int $id): JsonResponse
    {
        $election = Election::with(['scopeUnit', 'publishedNominations.candidate'])->find($id);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        if ($election->status->value === ElectionStatus::DRAFT->value) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        $member    = $this->resolveAuthMember();
        $hasVoted  = $member ? $this->votingService->hasVoted($election, $member) : false;

        return response()->json([
            'success'   => true,
            'has_voted' => $hasVoted,
            'data'      => new ElectionResource($election),
            'nominees'  => ElectionNominationResource::collection(
                $election->publishedNominations->load('candidate')
            ),
        ]);
    }

    /**
     * Submit a self-nomination for a candidate (member nominates themselves).
     */
    public function nominate(StoreNominationRequest $request): JsonResponse
    {
        $member = $this->resolveAuthMember();

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $election = Election::find($request->election_id);

        if (! $election || ! $election->isNominatable()) {
            return response()->json(['message' => 'Nominations are not currently open for this election.'], 422);
        }

        // Prevent duplicate self-nomination
        if (ElectionNomination::where('election_id', $election->id)
            ->where('member_id', $member->id)
            ->exists()) {
            return response()->json(['message' => 'You have already submitted a nomination for this election.'], 422);
        }

        $nomination = ElectionNomination::create([
            'election_id'           => $election->id,
            'member_id'             => $member->id,
            'proposer_id'           => $request->proposer_id,
            'seconder_id'           => $request->seconder_id,
            'position_title'        => $request->position_title,
            'candidate_statement'   => $request->candidate_statement,
            'status'                => 'pending',
            'is_published'          => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your nomination has been submitted and is pending review.',
            'data'    => new ElectionNominationResource($nomination->load(['candidate', 'proposer', 'seconder'])),
        ], 201);
    }

    /**
     * Withdraw own nomination (only if still pending or approved and voting not yet open).
     */
    public function withdrawNomination(int $electionId): JsonResponse
    {
        $member = $this->resolveAuthMember();

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $nomination = ElectionNomination::where('election_id', $electionId)
            ->where('member_id', $member->id)
            ->first();

        if (! $nomination) {
            return response()->json(['message' => 'No nomination found for this election.'], 404);
        }

        if (in_array($nomination->status->value, ['withdrawn', 'rejected'])) {
            return response()->json(['message' => 'Nomination is already withdrawn or rejected.'], 422);
        }

        $election = Election::find($electionId);
        if ($election && in_array($election->status->value, ['voting_open', 'voting_closed', 'result_published'])) {
            return response()->json(['message' => 'Nominations cannot be withdrawn after voting has started.'], 422);
        }

        $nomination->update(['status' => 'withdrawn', 'is_published' => false]);

        return response()->json(['success' => true, 'message' => 'Nomination withdrawn successfully.']);
    }

    /**
     * Cast vote(s) for one or more nominees.
     * Task 167 — secure digital voting engine.
     */
    public function vote(CastVoteRequest $request, int $electionId): JsonResponse
    {
        $member = $this->resolveAuthMember();

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $election = Election::find($electionId);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        $result = $this->votingService->castVote(
            $election,
            $member,
            $request->nomination_ids
        );

        return response()->json(
            ['success' => $result['success'], 'message' => $result['message']],
            $result['success'] ? 200 : 422
        );
    }

    /**
     * View published results for a completed election.
     */
    public function results(int $electionId): JsonResponse
    {
        $election = Election::find($electionId);

        if (! $election || $election->status !== ElectionStatus::RESULT_PUBLISHED) {
            return response()->json(['message' => 'Results are not yet published for this election.'], 404);
        }

        $results = ElectionResult::where('election_id', $electionId)
            ->with(['nomination.candidate'])
            ->orderBy('rank')
            ->get();

        return response()->json([
            'success'           => true,
            'total_votes_cast'  => $election->totalVotesCast(),
            'data'              => ElectionResultResource::collection($results),
        ]);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private function resolveAuthMember(): ?Member
    {
        return Member::where('user_id', Auth::id())
            ->where('status', MemberStatus::ACTIVE->value)
            ->first();
    }
}
