# NDM System - Database Schema & Migration Guide

## Overview
Complete PostgreSQL database schema with migration files, indexing strategy, and performance considerations.

---

## Migration Files

### 1. Create Organizational Units Table

```php
<?php
// database/migrations/2026_03_25_000001_create_organizational_units_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('organizational_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('organizational_units')
                ->cascadeOnDelete();
            
            $table->string('name');
            $table->enum('type', ['CENTRAL', 'DIVISION', 'DISTRICT', 'UPAZILA', 'UNION', 'CAMPUS']);
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->integer('hierarchy_level')->storedAs(
                'CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END'
            );
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('parent_id');
            $table->index('type');
            $table->index(['parent_id', 'type']);
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizational_units');
    }
};
```

### 2. Create Roles (Political) Table

```php
<?php
// database/migrations/2026_03_25_000002_create_roles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('title', 100);
            $table->enum('unit_type', ['CENTRAL', 'DIVISION', 'DISTRICT', 'UPAZILA', 'UNION', 'CAMPUS']);
            $table->integer('rank_order')->comment('1 = highest priority');
            $table->text('description')->nullable();
            $table->integer('max_holders')->nullable()->comment('NULL = unlimited, 1 = single');
            
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('unit_type');
            $table->index(['unit_type', 'rank_order']);
            $table->index('is_active');
            $table->unique(['title', 'unit_type', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
```

### 3. Create Members Table

```php
<?php
// database/migrations/2026_03_25_000003_create_members_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('member_id', 30)->unique();
            $table->string('full_name');
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('nid_or_bc', 50)->nullable();
            $table->string('blood_group', 5)->nullable();
            
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('present_address')->nullable();
            $table->text('permanent_address')->nullable();
            
            $table->string('institution')->nullable();
            $table->string('department')->nullable();
            $table->string('session', 20)->nullable();
            
            $table->string('photo_path')->nullable();
            $table->string('nid_doc_path')->nullable();
            $table->string('student_id_doc_path')->nullable();
            
            $table->enum('status', ['pending', 'active', 'suspended', 'expelled'])->default('pending');
            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            
            $table->year('join_year');
            $table->foreignId('organizational_unit_id')
                ->nullable()
                ->constrained('organizational_units')
                ->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('status');
            $table->index('organizational_unit_id');
            $table->index('member_id');
            $table->index(['status', 'organizational_unit_id']);
            $table->fullText('full_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
```

### 4. Create Member Positions Table

```php
<?php
// database/migrations/2026_03_25_000004_create_member_positions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('member_positions', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('organizational_units')->cascadeOnDelete();
            
            $table->timestamp('assigned_at');
            $table->timestamp('relieved_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('remarks')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('member_id');
            $table->index('role_id');
            $table->index('unit_id');
            $table->index('is_active');
            $table->index(['role_id', 'unit_id', 'is_active']);
            
            // Constraint: One active position per role per unit
            $table->unique(['role_id', 'unit_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_positions');
    }
};
```

### 5. Create Position History (Audit) Table

```php
<?php
// database/migrations/2026_03_25_000005_create_position_history_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('position_history', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('organizational_units')->cascadeOnDelete();
            
            $table->enum('action', ['assigned', 'relieved', 'transferred']);
            $table->foreignId('performed_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('performed_at');
            $table->text('remarks')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            // Indexes (optimized for audit queries)
            $table->index('member_id');
            $table->index('role_id');
            $table->index('performed_by');
            $table->index(['member_id', 'performed_at']);
            $table->index(['performed_at', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('position_history');
    }
};
```

### 6. Create Committees Table

```php
<?php
// database/migrations/2026_03_25_000006_create_committees_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('committees', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('organizational_unit_id')
                ->constrained('organizational_units')
                ->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            
            $table->date('established_date')->nullable();
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('organizational_unit_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('committees');
    }
};
```

### 7. Create Committee Roles Table

