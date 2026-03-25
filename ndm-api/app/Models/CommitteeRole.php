<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommitteeRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'committee_id',
        'member_id',
        'designation',
        'assigned_date',
        'status',
    ];

    protected $casts = [
        'assigned_date' => 'date',
    ];

    public function committee(): BelongsTo
    {
        return $this->belongsTo(Committee::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
