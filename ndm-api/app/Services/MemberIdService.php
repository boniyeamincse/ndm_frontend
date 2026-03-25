<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class MemberIdService
{
    public function generate(?int $year = null): string
    {
        $year = $year ?? now()->year;

        if (DB::getDriverName() === 'sqlite') {
            return DB::transaction(function () use ($year) {
                $current = (int) DB::table('member_id_sequences')
                    ->where('year', $year)
                    ->value('last_seq');

                $next = $current + 1;

                DB::table('member_id_sequences')->updateOrInsert(
                    ['year' => $year],
                    ['last_seq' => $next]
                );

                return (string) ($year . $next);
            });
        }

        return DB::transaction(function () use ($year) {
            DB::statement(
                'INSERT INTO member_id_sequences (year, last_seq) VALUES (?, 1) ON DUPLICATE KEY UPDATE last_seq = last_seq + 1',
                [$year]
            );

            $seq = DB::table('member_id_sequences')
                ->where('year', $year)
                ->value('last_seq');

            return (string) ($year . $seq);
        });
    }
}
