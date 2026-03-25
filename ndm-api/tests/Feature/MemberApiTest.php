<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MemberApiTest extends TestCase
{
    use RefreshDatabase;

    private function createActiveMember(string $email = 'member@example.com', string $memberId = '2026991'): array
    {
        $user = User::factory()->create([
            'email' => $email,
            'user_type' => 'member',
            'is_active' => true,
        ]);

        $member = Member::create([
            'user_id' => $user->id,
            'member_id' => $memberId,
            'full_name' => 'Active Test Member',
            'join_year' => (int) now()->year,
            'status' => 'active',
            'institution' => 'NDM Test University',
            'present_address' => 'Dhaka',
            'permanent_address' => 'Dhaka',
        ]);

        return [$user, $member];
    }

    public function test_can_get_private_profile_via_members_me_endpoint(): void
    {
        [$user] = $this->createActiveMember('me-test@example.com', '2026992');

        $response = $this->actingAs($user, 'api')->getJson('/api/members/me');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.member_id', '2026992');
    }

    public function test_member_search_returns_only_active_members_and_supports_query(): void
    {
        $unit = OrganizationalUnit::create([
            'name' => 'Test Campus',
            'type' => 'campus',
            'code' => 'TEST-CAMPUS',
            'is_active' => true,
        ]);

        [, $activeMember] = $this->createActiveMember('search-active@example.com', '2026993');
        $activeMember->update([
            'full_name' => 'Ahmed Active',
            'organizational_unit_id' => $unit->id,
        ]);

        [, $pendingMember] = $this->createActiveMember('search-pending@example.com', '2026994');
        $pendingMember->update([
            'full_name' => 'Ahmed Pending',
            'status' => 'pending',
            'organizational_unit_id' => $unit->id,
        ]);

        $response = $this->getJson('/api/members/search?q=Ahmed&unit_id=' . $unit->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.member_id', '2026993');
    }

    public function test_member_can_upload_photo_through_members_me_photo_endpoint(): void
    {
        Storage::fake('public');

        [$user] = $this->createActiveMember('photo-test@example.com', '2026995');

        $file = UploadedFile::fake()->image('avatar.jpg', 400, 400);

        $response = $this->actingAs($user, 'api')
            ->post('/api/members/me/photo', ['photo' => $file], ['Accept' => 'application/json']);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['photo_url']);

        $path = Member::where('user_id', $user->id)->value('photo_path');
        $this->assertNotNull($path);
        Storage::disk('public')->assertExists($path);
    }
}
