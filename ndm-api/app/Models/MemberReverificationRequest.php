<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberReverificationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'profile_update_payload',
        'document_recheck_required',
        'unit_confirmation_required',
        'status',
        'submitted_at',
        'processed_at',
        'processed_by',
        'admin_note',
    ];

    protected $casts = [
        'profile_update_payload' => 'array',
        'document_recheck_required' => 'boolean',
        'unit_confirmation_required' => 'boolean',
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