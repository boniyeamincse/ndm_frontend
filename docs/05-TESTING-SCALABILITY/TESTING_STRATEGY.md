# NDM System - Testing Strategy, Best Practices & Scalability Guide

## Enterprise-Grade Quality Assurance & Optimization

---

## Part 1: Testing Strategy

### 1.1 Unit Tests

```php
<?php
// tests/Unit/RoleAssignmentEngineTest.php

namespace Tests\Unit;

use App\Models\Member;
use App\Models\Role;
use App\Models\OrganizationalUnit;
use App\Models\User;
use App\Services\RoleAssignmentService;
use App\Exceptions\RoleAssignmentException;
use Tests\TestCase;

class RoleAssignmentEngineTest extends TestCase
{
    private RoleAssignmentService $service;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(RoleAssignmentService::class);
        $this->admin = User::factory()->admin()->create();
    }

    // ====== TEST: Validation Rules ======

    public function test_cannot_assign_to_inactive_member()
    {
        $member = Member::factory()->create(['status' => 'suspended']);
        $role = Role::factory()->create(['created_by' => $this->admin]);
        $unit = OrganizationalUnit::factory()->create();

        $this->expectException(RoleAssignmentException::class);
        $this->expectExceptionMessage('Member must exist and be in active status');

        $this->service->validateAssignment($member->id, $role->id, $unit->id);
    }

    public function test_cannot_assign_inactive_role()
    {
        $member = Member::factory()->create(['status' => 'active']);
        $role = Role::factory()->create(['is_active' => false, 'created_by' => $this->admin]);
        $unit = OrganizationalUnit::factory()->create();

        $this->expectException(RoleAssignmentException::class);
        $this->expectExceptionMessage('Selected role is not available');

        $this->service->validateAssignment($member->id, $role->id, $unit->id);
    }

    public function test_role_must_match_unit_type()
    {
        $member = Member::factory()->create(['status' => 'active']);
        
        $divisionUnit = OrganizationalUnit::factory()
            ->create(['type' => 'DIVISION']);
        
        $centralRole = Role::factory()
            ->create(['unit_type' => 'CENTRAL', 'created_by' => $this->admin]);

        $this->expectException(RoleAssignmentException::class);
        $this->expectExceptionMessage('can only be assigned to CENTRAL units');

        $this->service->validateAssignment($member->id, $centralRole->id, $divisionUnit->id);
    }

    // ====== TEST: Single Holder Enforcement ======

    public function test_single_holder_role_auto_relieves_previous_holder()
    {
        $firstMember = Member::factory()->create(['status' => 'active']);
        $secondMember = Member::factory()->create(['status' => 'active']);
        
        $role = Role::factory()->create([
            'max_holders' => 1,
            'created_by' => $this->admin,
        ]);
        
        $unit = OrganizationalUnit::factory()->create(['type' => $role->unit_type]);

        // Assign to first member
        $position1 = $this->service->assignRole(
            $firstMember->id,
            $role->id,
            $unit->id,
            'First assignment'
        );

        $this->assertTrue($position1->is_active);
        $this->assertNull($position1->relieved_at);

        // Assign to second member
        $position2 = $this->service->assignRole(
            $secondMember->id,
            $role->id,
            $unit->id,
            'Second assignment'
        );

        $this->assertTrue($position2->is_active);

        // First position should be relieved
        $position1->refresh();
        $this->assertFalse($position1->is_active);
        $this->assertNotNull($position1->relieved_at);
    }

    // ====== TEST: Audit Logging ======

    public function test_position_assignment_creates_audit_log()
    {
        $member = Member::factory()->create(['status' => 'active']);
        $role = Role::factory()->create(['created_by' => $this->admin]);
        $unit = OrganizationalUnit::factory()->create(['type' => $role->unit_type]);

        $this->service->assignRole($member->id, $role->id, $unit->id, 'Test assignment');

        $this->assertDatabaseHas('position_history', [
            'member_id' => $member->id,
            'role_id' => $role->id,
            'unit_id' => $unit->id,
            'action' => 'assigned',
        ]);
    }

    // ====== TEST: Role Vacancy Status ======

    public function test_get_role_vacancy_status()
    {
        $role = Role::factory()->create([
            'max_holders' => 3,
            'created_by' => $this->admin,
        ]);
        
        $unit = OrganizationalUnit::factory()->create(['type' => $role->unit_type]);
        $members = Member::factory(2)->create(['status' => 'active']);

        // Assign role to 2 members
        foreach ($members as $member) {
            $this->service->assignRole($member->id, $role->id, $unit->id);
        }

        $vacancy = $this->service->getRoleVacancy($role->id, $unit->id);

        $this->assertFalse($vacancy['is_full']);
        $this->assertEquals(2, $vacancy['filled_positions']);
        $this->assertEquals(1, $vacancy['vacancies']);
        $this->assertTrue($vacancy['can_assign_more']);
    }
}
```

