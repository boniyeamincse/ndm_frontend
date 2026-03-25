<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MemberPosition;
use App\Models\OrganizationalUnit;
use App\Models\PositionHistory;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PositionServiceTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Member $member;
    private Member $memberB;
    private Role $role;
    private OrganizationalUnit $unit;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email'     => 'admin-pos@example.com',
            'user_type' => 'admin',
            'is_active' => true,
        ]);

        $userA = User::factory()->create(['email' => 'member-a@example.com', 'user_type' => 'member', 'is_active' => true]);
        $this->member = Member::create([
            'user_id'           => $userA->id,
            'member_id'         => 'NDM-SW-2026-0101',
            'full_name'         => 'Member A',
            'join_year'         => 2026,
            'status'            => 'active',
            'present_address'   => 'Dhaka',
            'permanent_address' => 'Dhaka',
        ]);

        $userB = User::factory()->create(['email' => 'member-b@example.com', 'user_type' => 'member', 'is_active' => true]);
        $this->memberB = Member::create([
            'user_id'           => $userB->id,
            'member_id'         => 'NDM-SW-2026-0102',
            'full_name'         => 'Member B',
            'join_year'         => 2026,
            'status'            => 'active',
            'present_address'   => 'Dhaka',
            'permanent_address' => 'Dhaka',
        ]);

        $this->role = Role::create([
            'title'      => 'President',
            'unit_type'  => 'central',
            'rank_order' => 1,
            'is_active'  => true,
            'created_by' => $this->admin->id,
        ]);

        $this->unit = OrganizationalUnit::create([
            'name'      => 'Test Unit',
            'type'      => 'central',
            'is_active' => true,
        ]);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function assignPayload(array $overrides = []): array
    {
        return array_merge([
            'member_id' => $this->member->id,
            'role_id'   => $this->role->id,
            'unit_id'   => $this->unit->id,
        ], $overrides);
    }

    private function makePosition(?int $memberId = null): MemberPosition
    {
        return MemberPosition::create([
            'member_id'   => $memberId ?? $this->member->id,
            'role_id'     => $this->role->id,
            'unit_id'     => $this->unit->id,
            'assigned_by' => $this->admin->id,
            'assigned_at' => now(),
            'is_active'   => true,
        ]);
    }

    // ── Tests ──────────────────────────────────────────────────────────────────

    public function test_admin_can_assign_position(): void
    {
        $response = $this->actingAs($this->admin, 'api')
            ->postJson('/api/admin/positions', $this->assignPayload());

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.member_id', $this->member->id);

        $this->assertDatabaseHas('member_positions', [
            'member_id' => $this->member->id,
            'role_id'   => $this->role->id,
            'unit_id'   => $this->unit->id,
        ]);

        $this->assertDatabaseHas('position_history', [
            'member_id' => $this->member->id,
            'action'    => 'assigned',
        ]);
    }

    public function test_assign_fails_on_duplicate_active_position(): void
    {
        /** @var \App\Services\PositionService $service */
        $service = app(\App\Services\PositionService::class);

        $data = [
            'member_id' => $this->member->id,
            'role_id'   => $this->role->id,
            'unit_id'   => $this->unit->id,
        ];

        // First assignment succeeds
        $service->assign($data, $this->admin->id);

        // Second call: duplicate guard fires (existence check runs before stale-clean)
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('already holds this position');

        $service->assign($data, $this->admin->id);
    }




    public function test_assign_auto_relieves_existing_holder(): void
    {
        // Assign Member A
        $this->actingAs($this->admin, 'api')
            ->postJson('/api/admin/positions', $this->assignPayload())
            ->assertStatus(201);

        // Assign Member B to the same role+unit → should auto-relieve Member A
        $this->actingAs($this->admin, 'api')
            ->postJson('/api/admin/positions', $this->assignPayload(['member_id' => $this->memberB->id]))
            ->assertStatus(201);

        // Member A's position should be gone
        $this->assertDatabaseMissing('member_positions', [
            'member_id' => $this->member->id,
            'role_id'   => $this->role->id,
        ]);

        // History should have relieved event for Member A
        $this->assertDatabaseHas('position_history', [
            'member_id' => $this->member->id,
            'action'    => 'relieved',
        ]);
    }

    public function test_admin_can_relieve_position(): void
    {
        $position = $this->makePosition();

        $this->actingAs($this->admin, 'api')
            ->deleteJson("/api/admin/positions/{$position->id}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('member_positions', ['id' => $position->id]);

        $this->assertDatabaseHas('position_history', [
            'member_id' => $this->member->id,
            'action'    => 'relieved',
        ]);
    }

    public function test_admin_can_transfer_position_to_new_member(): void
    {
        $position = $this->makePosition($this->member->id);

        $this->actingAs($this->admin, 'api')
            ->postJson("/api/admin/positions/{$position->id}/transfer", [
                'new_member_id' => $this->memberB->id,
                'notes'         => 'Transferred due to role change',
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.member_id', $this->memberB->id);

        // Old position gone
        $this->assertDatabaseMissing('member_positions', ['id' => $position->id]);

        // New position exists
        $this->assertDatabaseHas('member_positions', [
            'member_id' => $this->memberB->id,
            'role_id'   => $this->role->id,
        ]);

        // Both history events logged
        $this->assertDatabaseHas('position_history', ['member_id' => $this->member->id, 'action' => 'transferred']);
        $this->assertDatabaseHas('position_history', ['member_id' => $this->memberB->id, 'action' => 'transferred']);
    }

    public function test_transfer_fails_with_invalid_member(): void
    {
        $position = $this->makePosition();

        $this->actingAs($this->admin, 'api')
            ->postJson("/api/admin/positions/{$position->id}/transfer", [
                'new_member_id' => 99999,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['new_member_id']);
    }

    public function test_assign_fails_when_role_unit_type_does_not_match_unit(): void
    {
        $districtRole = Role::create([
            'title' => 'District Secretary',
            'unit_type' => 'district',
            'rank_order' => 2,
            'is_active' => true,
            'created_by' => $this->admin->id,
        ]);

        $this->actingAs($this->admin, 'api')
            ->postJson('/api/admin/positions', [
                'member_id' => $this->member->id,
                'role_id' => $districtRole->id,
                'unit_id' => $this->unit->id,
            ])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'The selected role is not eligible for the selected organizational unit type.');
    }

    public function test_transfer_fails_when_target_member_is_not_active(): void
    {
        $position = $this->makePosition($this->member->id);
        $this->memberB->update(['status' => 'suspended']);

        $this->actingAs($this->admin, 'api')
            ->postJson("/api/admin/positions/{$position->id}/transfer", [
                'new_member_id' => $this->memberB->id,
                'notes' => 'Attempted invalid transfer',
            ])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Only active members can hold organizational positions.');
    }

    public function test_index_lists_positions_with_pagination(): void
    {
        $this->makePosition();

        $this->actingAs($this->admin, 'api')
            ->getJson('/api/admin/positions')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'data' => ['data', 'total']]);
    }

    public function test_history_endpoint_returns_audit_log(): void
    {
        PositionHistory::create([
            'member_id'    => $this->member->id,
            'role_id'      => $this->role->id,
            'unit_id'      => $this->unit->id,
            'action'       => 'assigned',
            'performed_by' => $this->admin->id,
            'performed_at' => now(),
        ]);

        $this->actingAs($this->admin, 'api')
            ->getJson('/api/admin/positions/history')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'data' => ['data', 'total']]);
    }
}
