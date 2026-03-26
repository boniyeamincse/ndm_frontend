<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutreachCampaignTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'outreach_campaign_id',
        'member_id',
        'resolved_channel_contact',
        'consent_ok',
    ];

    protected $casts = [
        'consent_ok' => 'boolean',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(OutreachCampaign::class, 'outreach_campaign_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}