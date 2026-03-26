<?php

namespace App\Enums;

enum DonationStatus: string
{
    case PENDING = 'pending';
    case VERIFIED = 'verified';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::VERIFIED => 'Verified',
            self::REJECTED => 'Rejected',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'amber',
            self::VERIFIED => 'emerald',
            self::REJECTED => 'rose',
        };
    }
}
