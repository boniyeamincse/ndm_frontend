<?php

namespace App\Models;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Election extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'election_type',
        'scope_unit_id',
        'status',
        'max_votes_per_member',
        'min_proposers',
        'nomination_start_at',
        'nomination_end_at',
        'voting_start_at',
        'voting_end_at',
        'result_published_at',
        'created_by',
    ];

    protected $casts = [
        'status'                => ElectionStatus::class,
        'election_type'         => ElectionType::class,
        'nomination_start_at'   => 'datetime',
        'nomination_end_at'     => 'datetime',
        'voting_start_at'       => 'datetime',
        'voting_end_at'         => 'datetime',
        'result_published_at'   => 'datetime',
        'max_votes_per_member'  => 'integer',
        'min_proposers'         => 'integer',
    ];

    public function scopeUnit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'scope_unit_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function nominations(): HasMany
    {
        return $this->hasMany(ElectionNomination::class);
    }

    public function approvedNominations(): HasMany
    {
        return $this->hasMany(ElectionNomination::class)->where('status', 'approved');
    }

    public function publishedNominations(): HasMany
    {
        return $this->hasMany(ElectionNomination::class)
            ->where('status', 'approved')
            ->where('is_published', true);
    }

    public function voterReceipts(): HasMany
    {
        return $this->hasMany(ElectionVoterReceipt::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ElectionVote::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(ElectionResult::class)->orderBy('rank');
    }

    public function isNominatable(): bool
    {
        return $this->status->isNominatable();
    }

    public function isVotable(): bool
    {
        return $this->status->isVotable();
    }

    public function totalVotesCast(): int
    {
        return $this->voterReceipts()->count();
    }
}
