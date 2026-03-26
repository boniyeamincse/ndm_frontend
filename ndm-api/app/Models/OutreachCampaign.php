<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OutreachCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subject',
        'message_body',
        'channel',
        'audience_segment_id',
        'custom_filters',
        'template_meta',
        'status',
        'scheduled_at',
        'sent_at',
        'recipient_estimate',
        'sent_count',
        'failed_count',
        'opened_count',
        'clicked_count',
        'requires_approval',
        'approved_by',
        'approved_at',
        'created_by',
    ];

    protected $casts = [
        'custom_filters' => 'array',
        'template_meta' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'approved_at' => 'datetime',
        'requires_approval' => 'boolean',
    ];

    public function segment(): BelongsTo
    {
        return $this->belongsTo(AudienceSegment::class, 'audience_segment_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function targets(): HasMany
    {
        return $this->hasMany(OutreachCampaignTarget::class);
    }

    public function deliveryLogs(): HasMany
    {
        return $this->hasMany(OutreachDeliveryLog::class);
    }
}