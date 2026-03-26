<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Testing\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    private static int $counter = 0;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
    }

    private function createMemberUser(string $status = 'active'): User
    {
        self::$counter++;

        $user = User::factory()->create([
            'email' => 'member' . self::$counter . '@example.com',
            'password' => Hash::make('Password@123'),
            'user_type' => 'member',
        ]);

        Member::factory()->create([
            'user_id' => $user->id,
            'email' => $user->email,
            'mobile' => '0179' . str_pad((string) self::$counter, 7, '0', STR_PAD_LEFT),
            'status' => $status,
        ]);

        return $user;
    }

    private function loginAndGetToken(User $user): string
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'Password@123',
        ])->assertStatus(200);

        return $response->json('access_token');
    }

    public function test_unauthenticated_user_cannot_read_profile(): void
    {
        $this->getJson('/api/members/me')
            ->assertStatus(401);
    }

    public function test_active_member_can_read_own_profile(): void
    {
        $user = $this->createMemberUser('active');
        $token = $this->loginAndGetToken($user);

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/members/me')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_active_member_can_update_profile(): void
    {
        $user = $this->createMemberUser('active');
        $token = $this->loginAndGetToken($user);

        $payload = [
            'full_name' => 'Updated Profile Name',
            'phone' => '01710101010',
            'present_address' => 'Updated Present Address',
            'skills' => 'Laravel, Vue, QA',
        ];

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/members/me', $payload)
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.full_name', 'Updated Profile Name');

        $this->assertDatabaseHas('members', [
            'user_id' => $user->id,
            'full_name' => 'Updated Profile Name',
            'phone' => '01710101010',
            'present_address' => 'Updated Present Address',
        ]);
    }

    public function test_member_profile_update_rejects_duplicate_mobile(): void
    {
        $firstUser = $this->createMemberUser('active');
        $secondUser = $this->createMemberUser('active');

        $firstMember = $firstUser->member;
        $token = $this->loginAndGetToken($secondUser);

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson('/api/members/me', [
            'mobile' => $firstMember->mobile,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['mobile']);
    }

    public function test_active_member_can_upload_profile_photo(): void
    {
        Storage::fake('public');

        $user = $this->createMemberUser('active');
        $token = $this->loginAndGetToken($user);

        $photo = File::image('avatar.jpg');

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/members/me/photo', [
            'photo' => $photo,
        ])->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['photo_url', 'message']);

        $member = $user->fresh()->member;

        $this->assertNotNull($member->photo_path);
        Storage::disk('public')->assertExists($member->photo_path);
    }

    public function test_pending_member_is_forbidden_from_accessing_profile_api(): void
    {
        $user = $this->createMemberUser('pending');
        $token = JWTAuth::fromUser($user);

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/members/me')
            ->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('status', 'pending');
    }
}
