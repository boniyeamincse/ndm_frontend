<?php

namespace App\Services;

use App\Enums\ElectionStatus;
use App\Enums\NominationStatus;
use App\Models\Election;
use App\Models\ElectionNomination;
use App\Models\ElectionVoterReceipt;

class ElectionAnalyticsService
{
    /**
     * Overall turnout and participation metrics for one election.
     */
    public function electionSummary(Election $election): array
    {
        $totalEligible     = $this->eligibleVoterCount($election);
        $totalVotesCast    = ElectionVoterReceipt::where('election_id', $election->id)->count();
        $turnoutPct        = $totalEligible > 0
            ? round(($totalVotesCast / $totalEligible) * 100, 2)
            : 0;

        $nominations = ElectionNomination::where('election_id', $election->id)
            ->withCount('voteEntries')
            ->get();

        $invalidNominations = $nominations->whereIn(
            'status',
            [NominationStatus::REJECTED->value, NominationStatus::WITHDRAWN->value]
        )->count();

        return [
            'election_id'       => $election->id,
            'title'             => $election->title,
            'status'            => $election->status?->value,
            'total_eligible'    => $totalEligible,
            'total_votes_cast'  => $totalVotesCast,
            'turnout_pct'       => $turnoutPct,
            'total_nominations' => $nominations->count(),
            'approved_nominations' => $nominations->where('status', NominationStatus::APPROVED->value)->count(),
            'invalid_nominations'  => $invalidNominations,
        ];
    }

    /**
     * Unit-wise participation breakdown.
     * Groups voters by their organizational_unit.
     */
    public function unitWiseParticipation(Election $election): array
    {
        $rows = ElectionVoterReceipt::where('election_id', $election->id)
            ->join('members', 'members.id', '=', 'election_voter_receipts.voter_member_id')
            ->join('organizational_units', 'organizational_units.id', '=', 'members.organizational_unit_id')
            ->selectRaw('organizational_units.id as unit_id, organizational_units.name as unit_name, COUNT(*) as votes_cast')
            ->groupBy('organizational_units.id', 'organizational_units.name')
            ->orderByDesc('votes_cast')
            ->get();

        return $rows->map(fn($r) => [
            'unit_id'    => $r->unit_id,
            'unit_name'  => $r->unit_name,
            'votes_cast' => (int) $r->votes_cast,
        ])->values()->toArray();
    }

    /**
     * Candidate performance — vote totals and share per nomination.
     */
    public function candidatePerformance(Election $election): array
    {
        $totalVotes = ElectionVoterReceipt::where('election_id', $election->id)->count();

        $nominations = ElectionNomination::where('election_id', $election->id)
            ->where('status', NominationStatus::APPROVED->value)
            ->withCount('voteEntries')
            ->with('candidate')
            ->get()
            ->sortByDesc('vote_entries_count')
            ->values();

        return $nominations->map(fn($n, $idx) => [
            'rank'           => $idx + 1,
            'nomination_id'  => $n->id,
            'candidate'      => $n->candidate ? [
                'id'        => $n->candidate->id,
                'member_id' => $n->candidate->member_id,
                'full_name' => $n->candidate->full_name,
            ] : null,
            'position_title' => $n->position_title,
            'vote_count'     => $n->vote_entries_count,
            'vote_share_pct' => $totalVotes > 0
                ? round(($n->vote_entries_count / $totalVotes) * 100, 2)
                : 0,
        ])->toArray();
    }

    /**
     * Compare multiple election cycles (turnout comparison).
     *
     * @param  int[]  $electionIds
     */
    public function electionCycleComparison(array $electionIds): array
    {
        $elections = Election::whereIn('id', $electionIds)->get();

        return $elections->map(function ($election) {
            $eligible  = $this->eligibleVoterCount($election);
            $cast      = ElectionVoterReceipt::where('election_id', $election->id)->count();
            return [
                'election_id'      => $election->id,
                'title'            => $election->title,
                'election_type'    => $election->election_type?->value,
                'voting_period'    => $election->voting_start_at?->toDateString() . ' – ' . $election->voting_end_at?->toDateString(),
                'total_eligible'   => $eligible,
                'total_votes_cast' => $cast,
                'turnout_pct'      => $eligible > 0 ? round(($cast / $eligible) * 100, 2) : 0,
            ];
        })->values()->toArray();
    }

    // ── Private helpers ─────────────────────────────────────────────────────

    private function eligibleVoterCount(Election $election): int
    {
        // Scope: active members in the election's unit (or all active members for central elections)
        $query = \App\Models\Member::where('status', \App\Enums\MemberStatus::ACTIVE->value);

        if ($election->scope_unit_id) {
            $query->where('organizational_unit_id', $election->scope_unit_id);
        }

        return $query->count();
    }
}
