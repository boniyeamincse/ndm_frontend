<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email'     => 'admin-role-test@example.com',
            'user_type' => 'admin',
            'is_active' => true,
        ]);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function makeRole(array $attrs = []): Role
    {
        return Role::create(array_merge([
            'title'      => 'test-role-' . uniqid(),
            'unit_type'  => 'central',
            'rank_order' => 50,
            'is_active'  => true,
            'created_by' => $this->admin->id,
        ], $attrs));
    }

    // ── Tests ──────────────────────────────────────────────────────────────────

    public function test_admin_can_list_roles(): void
    {
        $this->makeRole(['title' => 'list-role']);

        $this->actingAs($this->admin, 'api')
            ->getJson('/api/admin/roles')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_admin_can_create_role_with_valid_data(): void
    {
        $response = $this->actingAs($this->admin, 'api')
            ->postJson('/api/admin/roles', [
                'title'       => 'new-unique-role',
                'unit_type'   => 'district',
                'rank_order'  => 10,
                'description' => 'A test role',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'new-unique-role')
            ->assertJsonPath('data.unit_type', 'district');

        $this->assertDatabaseHas('roles', [
            'title'      => 'new-unique-role',
            'unit_type'  => 'district',
            'created_by' => $this->admin->id,
        ]);
    }

    public function test_create_role_fails_without_title(): void
    {
        $this->actingAs($this->admin, 'api')
            ->postJson('/api/admin/roles', ['unit_type' => 'central'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_create_role_fails_without_unit_type(): void
    {
        $this->actingAs($this->admin, 'api')
            ->postJson('/api/admin/roles', ['title' => 'no-unit-type-role'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['unit_type']);
    }

    public function test_create_role_fails_with_duplicate_title(): void
    {
        $this->makeRole(['title' => 'duplicate-role']);

        $this->actingAs($this->admin, 'api')
            ->postJson('/api/admin/roles', ['title' => 'duplicate-role', 'unit_type' => 'central'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_admin_can_update_role(): void
    {
        $role = $this->makeRole(['title' => 'update-me']);

        $this->actingAs($this->admin, 'api')
            ->putJson("/api/admin/roles/{$role->id}", [
                'title'     => 'updated-title',
                'is_active' => false,
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'updated-title')
            ->assertJsonPath('data.is_active', false);
    }

    public function test_admin_can_toggle_role_active_state(): void
    {
        $role = $this->makeRole(['title' => 'toggle-me', 'is_active' => true]);

        // Deactivate
        $this->actingAs($this->admin, 'api')
            ->patchJson("/api/admin/roles/{$role->id}/toggle")
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_active', false);

        // Reactivate
        $this->actingAs($this->admin, 'api')
            ->patchJson("/api/admin/roles/{$role->id}/toggle")
            ->assertStatus(200)
            ->assertJsonPath('data.is_active', true);
    }

    public function test_admin_cannot_delete_system_role(): void
    {
        $sysRole = Role::create([
            'title'      => 'admin',
            'unit_type'  => 'central',
            'is_active'  => true,
            'created_by' => $this->admin->id,
        ]);

        $this->actingAs($this->admin, 'api')
            ->deleteJson("/api/admin/roles/{$sysRole->id}")
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_delete_unused_non_system_role(): void
    {
        $role = $this->makeRole(['title' => 'disposable-role']);

        $this->actingAs($this->admin, 'api')
            ->deleteJson("/api/admin/roles/{$role->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_admin_can_sync_permissions_to_role(): void
    {
        $role  = $this->makeRole(['title' => 'perm-sync-role']);

        $perm1 = Permission::firstOrCreate(
            ['name' => 'members.view'],
            ['group' => 'Members', 'description' => 'View members']
        );
        $perm2 = Permission::firstOrCreate(
            ['name' => 'tasks.view'],
            ['group' => 'Tasks', 'description' => 'View tasks']
        );

        $this->actingAs($this->admin, 'api')
            ->postJson("/api/admin/roles/{$role->id}/permissions", [
                'permission_ids' => [$perm1->id, $perm2->id],
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.permissions');
    }
}
