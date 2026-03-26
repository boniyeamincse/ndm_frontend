<?php

namespace App\Models;

use App\Enums\EventStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'event_type',
        'status',
        'visibility',
        'organizational_unit_id',
        'venue',
        'capacity',
        'starts_at',
        'ends_at',
        'requires_approval',
        'approved_by',
        'approved_at',
        'published_at',
        'created_by',
    ];

    protected $casts = [
        'status' => EventStatus::class,
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'approved_at' => 'datetime',
        'published_at' => 'datetime',
        'requires_approval' => 'boolean',
        'capacity' => 'integer',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'organizational_unit_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rsvps(): HasMany
    {
        return $this->hasMany(EventRsvp::class);
    }

    public function report(): HasOne
    {
        return $this->hasOne(EventReport::class);
    }
}