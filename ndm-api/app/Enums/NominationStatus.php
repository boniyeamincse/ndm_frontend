<?php

namespace App\Enums;

enum NominationStatus: string
{
    case PENDING   = 'pending';
    case APPROVED  = 'approved';
    case REJECTED  = 'rejected';
    case WITHDRAWN = 'withdrawn';

    public function label(): string
    {
        return match($this) {
            self::PENDING   => 'Pending Review',
            self::APPROVED  => 'Approved',
            self::REJECTED  => 'Rejected',
            self::WITHDRAWN => 'Withdrawn',
        };
    }

    public function isActive(): bool
    {
        return $this === self::APPROVED;
    }

    public static function allowedValues(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function toSelectMap(): array
    {
        return array_combine(
            array_column(self::cases(), 'value'),
            array_map(fn($c) => $c->label(), self::cases())
        );
    }
}
