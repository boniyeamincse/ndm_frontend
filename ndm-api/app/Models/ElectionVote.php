<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Stores the actual ballot choice.
 * Separated from ElectionVoterReceipt to maintain ballot secrecy.
 * The vote_token UUID matches a receipt row but voter identity is only
 * resolvable by cross-joining both tables (restricted to dispute-resolution).
 */
class ElectionVote extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'nomination_id',
        'vote_token',
    ];

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    public function nomination(): BelongsTo
    {
        return $this->belongsTo(ElectionNomination::class, 'nomination_id');
    }
}
