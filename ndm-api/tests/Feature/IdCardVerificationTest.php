<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MemberPosition;
use App\Models\OrganizationalUnit;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class IdCardVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_id_card_verification_returns_safe_member_payload(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin-idcard@example.com',
            'password' => Hash::make('Password@123'),
            'user_type' => 'admin',
        ]);

        $unit = OrganizationalUnit::create([
            'name' => 'Dhaka District Committee',
            'type' => 'district',
            'code' => 'DHK-DIS',
            'is_active' => true,
        ]);

        $role = Role::create([
            'title' => 'Organizing Secretary',
            'unit_type' => 'district',
            'rank_order' => 3,
            'created_by' => $admin->id,
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'email' => 'verified-member@example.com',
            'password' => Hash::make('Password@123'),
            'user_type' => 'member',
        ]);

        $member = Member::create([
            'user_id' => $user->id,
            'member_id' => 'NDSM-2026-0001',
            'full_name' => 'Verified Member',
            'institution' => 'Dhaka University',
            'join_year' => 2026,
            'status' => 'active',
            'nid_or_bc' => 'VERY-SECRET',
            'organizational_unit_id' => $unit->id,
        ]);

        MemberPosition::create([
            'member_id' => $member->id,
            'role_id' => $role->id,
            'unit_id' => $unit->id,
            'assigned_by' => $admin->id,
            'assigned_at' => now(),
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/id-cards/verify/NDSM-2026-0001');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('verified', true)
            ->assertJsonPath('data.member_id', 'NDSM-2026-0001')
            ->assertJsonPath('data.full_name', 'Verified Member')
            ->assertJsonPath('data.organization', 'Nationalist Democratic Student Movement (NDSM)')
            ->assertJsonPath('data.unit.name', 'Dhaka District Committee')
            ->assertJsonPath('data.active_position.role', 'Organizing Secretary');

        $payload = $response->json('data');

        $this->assertArrayNotHasKey('nid_or_bc', $payload);
        $this->assertArrayNotHasKey('email', $payload);
        $this->assertArrayNotHasKey('mobile', $payload);
    }

    public function test_public_id_card_verification_rejects_non_active_member_cards(): void
    {
        $user = User::factory()->create([
            'email' => 'suspended-member@example.com',
            'password' => Hash::make('Password@123'),
            'user_type' => 'member',
        ]);

        Member::create([
            'user_id' => $user->id,
            'member_id' => 'NDSM-2026-0002',
            'full_name' => 'Suspended Member',
            'join_year' => 2026,
            'status' => 'suspended',
        ]);

        $this->getJson('/api/id-cards/verify/NDSM-2026-0002')
            ->assertStatus(404)
            ->assertJsonPath('success', false)
            ->assertJsonPath('verified', false);
    }
}