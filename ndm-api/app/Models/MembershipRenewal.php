<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipRenewal extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'renewal_year',
        'renewal_window_start',
        'renewal_window_end',
        'fee_amount',
        'payment_reference',
        'status',
        'submitted_at',
        'processed_at',
        'processed_by',
        'admin_note',
    ];

    protected $casts = [
        'renewal_window_start' => 'date',
        'renewal_window_end' => 'date',
        'fee_amount' => 'decimal:2',
        'submitted_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}