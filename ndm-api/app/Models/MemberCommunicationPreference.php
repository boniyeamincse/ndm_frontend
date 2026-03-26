<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberCommunicationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'sms_opt_in',
        'whatsapp_opt_in',
        'email_opt_in',
        'unsubscribed_at',
        'unsubscribe_scope',
        'unsubscribe_reason',
        'updated_by',
    ];

    protected $casts = [
        'sms_opt_in' => 'boolean',
        'whatsapp_opt_in' => 'boolean',
        'email_opt_in' => 'boolean',
        'unsubscribed_at' => 'datetime',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}