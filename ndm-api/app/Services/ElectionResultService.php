<?php

namespace App\Services;

use App\Enums\ElectionStatus;
use App\Enums\NominationStatus;
use App\Models\Election;
use App\Models\ElectionNomination;
use App\Models\ElectionResult;
use Illuminate\Support\Facades\DB;

class ElectionResultService
{
    /**
     * Tally votes for all approved nominations and persist results.
     * Existing results for this election are replaced atomically.
     *
     * @return array{success: bool, message: string, results?: \Illuminate\Database\Eloquent\Collection}
     */
    public function tally(Election $election): array
    {
        if (! in_array($election->status->value, [
            ElectionStatus::VOTING_CLOSED->value,
            ElectionStatus::RESULT_PUBLISHED->value,
        ])) {
            return ['success' => false, 'message' => 'Results can only be tallied after voting has closed.'];
        }

        $nominations = ElectionNomination::where('election_id', $election->id)
            ->where('status', NominationStatus::APPROVED->value)
            ->withCount('voteEntries')
            ->get()
            ->sortByDesc('vote_entries_count')
            ->values();

        DB::transaction(function () use ($election, $nominations) {
            // Remove previous tally (re-tally is idempotent)
            ElectionResult::where('election_id', $election->id)->delete();

            $rank = 1;
            $prevCount = null;
            $sameRankCount = 1;

            foreach ($nominations as $index => $nomination) {
                $count = $nomination->vote_entries_count;

                if ($prevCount !== null && $count < $prevCount) {
                    $rank = $index + 1;
                    $sameRankCount = 1;
                } elseif ($prevCount !== null && $count === $prevCount) {
                    $sameRankCount++;
                }

                ElectionResult::create([
                    'election_id'   => $election->id,
                    'nomination_id' => $nomination->id,
                    'vote_count'    => $count,
                    'rank'          => $rank,
                    'is_winner'     => false, // winners declared explicitly via declareWinners()
                ]);

                $prevCount = $count;
            }
        });

        return [
            'success' => true,
            'message' => 'Results tallied successfully.',
            'results' => ElectionResult::where('election_id', $election->id)
                ->with(['nomination.candidate'])
                ->orderBy('rank')
                ->get(),
        ];
    }

    /**
     * Mark specified result rows as winners and optionally note tie-break method.
     *
     * @param  Election  $election
     * @param  array     $winnerResultIds  IDs of ElectionResult rows to mark as winners
     * @param  string|null  $tieBreakMethod
     * @param  int       $declaredByUserId
     */
    public function declareWinners(
        Election $election,
        array $winnerResultIds,
        ?string $tieBreakMethod,
        int $declaredByUserId
    ): array {
        $now = now();

        DB::transaction(function () use ($election, $winnerResultIds, $tieBreakMethod, $declaredByUserId, $now) {
            // Reset all winners for idempotency
            ElectionResult::where('election_id', $election->id)
                ->update(['is_winner' => false, 'tie_break_method' => null, 'declared_by' => null, 'declared_at' => null]);

            ElectionResult::where('election_id', $election->id)
                ->whereIn('id', $winnerResultIds)
                ->update([
                    'is_winner'         => true,
                    'tie_break_method'  => $tieBreakMethod,
                    'declared_by'       => $declaredByUserId,
                    'declared_at'       => $now,
                ]);
        });

        return ['success' => true, 'message' => 'Winners declared successfully.'];
    }

    /**
     * Publish the results and transition election status.
     */
    public function publishResults(Election $election, int $publishedByUserId): array
    {
        if (! ElectionResult::where('election_id', $election->id)->where('is_winner', true)->exists()) {
            return ['success' => false, 'message' => 'Please declare at least one winner before publishing results.'];
        }

        $election->update([
            'status'               => ElectionStatus::RESULT_PUBLISHED->value,
            'result_published_at'  => now(),
        ]);

        return ['success' => true, 'message' => 'Election results published.'];
    }

    /**
     * Generate a summary report array for download/display.
     */
    public function generateReport(Election $election): array
    {
        $election->load(['scopeUnit', 'creator']);
        $results = ElectionResult::where('election_id', $election->id)
            ->with(['nomination.candidate'])
            ->orderBy('rank')
            ->get();

        $totalVotes = $election->voterReceipts()->count();

        return [
            'election' => [
                'id'                  => $election->id,
                'title'               => $election->title,
                'election_type'       => $election->election_type?->label(),
                'scope_unit'          => $election->scopeUnit?->name,
                'voting_period'       => [
                    'start' => $election->voting_start_at?->toDateTimeString(),
                    'end'   => $election->voting_end_at?->toDateTimeString(),
                ],
                'result_published_at' => $election->result_published_at?->toDateTimeString(),
                'total_votes_cast'    => $totalVotes,
            ],
            'results' => $results->map(fn($r) => [
                'rank'           => $r->rank,
                'is_winner'      => $r->is_winner,
                'vote_count'     => $r->vote_count,
                'vote_share_pct' => $totalVotes > 0
                    ? round(($r->vote_count / $totalVotes) * 100, 2)
                    : 0,
                'candidate'      => $r->nomination->candidate ? [
                    'member_id' => $r->nomination->candidate->member_id,
                    'full_name' => $r->nomination->candidate->full_name,
                ] : null,
                'position_title'    => $r->nomination->position_title,
                'tie_break_method'  => $r->tie_break_method,
            ])->values(),
        ];
    }
}
