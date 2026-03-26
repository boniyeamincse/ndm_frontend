<?php

namespace App\Models;

use App\Enums\DonationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'donation_campaign_id',
        'member_id',
        'donor_name',
        'donor_email',
        'donor_mobile',
        'amount',
        'payment_channel',
        'payment_reference',
        'transaction_id',
        'status',
        'verified_at',
        'verified_by',
        'verification_note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'status' => DonationStatus::class,
        'verified_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(DonationCampaign::class, 'donation_campaign_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
