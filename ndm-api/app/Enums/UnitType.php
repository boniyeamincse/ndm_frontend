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

    /** Returns allowed string values for use in validation rules. */
    public static function allowedValues(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** Valid child types for each unit type — enforces hierarchy. */
    public function allowedChildTypes(): array
    {
        return match($this) {
            self::CENTRAL  => [self::DIVISION, self::CAMPUS],
            self::DIVISION => [self::DISTRICT],
            self::DISTRICT => [self::UPAZILA],
            self::UPAZILA  => [self::UNION, self::CAMPUS],
            self::UNION    => [self::WARD],
            self::WARD     => [self::CAMPUS],
            self::CAMPUS   => [],
        };
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
