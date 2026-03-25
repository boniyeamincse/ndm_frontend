<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MemberPosition;
use App\Models\OrganizationalUnit;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationalUnitManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin-units@example.com',
            'user_type' => 'admin',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_create_unit_with_generated_code(): void
    {
        $response = $this->actingAs($this->admin, 'api')
            ->postJson('/api/admin/units', [
                'name' => 'Dhaka Division',
                'type' => 'division',
                'description' => 'Dhaka divisional committee',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Dhaka Division');

        $this->assertDatabaseHas('organizational_units', [
            'name' => 'Dhaka Division',
            'type' => 'division',
            'is_active' => true,
        ]);
    }

    public function test_admin_cannot_create_invalid_child_unit_hierarchy(): void
    {
        $parent = OrganizationalUnit::factory()->ofType(\App\Enums\UnitType::UNION)->create();

        $this->actingAs($this->admin, 'api')
            ->postJson('/api/admin/units', [
                'name' => 'Dhaka District',
                'type' => 'district',
                'parent_id' => $parent->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['parent_id']);
    }

    public function test_admin_can_update_unit_and_prevent_cycle(): void
    {
        $division = OrganizationalUnit::factory()->ofType(\App\Enums\UnitType::DIVISION)->create(['name' => 'Dhaka Division']);
        $district = OrganizationalUnit::factory()->ofType(\App\Enums\UnitType::DISTRICT)->withParent($division)->create(['name' => 'Dhaka District']);

        $this->actingAs($this->admin, 'api')
            ->putJson("/api/admin/units/{$division->id}", [
                'parent_id' => $district->id,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['parent_id']);
    }

    public function test_admin_can_archive_unit_only_when_safe(): void
    {
        $unit = OrganizationalUnit::factory()->ofType(\App\Enums\UnitType::DIVISION)->create();
        $memberUser = User::factory()->create(['user_type' => 'member', 'is_active' => true]);
        Member::create([
            'user_id' => $memberUser->id,
            'member_id' => 'NDM-SW-2026-5001',
            'full_name' => 'Assigned Member',
            'join_year' => 2026,
            'status' => 'active',
            'organizational_unit_id' => $unit->id,
            'present_address' => 'Dhaka',
            'permanent_address' => 'Dhaka',
        ]);

        $this->actingAs($this->admin, 'api')
            ->patchJson("/api/admin/units/{$unit->id}/toggle")
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        Member::query()->where('organizational_unit_id', $unit->id)->delete();

        $this->actingAs($this->admin, 'api')
            ->patchJson("/api/admin/units/{$unit->id}/toggle")
            ->assertStatus(200)
            ->assertJsonPath('data.is_active', 0);
    }

    public function test_admin_cannot_delete_unit_with_positions_or_children(): void
    {
        $unit = OrganizationalUnit::factory()->ofType(\App\Enums\UnitType::CENTRAL)->create();
        OrganizationalUnit::factory()->ofType(\App\Enums\UnitType::DIVISION)->withParent($unit)->create();

        $this->actingAs($this->admin, 'api')
            ->deleteJson("/api/admin/units/{$unit->id}")
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        $unitWithoutChildren = OrganizationalUnit::factory()->ofType(\App\Enums\UnitType::CENTRAL)->create();
        $memberUser = User::factory()->create(['user_type' => 'member', 'is_active' => true]);
        $member = Member::create([
            'user_id' => $memberUser->id,
            'member_id' => 'NDM-SW-2026-5002',
            'full_name' => 'Position Holder',
            'join_year' => 2026,
            'status' => 'active',
            'present_address' => 'Dhaka',
            'permanent_address' => 'Dhaka',
        ]);
        $role = Role::create([
            'title' => 'Central Role',
            'unit_type' => 'central',
            'rank_order' => 1,
            'is_active' => true,
            'created_by' => $this->admin->id,
        ]);
        MemberPosition::create([
            'member_id' => $member->id,
            'role_id' => $role->id,
            'unit_id' => $unitWithoutChildren->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now(),
            'is_active' => true,
        ]);

        $this->actingAs($this->admin, 'api')
            ->deleteJson("/api/admin/units/{$unitWithoutChildren->id}")
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }
}