### 1.2 Feature (Integration) Tests

```php
<?php
// tests/Feature/PositionAssignmentApiTest.php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\Role;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Tests\TestCase;

class PositionAssignmentApiTest extends TestCase
{
    private User $admin;
    private User $member;
    private Member $memberRecord;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->admin()->create();
        $this->member = User::factory()->member()->create();
        $this->memberRecord = Member::factory()->create([
            'user_id' => $this->member->id,
            'status' => 'active',
        ]);
    }

    // ====== TEST: API Endpoint Access Control ======

    public function test_unauthenticated_user_cannot_access_api()
    {
        $response = $this->postJson('/api/v1/positions/assign', [
            'member_id' => 1,
            'role_id' => 1,
            'unit_id' => 1,
        ]);

        $response->assertStatus(401);
        $response->assertJson(['error' => true]);
    }

    public function test_member_without_permission_cannot_assign_positions()
    {
        $response = $this->actingAs($this->member)
            ->postJson('/api/v1/positions/assign', [
                'member_id' => $this->memberRecord->id,
                'role_id' => 1,
                'unit_id' => 1,
            ]);

        $response->assertStatus(403);
    }

    // ====== TEST: Position Assignment Workflow ======

    public function test_admin_can_assign_position_successfully()
    {
        $role = Role::factory()->create(['created_by' => $this->admin]);
        $unit = OrganizationalUnit::factory()->create(['type' => $role->unit_type]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/positions/assign', [
                'member_id' => $this->memberRecord->id,
                'role_id' => $role->id,
                'unit_id' => $unit->id,
                'remarks' => 'Test assignment via API',
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id',
                'member',
                'role',
                'unit',
                'assigned_at',
                'is_active',
            ],
        ]);

        $this->assertDatabaseHas('member_positions', [
            'member_id' => $this->memberRecord->id,
            'role_id' => $role->id,
            'unit_id' => $unit->id,
            'is_active' => true,
        ]);
    }

    public function test_invalid_role_returns_validation_error()
    {
        $unit = OrganizationalUnit::factory()->create();

        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/positions/assign', [
                'member_id' => $this->memberRecord->id,
                'role_id' => 99999, // Non-existent
                'unit_id' => $unit->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('role_id');
    }

    // ====== TEST: Query Functionality ======

    public function test_can_retrieve_current_positions()
    {
        $role = Role::factory()->create(['created_by' => $this->admin]);
        $unit = OrganizationalUnit::factory()->create(['type' => $role->unit_type]);

        $this->actingAs($this->admin)->postJson('/api/v1/positions/assign', [
            'member_id' => $this->memberRecord->id,
            'role_id' => $role->id,
            'unit_id' => $unit->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/positions/current');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }
}
```

### 1.3 Test Database Seeding

