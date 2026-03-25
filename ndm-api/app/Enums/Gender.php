<?php

namespace App\Enums;

enum Gender: string
{
    case MALE   = 'male';
    case FEMALE = 'female';
    case OTHER  = 'other';

    public function label(): string
    {
        return match($this) {
            self::MALE   => 'Male',
            self::FEMALE => 'Female',
            self::OTHER  => 'Other',
        };
    }

    /** Returns allowed string values for use in validation rules. */
    public static function allowedValues(): array
    {
        return array_column(self::cases(), 'value');
    }
}
