<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ElectionResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'nomination_id',
        'vote_count',
        'rank',
        'is_winner',
        'tie_break_method',
        'notes',
        'declared_at',
        'declared_by',
    ];

    protected $casts = [
        'is_winner'   => 'boolean',
        'vote_count'  => 'integer',
        'rank'        => 'integer',
        'declared_at' => 'datetime',
    ];

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    public function nomination(): BelongsTo
    {
        return $this->belongsTo(ElectionNomination::class, 'nomination_id');
    }

    public function declaredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'declared_by');
    }
}
