<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminMemberTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
    }

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

    public function test_admin_can_update_member_profile_fields(): void
    {
        $admin = $this->createAdmin();
        $member = $this->createMember('active', '2026887');
        $unit = OrganizationalUnit::factory()->create();

        $response = $this->actingAs($admin, 'api')->putJson('/api/admin/members/' . $member->id, [
            'full_name' => 'Updated Member Name',
            'institution' => 'Dhaka University',
            'department' => 'CSE',
            'organizational_unit_id' => $unit->id,
            'blood_group' => 'B+',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.full_name', 'Updated Member Name')
            ->assertJsonPath('data.organizational_unit_id', $unit->id);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'full_name' => 'Updated Member Name',
            'institution' => 'Dhaka University',
            'department' => 'CSE',
            'organizational_unit_id' => $unit->id,
            'blood_group' => 'B+',
        ]);
    }

    public function test_admin_can_view_member_documents(): void
    {
        $admin = $this->createAdmin();
        $member = $this->createMember('active', '2026888');

        $member->update([
            'photo_path' => 'photos/member-photo.jpg',
            'nid_doc_path' => 'documents/member-nid.pdf',
            'student_id_doc_path' => 'documents/member-student-id.pdf',
        ]);

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/admin/members/' . $member->id . '/documents');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => ['photo_url', 'nid_doc_url', 'student_id_url'],
            ]);

        $this->assertNotNull($response->json('data.photo_url'));
        $this->assertNotNull($response->json('data.nid_doc_url'));
        $this->assertNotNull($response->json('data.student_id_url'));
    }

    public function test_admin_can_hard_delete_pending_member_with_reason(): void
    {
        $admin = $this->createAdmin();
        $member = $this->createMember('pending', '2026889');
        $userId = $member->user_id;

        $response = $this->actingAs($admin, 'api')
            ->deleteJson('/api/admin/members/' . $member->id, [
                'reason' => 'Duplicate registration record',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('members', ['id' => $member->id]);
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_admin_cannot_hard_delete_active_member(): void
    {
        $admin = $this->createAdmin();
        $member = $this->createMember('active', '2026890');

        $response = $this->actingAs($admin, 'api')
            ->deleteJson('/api/admin/members/' . $member->id, [
                'reason' => 'Policy test',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('members', ['id' => $member->id]);
    }

    public function test_non_admin_cannot_perform_admin_member_operation(): void
    {
        $nonAdmin = User::factory()->create([
            'email' => 'regular-member@example.com',
            'user_type' => 'member',
            'is_active' => true,
        ]);

        $member = $this->createMember('pending', '2026891');

        $this->actingAs($nonAdmin, 'api')
            ->postJson('/api/admin/members/' . $member->id . '/approve')
            ->assertStatus(403);
    }
}
