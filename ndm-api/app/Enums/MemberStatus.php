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

    /** Returns allowed string values for use in validation rules. */
    public static function allowedValues(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** Returns a key-value map for select inputs and API docs. */
    public static function toSelectMap(): array
    {
        return array_combine(
            array_column(self::cases(), 'value'),
            array_map(fn($c) => $c->label(), self::cases())
        );
    }
}
