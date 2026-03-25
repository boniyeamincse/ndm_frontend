<?php

namespace App\Enums;

enum UnitType: string
{
    case CENTRAL  = 'central';
    case DIVISION = 'division';
    case DISTRICT = 'district';
    case UPAZILA  = 'upazila';
    case UNION    = 'union';
    case WARD     = 'ward';
    case CAMPUS   = 'campus';

    public function label(): string
    {
        return match($this) {
            self::CENTRAL  => 'Central Committee',
            self::DIVISION => 'Division Committee',
            self::DISTRICT => 'District Committee',
            self::UPAZILA  => 'Upazila Committee',
            self::UNION    => 'Union Committee',
            self::WARD     => 'Ward Committee',
            self::CAMPUS   => 'Campus / Institution',
        };
    }
}
