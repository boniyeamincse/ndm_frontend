<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RenewalReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'channel',
        'reminder_type',
        'delivery_status',
        'scheduled_for',
        'sent_at',
        'failure_reason',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}