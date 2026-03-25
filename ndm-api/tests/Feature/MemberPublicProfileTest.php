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

class MemberPublicProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_profile_exposes_only_safe_fields(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin-profile@example.com',
            'password' => Hash::make('Password@123'),
            'user_type' => 'admin',
        ]);

        $unit = OrganizationalUnit::create([
            'name' => 'Dhaka Division',
            'type' => 'division',
            'code' => 'DHA-DIV',
            'is_active' => true,
        ]);

        $role = Role::create([
            'title' => 'General Secretary',
            'unit_type' => 'division',
            'rank_order' => 2,
            'created_by' => $admin->id,
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'email' => 'member-profile@example.com',
            'password' => Hash::make('Password@123'),
            'user_type' => 'member',
        ]);

        $member = Member::create([
            'user_id' => $user->id,
            'member_id' => '20261',
            'full_name' => 'Profile Member',
            'institution' => 'Dhaka University',
            'join_year' => now()->year,
            'status' => 'active',
            'nid_or_bc' => 'SECRET-NID-123',
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

        $response = $this->getJson('/api/members/20261');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.member_id', '20261')
            ->assertJsonPath('data.full_name', 'Profile Member')
            ->assertJsonPath('data.institution', 'Dhaka University')
            ->assertJsonPath('data.unit.name', 'Dhaka Division')
            ->assertJsonStructure([
                'data' => [
                    'member_id',
                    'full_name',
                    'institution',
                    'join_year',
                    'photo_url',
                    'unit' => ['id', 'name', 'type'],
                    'positions',
                ],
            ]);

        $payload = $response->json('data');

        $this->assertArrayNotHasKey('user_id', $payload);
        $this->assertArrayNotHasKey('approved_by', $payload);
        $this->assertArrayNotHasKey('nid_or_bc', $payload);
        $this->assertArrayNotHasKey('password', $payload);
    }
}