```php
<?php
// database/seeders/TestingSeeder.php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Member;
use App\Models\Role;
use App\Models\OrganizationalUnit;
use Illuminate\Database\Seeder;

class TestingSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->admin()->create([
            'email' => 'admin@test.local',
            'password' => bcrypt('password'),
        ]);

        // Create organizational hierarchy
        $central = OrganizationalUnit::create([
            'name' => 'Central Committee (Test)',
            'type' => 'CENTRAL',
            'code' => 'TEST-CENTRAL',
        ]);

        $divisions = OrganizationalUnit::factory(3)
            ->create(['parent_id' => $central->id, 'type' => 'DIVISION']);

        // Create roles
        Role::factory()->create([
            'title' => 'President',
            'unit_type' => 'CENTRAL',
            'max_holders' => 1,
            'rank_order' => 1,
            'created_by' => $admin->id,
        ]);

        // Create test members
        $testUsers = User::factory(10)
            ->create();

        foreach ($testUsers as $user) {
            Member::factory()->create([
                'user_id' => $user->id,
                'status' => 'active',
                'organizational_unit_id' => $divisions->random()->id,
            ]);
        }
    }
}
```

---

## Part 2: Performance Optimization

### 2.1 Query Optimization Checklist

```php
✅ DO:
- Use eager loading with->with()
- Use select() to limit columns
- Use whereIn() for multiple IDs
- Use pluck() instead of map() when getting single column
- Use indexes on foreign keys

❌ DON'T:
- Use get() in loops (N+1 problem)
- Use orWhere() excessively
- Select unnecessary columns
- Create new queries in foreach
- Use LIKE with leading %
```

### 2.2 Database Indexing Strategy

```sql
-- Critical Indexes for Performance
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_active_units ON members(status, organizational_unit_id);
CREATE INDEX idx_positions_active ON member_positions(is_active, role_id, unit_id);
CREATE INDEX idx_positions_member ON member_positions(member_id);
CREATE INDEX idx_positions_role_unit ON member_positions(role_id, unit_id);
CREATE INDEX idx_history_member_date ON position_history(member_id, performed_at DESC);
CREATE INDEX idx_history_date ON position_history(performed_at DESC);
CREATE INDEX idx_units_parent_type ON organizational_units(parent_id, type);
CREATE INDEX idx_org_units_tree ON organizational_units(parent_id);

-- Composite Indexes for complex queries
CREATE INDEX idx_position_current ON member_positions(unit_id, role_id, is_active);
```

### 2.3 Caching Strategy

```php
<?php
// app/Services/CachingService.php

namespace App\Services;

use App\Models\OrganizationalUnit;
use App\Models\MemberPosition;
use Illuminate\Support\Facades\Cache;

class CachingService
{
    const CACHE_TTL = 3600; // 1 hour

    /**
     * Get organization tree from cache
     */
    public static function getOrgTree()
    {
        return Cache::remember('org_tree_hierarchy', self::CACHE_TTL, function () {
            return OrganizationalUnit::with('children')
                ->whereNull('parent_id')
                ->get();
        });
    }

    /**
     * Get role holders from cache
     */
    public static function getRoleHolders(int $roleId, int $unitId)
    {
        $key = sprintf('role:%d:unit:%d:holders', $roleId, $unitId);
        
        return Cache::remember($key, self::CACHE_TTL, function () use ($roleId, $unitId) {
            return MemberPosition::where('role_id', $roleId)
                ->where('unit_id', $unitId)
                ->where('is_active', true)
                ->with('member')
                ->get();
        });
    }

    /**
     * Invalidate caches when data changes
     */
    public static function invalidateOrgTree()
    {
        Cache::forget('org_tree_hierarchy');
    }

    public static function invalidateRoleCache(int $roleId, int $unitId)
    {
        $key = sprintf('role:%d:unit:%d:holders', $roleId, $unitId);
        Cache::forget($key);
    }
}
```

### 2.4 Query Monitoring & Optimization

```php
<?php
// Monitor queries in development
if (env('APP_DEBUG')) {
    \Illuminate\Support\Facades\DB::listen(function ($query) {
        if ($query->time > 1000) { // > 1 second
            \Log::warning('Slow Query', [
                'query' => $query->sql,
                'bindings' => $query->bindings,
                'time' => $query->time,
            ]);
        }
    });
}
```