```php
<?php
// database/migrations/2026_03_25_000007_create_committee_roles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('committee_roles', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('committee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            
            $table->timestamp('assigned_at');
            $table->timestamp('relieved_at')->nullable();
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
            // Constraint: One active role per committee per member
            $table->unique(['committee_id', 'member_id', 'role_id', 'is_active']);
            
            // Indexes
            $table->index('committee_id');
            $table->index('member_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('committee_roles');
    }
};
```

---

## Performance Tuning

### Query Optimization Examples

```php
// ✅ GOOD: Get organization tree efficiently
$units = OrganizationalUnit::with('children')
    ->whereNull('parent_id')
    ->get();

// ❌ BAD: N+1 query problem
$units = OrganizationalUnit::all();
foreach ($units as $unit) {
    $children = $unit->children; // Query inside loop
}

// ✅ GOOD: Get active members with positions
$members = Member::where('status', 'active')
    ->with([
        'user',
        'organizationalUnit',
        'positions' => fn($q) => $q->where('is_active', true),
        'positions.role',
        'positions.unit'
    ])
    ->get();

// ✅ GOOD: Get current president of each unit
$presidents = DB::table('member_positions')
    ->join('roles', 'member_positions.role_id', '=', 'roles.id')
    ->join('members', 'member_positions.member_id', '=', 'members.id')
    ->where('roles.title', 'President')
    ->where('member_positions.is_active', true)
    ->select(
        'member_positions.unit_id',
        'members.full_name',
        'members.member_id'
    )
    ->groupBy('member_positions.unit_id')
    ->get();
```

### Materialized Views (for heavy reports)

```sql
-- Create materialized view for faster reporting
CREATE MATERIALIZED VIEW vw_organization_hierarchy AS
SELECT
    ou.id,
    ou.parent_id,
    ou.name,
    ou.type,
    ou.code,
    COUNT(DISTINCT m.id) as member_count,
    COUNT(DISTINCT mp.id) as position_count
FROM organizational_units ou
LEFT JOIN members m ON m.organizational_unit_id = ou.id AND m.status = 'active'
LEFT JOIN member_positions mp ON mp.unit_id = ou.id AND mp.is_active = true
GROUP BY ou.id, ou.parent_id, ou.name, ou.type, ou.code;

CREATE INDEX idx_vw_hierarchy_parent ON vw_organization_hierarchy(parent_id);
CREATE INDEX idx_vw_hierarchy_type ON vw_organization_hierarchy(type);

-- Refresh (schedule this as cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY vw_organization_hierarchy;
```

---

## Database Seeding

### Seed Organizational Hierarchy

```php
<?php
// database/seeders/OrganizationSeeder.php

namespace Database\Seeders;

use App\Models\OrganizationalUnit;
use App\Enums\UnitType;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        // Central Committee
        $central = OrganizationalUnit::create([
            'name' => 'National Student Wing',
            'type' => UnitType::CENTRAL,
            'code' => 'NDM-CENTRAL',
        ]);

        // Divisions
        $divisions = [
            'Dhaka', 'Chittagong', 'Khulna', 'Rajshahi',
            'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'
        ];

        foreach ($divisions as $divName) {
            $div = OrganizationalUnit::create([
                'parent_id' => $central->id,
                'name' => "{$divName} Division",
                'type' => UnitType::DIVISION,
                'code' => strtoupper(substr($divName, 0, 3)) . '-DIV',
            ]);

            // Districts within division
            $this->createDistricts($div, $divName);
        }
    }

    private function createDistricts($division, $divName): void
    {
        // Example district mapping
        $districtMap = [
            'Dhaka' => ['Dhaka', 'Gazipur', 'Narayanganj', 'Manikganj'],
            'Chittagong' => ['Chittagong', 'Cox Bazar', 'Rangamati', 'Bandarban'],
            // ... more districts
        ];

        foreach ($districtMap[$divName] ?? [] as $distName) {
            OrganizationalUnit::create([
                'parent_id' => $division->id,
                'name' => "{$distName} District",
                'type' => UnitType::DISTRICT,
                'code' => strtoupper(substr($distName, 0, 3)) . '-DIST',
            ]);
        }
    }
}
```

---

**Document Status:** Complete  
**Version:** 1.0.0
