<?php

namespace App\Models;

use App\Enums\NominationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ElectionNomination extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'member_id',
        'proposer_id',
        'seconder_id',
        'position_title',
        'candidate_statement',
        'status',
        'is_published',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    protected $casts = [
        'status'        => NominationStatus::class,
        'is_published'  => 'boolean',
        'reviewed_at'   => 'datetime',
    ];

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function proposer(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'proposer_id');
    }

    public function seconder(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'seconder_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function voteEntries(): HasMany
    {
        return $this->hasMany(ElectionVote::class, 'nomination_id');
    }

    public function result(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ElectionResult::class, 'nomination_id');
    }

    public function voteCount(): int
    {
        return $this->voteEntries()->count();
    }

    public function scopeApproved($query)
    {
        return $query->where('status', NominationStatus::APPROVED->value);
    }

    public function scopePublished($query)
    {
        return $query->where('status', NominationStatus::APPROVED->value)
                     ->where('is_published', true);
    }
}
