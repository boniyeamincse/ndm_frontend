<?php

namespace App\Enums;

enum ElectionStatus: string
{
    case DRAFT              = 'draft';
    case NOMINATION_OPEN    = 'nomination_open';
    case NOMINATION_CLOSED  = 'nomination_closed';
    case VOTING_OPEN        = 'voting_open';
    case VOTING_CLOSED      = 'voting_closed';
    case RESULT_PUBLISHED   = 'result_published';
    case CANCELLED          = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::DRAFT             => 'Draft',
            self::NOMINATION_OPEN   => 'Nomination Open',
            self::NOMINATION_CLOSED => 'Nomination Closed',
            self::VOTING_OPEN       => 'Voting Open',
            self::VOTING_CLOSED     => 'Voting Closed',
            self::RESULT_PUBLISHED  => 'Result Published',
            self::CANCELLED         => 'Cancelled',
        };
    }

    public function isNominatable(): bool
    {
        return $this === self::NOMINATION_OPEN;
    }

    public function isVotable(): bool
    {
        return $this === self::VOTING_OPEN;
    }

    public function isActive(): bool
    {
        return in_array($this, [
            self::NOMINATION_OPEN,
            self::NOMINATION_CLOSED,
            self::VOTING_OPEN,
            self::VOTING_CLOSED,
        ]);
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
