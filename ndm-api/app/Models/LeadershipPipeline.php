<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadershipPipeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'competency_level',
        'readiness_score',
        'mentorship_track',
        'recommended_role',
        'eligible_for_promotion',
        'notes',
    ];

    protected $casts = [
        'eligible_for_promotion' => 'boolean',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}