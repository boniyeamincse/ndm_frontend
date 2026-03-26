<?php

namespace App\Models;

use App\Enums\CampaignStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'summary',
        'campaign_type',
        'status',
        'objective',
        'resource_plan',
        'messaging_tracks',
        'organizational_unit_id',
        'owner_user_id',
        'starts_on',
        'ends_on',
        'created_by',
    ];

    protected $casts = [
        'status' => CampaignStatus::class,
        'resource_plan' => 'array',
        'messaging_tracks' => 'array',
        'starts_on' => 'date',
        'ends_on' => 'date',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'organizational_unit_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function checkpoints(): HasMany
    {
        return $this->hasMany(CampaignCheckpoint::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(MemberTask::class);
    }
}