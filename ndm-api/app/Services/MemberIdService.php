<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * Atomic year-sequential member ID generator.
 * Format: NDM-SW-YYYY-XXXX  (e.g. NDM-SW-2026-0001)
 *
 * Thread-safe via DB transaction + ON DUPLICATE KEY UPDATE.
 */
class MemberIdService
{
    public function generate(): string
    {
        $year = (int) date('Y');

        return DB::transaction(function () use ($year) {
            if (DB::connection()->getDriverName() === 'sqlite') {
                // SQLite path (used in testing)
                DB::table('member_id_sequences')->updateOrInsert(
                    ['year' => $year],
                    ['last_seq' => DB::raw('last_seq + 1')]
                );
            } else {
                // MySQL atomic path
                DB::statement(
                    'INSERT INTO member_id_sequences (year, last_seq) VALUES (?, 1)
                     ON DUPLICATE KEY UPDATE last_seq = last_seq + 1',
                    [$year]
                );
            }

            $lastSeq = DB::table('member_id_sequences')
                ->where('year', $year)
                ->value('last_seq');

            // NDM-SW-2026-0001
            return sprintf('NDM-SW-%d-%04d', $year, $lastSeq);
        });
    }
}
