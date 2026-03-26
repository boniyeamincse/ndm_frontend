<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Records that a specific member has voted in an election.
 * Does NOT store which nominee they voted for — that is in ElectionVote.
 * The vote_token UUID links this receipt to the corresponding ballot
 * for dispute-resolution purposes only.
 */
class ElectionVoterReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'voter_member_id',
        'vote_token',
        'cast_at',
        'ip_hash',
    ];

    protected $casts = [
        'cast_at' => 'datetime',
    ];

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    public function voter(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'voter_member_id');
    }
}
