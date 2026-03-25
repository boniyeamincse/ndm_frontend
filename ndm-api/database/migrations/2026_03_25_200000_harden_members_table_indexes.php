<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Task 15 — Harden member table constraints.
 *
 * Adds performance indexes and missing uniqueness constraints
 * on columns frequently used for filtering, reporting, and auth.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            // Speed up admin member list filtering by status
            if (!$this->indexExists('members', 'members_status_index')) {
                $table->index('status', 'members_status_index');
            }

            // Speed up unit-scoped member lookups
            if (!$this->indexExists('members', 'members_organizational_unit_id_index')) {
                $table->index('organizational_unit_id', 'members_organizational_unit_id_index');
            }

            // Speed up cohort/year reports
            if (!$this->indexExists('members', 'members_join_year_index')) {
                $table->index('join_year', 'members_join_year_index');
            }

            // Speed up demographic queries
            if (!$this->indexExists('members', 'members_gender_index')) {
                $table->index('gender', 'members_gender_index');
            }

            // Composite: common dashboard query (unit + status)
            if (!$this->indexExists('members', 'members_unit_status_index')) {
                $table->index(['organizational_unit_id', 'status'], 'members_unit_status_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropIndex('members_status_index');
            $table->dropIndex('members_organizational_unit_id_index');
            $table->dropIndex('members_join_year_index');
            $table->dropIndex('members_gender_index');
            $table->dropIndex('members_unit_status_index');
        });
    }

    private function indexExists(string $table, string $index): bool
    {
        $connection = Schema::getConnection();
        $driver = $connection->getDriverName();

        if ($driver === 'sqlite') {
            $indexes = DB::select("PRAGMA index_list('{$table}')");

            foreach ($indexes as $existingIndex) {
                if (($existingIndex->name ?? null) === $index) {
                    return true;
                }
            }

            return false;
        }

        if ($driver === 'mysql') {
            $indexes = DB::select("SHOW INDEX FROM `{$table}`");

            foreach ($indexes as $existingIndex) {
                if (($existingIndex->Key_name ?? null) === $index) {
                    return true;
                }
            }

            return false;
        }

        return false;
    }
};
