<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutreachRetryJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'outreach_delivery_log_id',
        'retry_number',
        'next_retry_at',
        'status',
        'failure_reason',
    ];

    protected $casts = [
        'next_retry_at' => 'datetime',
    ];

    public function deliveryLog(): BelongsTo
    {
        return $this->belongsTo(OutreachDeliveryLog::class, 'outreach_delivery_log_id');
    }
}