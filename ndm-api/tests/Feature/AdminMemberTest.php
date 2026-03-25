<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMemberTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'email' => 'admin-test@example.com',
            'user_type' => 'admin',
            'is_active' => true,
        ]);
    }

    private function createMember(string $status = 'pending', string $memberId = '2026881'): Member
    {
        $user = User::factory()->create([
            'email' => strtolower($memberId) . '@example.com',
            'user_type' => 'member',
            'is_active' => true,
        ]);

        return Member::create([
            'user_id' => $user->id,
            'member_id' => $memberId,
            'full_name' => 'Member ' . $memberId,
            'join_year' => (int) now()->year,
            'status' => $status,
            'present_address' => 'Dhaka',
            'permanent_address' => 'Dhaka',
        ]);
    }

    public function test_admin_can_list_members_with_status_filter(): void
    {
        $admin = $this->createAdmin();
        $this->createMember('pending', '2026882');
        $this->createMember('active', '2026883');

        $response = $this->actingAs($admin, 'api')->getJson('/api/admin/members?status=pending');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.member_id', '2026882');
    }

    public function test_admin_can_approve_pending_member(): void
    {
        $admin = $this->createAdmin();
        $member = $this->createMember('pending', '2026884');

        $this->actingAs($admin, 'api')
            ->postJson('/api/admin/members/' . $member->id . '/approve')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => 'active',
        ]);
    }

    public function test_admin_can_reject_member_and_remove_user(): void
    {
        $admin = $this->createAdmin();
        $member = $this->createMember('pending', '2026885');
        $userId = $member->user_id;

        $this->actingAs($admin, 'api')
            ->postJson('/api/admin/members/' . $member->id . '/reject', ['reason' => 'Incomplete data'])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('members', ['id' => $member->id]);
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_admin_can_suspend_and_expel_members(): void
    {
        $admin = $this->createAdmin();
        $activeMember = $this->createMember('active', '2026886');

        $this->actingAs($admin, 'api')
            ->postJson('/api/admin/members/' . $activeMember->id . '/suspend')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('members', [
            'id' => $activeMember->id,
            'status' => 'suspended',
        ]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/admin/members/' . $activeMember->id . '/expel')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('members', [
            'id' => $activeMember->id,
            'status' => 'expelled',
        ]);
    }
}
