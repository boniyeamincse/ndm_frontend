<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OutreachDeliveryLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'outreach_campaign_id',
        'member_id',
        'connector_id',
        'channel',
        'status',
        'attempt_count',
        'failure_reason',
        'sent_at',
        'delivered_at',
        'opened_at',
        'clicked_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(OutreachCampaign::class, 'outreach_campaign_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function connector(): BelongsTo
    {
        return $this->belongsTo(CommunicationConnector::class, 'connector_id');
    }

    public function retries(): HasMany
    {
        return $this->hasMany(OutreachRetryJob::class, 'outreach_delivery_log_id');
    }
}