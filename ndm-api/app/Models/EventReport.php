<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'summary',
        'outcomes',
        'attendance_insights',
        'budget_effort_notes',
        'approval_status',
        'submitted_by',
        'approved_by',
        'submitted_at',
        'approved_at',
        'moderation_notes',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function media(): HasMany
    {
        return $this->hasMany(EventMedia::class);
    }
}