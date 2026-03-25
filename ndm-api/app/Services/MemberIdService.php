<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class MemberIdService
{
    /**
     * Generate an atomic year-sequential member ID.
     * Format: Year + Sequence (e.g., 20261, 20262)
     *
     * @return string
     */
    public function generate(): string
    {
        $year = date('Y');

        return DB::transaction(function () use ($year) {
            // Atomic update or insert
            DB::table('member_id_sequences')->updateOrInsert(
                ['year' => $year],
                ['last_seq' => DB::raw('last_seq + 1')]
            );

            $lastSeq = DB::table('member_id_sequences')
                ->where('year', $year)
                ->value('last_seq');

            return $year . $lastSeq;
        });
    }
}
