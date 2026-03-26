<?php

namespace App\Enums;

enum ElectionType: string
{
    case CENTRAL_COMMITTEE  = 'central_committee';
    case UNIT_COMMITTEE     = 'unit_committee';
    case POSITION_SPECIFIC  = 'position_specific';

    public function label(): string
    {
        return match($this) {
            self::CENTRAL_COMMITTEE => 'Central Committee Election',
            self::UNIT_COMMITTEE    => 'Unit Committee Election',
            self::POSITION_SPECIFIC => 'Position-Specific Election',
        };
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
