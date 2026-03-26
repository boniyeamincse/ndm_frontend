<?php

namespace App\Services;

use App\Enums\ElectionStatus;
use App\Enums\NominationStatus;
use App\Models\Election;
use App\Models\ElectionNomination;
use App\Models\ElectionVote;
use App\Models\ElectionVoterReceipt;
use App\Models\Member;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VotingService
{
    /**
     * Cast votes for one or more nominations in an election.
     * Enforces: election must be voting_open, member has not already voted,
     * max_votes_per_member limit, nominations must be approved & published,
     * and nominations must belong to this election.
     *
     * @param  Election  $election
     * @param  Member    $voter
     * @param  array     $nominationIds  IDs of nominees being voted for
     * @return array{success: bool, message: string, vote_token?: string}
     */
    public function castVote(Election $election, Member $voter, array $nominationIds): array
    {
        if (! $election->isVotable()) {
            return ['success' => false, 'message' => 'Voting is not currently open for this election.'];
        }

        // Prevent double-voting
        $alreadyVoted = ElectionVoterReceipt::where('election_id', $election->id)
            ->where('voter_member_id', $voter->id)
            ->exists();

        if ($alreadyVoted) {
            return ['success' => false, 'message' => 'You have already voted in this election.'];
        }

        // Enforce max votes per member
        $nominationIds = array_unique($nominationIds);
        if (count($nominationIds) > $election->max_votes_per_member) {
            return [
                'success' => false,
                'message' => "You may vote for a maximum of {$election->max_votes_per_member} candidate(s).",
            ];
        }

        // Validate all nominations belong to this election and are approved+published
        $nominations = ElectionNomination::where('election_id', $election->id)
            ->whereIn('id', $nominationIds)
            ->where('status', NominationStatus::APPROVED->value)
            ->where('is_published', true)
            ->get();

        if ($nominations->count() !== count($nominationIds)) {
            return ['success' => false, 'message' => 'One or more selected nominees are invalid or not eligible for this election.'];
        }

        DB::transaction(function () use ($election, $voter, $nominations) {
            $now = now();
            $ipHash = request()->ip()
                ? hash('sha256', request()->ip())
                : null;

            foreach ($nominations as $nomination) {
                $voteToken = (string) Str::uuid();

                // Receipt: who voted (no choice stored here)
                ElectionVoterReceipt::create([
                    'election_id'      => $election->id,
                    'voter_member_id'  => $voter->id,
                    'vote_token'       => $voteToken,
                    'cast_at'          => $now,
                    'ip_hash'          => $ipHash,
                ]);

                // Ballot: what was voted (no voter identity stored here)
                ElectionVote::create([
                    'election_id'   => $election->id,
                    'nomination_id' => $nomination->id,
                    'vote_token'    => $voteToken,
                ]);
            }
        });

        return ['success' => true, 'message' => 'Your vote has been recorded successfully.'];
    }

    /**
     * Verify whether a given vote_token exists (for voter self-audit only).
     */
    public function verifyToken(string $voteToken): bool
    {
        return ElectionVoterReceipt::where('vote_token', $voteToken)->exists();
    }

    /**
     * Check if a member has already voted in an election.
     */
    public function hasVoted(Election $election, Member $member): bool
    {
        return ElectionVoterReceipt::where('election_id', $election->id)
            ->where('voter_member_id', $member->id)
            ->exists();
    }
}
