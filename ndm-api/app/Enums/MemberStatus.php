<?php

namespace App\Enums;

enum MemberStatus: string
{
    case PENDING   = 'pending';
    case ACTIVE    = 'active';
    case SUSPENDED = 'suspended';
    case EXPELLED  = 'expelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING   => 'Pending Approval',
            self::ACTIVE    => 'Active Member',
            self::SUSPENDED => 'Suspended',
            self::EXPELLED  => 'Expelled',
        };
    }

    public function canLogin(): bool
    {
        return $this === self::ACTIVE;
    }

    public function canHoldPosition(): bool
    {
        return $this === self::ACTIVE;
    }
}