---

## Part 3: Scalability Architecture

### 3.1 Horizontal Scaling

```
┌─────────────────────────────────┐
│       Load Balancer             │
│   (Nginx/HAProxy)               │
│   Round-robin, Sticky Sessions  │
└────────────┬──────────────┬─────┘
             │              │
    ┌────────▼────┐  ┌─────▼────────┐
    │ API Server 1 │  │ API Server 2  │
    │ (Laravel)   │  │ (Laravel)     │
    └────────┬────┘  └─────┬────────┘
             │              │
             └──────┬───────┘
                    │
        ┌───────────▼──────────┐
        │  Shared Cache Layer  │
        │  (Redis Cluster)     │
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────────────┐
        │  PostgreSQL Primary           │
        │  (Write Operations)           │
        └───────────┬──────────────────┘
                    │
        ┌───────────▼──────────────────┐
        │  PostgreSQL Read Replicas (2) │
        │  (Read-heavy Queries)        │
        └──────────────────────────────┘
```

### 3.2 Database Replication Configuration

```sql
-- Primary Server (writes)
-- postgresql.conf
wal_level = replica
max_wal_senders = 10
wal_keep_size = 1GB

-- Replica Server (reads)
-- recovery.conf
primary_conninfo = 'host=primary.db.local'
```

### 3.3 Load Testing

```php
<?php
// tests/Performance/LoadTest.php

use App\Models\Member;
use App\Models\Role;
use App\Models\OrganizationalUnit;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PositionAssignmentLoadTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Simulate 1000 concurrent position assignments
     */
    public function test_can_handle_high_volume_assignments()
    {
        $role = Role::factory()->create();
        $unit = OrganizationalUnit::factory()->create(['type' => $role->unit_type]);
        $members = Member::factory(1000)->create(['status' => 'active']);

        $startTime = microtime(true);

        foreach ($members as $member) {
            $this->postJson('/api/v1/positions/assign', [
                'member_id' => $member->id,
                'role_id' => $role->id,
                'unit_id' => $unit->id,
            ]);
        }

        $duration = microtime(true) - $startTime;
        $avgTime = $duration / 1000;

        $this->assertLessThan(0.1, $avgTime, 'Average request time should be < 100ms');
    }
}
```

---

## Part 4: Best Practices Checklist

### 4.1 Code Quality Standards

```markdown
## SOLID Principles

- ✅ Single Responsibility: Each class one reason to change
- ✅ Open/Closed: Extend behavior, don't modify
- ✅ Liskov: Subtypes substitutable for base types
- ✅ Interface Segregation: Clients depend on specific interfaces
- ✅ Dependency Inversion: Depend on abstractions, not implementations

## Clean Code

- ✅ Meaningful naming conventions
- ✅ Functions/methods < 20 lines
- ✅ Comments on WHY, not WHAT
- ✅ Single entry/exit points
- ✅ Proper error handling

## Security

- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (Eloquent)
- ✅ XSS protection via JSON responses
- ✅ CORS properly configured
- ✅ Rate limiting in place
- ✅ JWT token expiration
```

### 4.2 Deployment Checklist

```bash
# Pre-deployment
□ Run all tests: php artisan test
□ Code quality check: ./vendor/bin/phpstan analyse
□ Security audit: composer audit
□ Database backup: pg_dump
□ Clear caches: php artisan cache:clear

# Deployment
□ Pull latest code
□ Run migrations: php artisan migrate --force
□ Seed permissions: php artisan db:seed --class=PermissionsSeeder
□ Clear caches: php artisan config:cache
□ Restart services: supervisorctl restart laravel-queue

# Post-deployment
□ Monitor error logs
□ Verify API health: /api/v1/health
□ Test key workflows
□ Monitor performance metrics
```

---

**Document Status:** Complete  
**Version:** 1.0.0  
**Last Updated:** March 2026
