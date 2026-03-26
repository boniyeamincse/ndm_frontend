<?php

namespace App\Enums;

enum DonationCampaignStatus: string
{
    case ACTIVE = 'active';
    case PAUSED = 'paused';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Active',
            self::PAUSED => 'Paused',
            self::COMPLETED => 'Completed',
            self::CANCELLED => 'Cancelled',
        };
    }
}
