<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MigrationSeederSmokeTest extends TestCase
{
    public function test_schema_can_run_fresh_migration_in_testing_environment(): void
    {
        $this->artisan('migrate:fresh', ['--force' => true])->assertExitCode(0);

        $this->assertTrue(Schema::hasTable('migrations'));
        $this->assertTrue(Schema::hasTable('users'));
        $this->assertTrue(Schema::hasTable('members'));
        $this->assertTrue(Schema::hasTable('organizational_units'));
    }

    public function test_database_seeder_runs_cleanly_after_fresh_migration(): void
    {
        $this->artisan('migrate:fresh', ['--force' => true])->assertExitCode(0);
        $this->artisan('db:seed', ['--force' => true])->assertExitCode(0);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@ndm.org.bd',
            'user_type' => 'admin',
        ]);

        $this->assertGreaterThan(0, DB::table('organizational_units')->count());
        $this->assertGreaterThan(0, DB::table('roles')->count());
        $this->assertGreaterThan(0, DB::table('members')->count());
    }
}
