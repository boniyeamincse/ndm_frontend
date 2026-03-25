<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use DatabaseMigrations;

    public function test_can_register_a_new_member(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
            'full_name' => 'Test Member',
            'phone' => '01712345678',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'user_type' => 'member',
        ]);

        $this->assertDatabaseHas('members', [
            'full_name' => 'Test Member',
            'status' => 'pending',
        ]);
    }

    public function test_cannot_register_with_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'dupe@example.com',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'email' => 'dupe@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
            'full_name' => 'Duplicate Member',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_blocks_pending_member_from_login(): void
    {
        $user = User::factory()->create([
            'email' => 'pending@example.com',
            'password' => Hash::make('Password@123'),
        ]);

        Member::create([
            'user_id' => $user->id,
            'member_id' => '2026001',
            'full_name' => 'Pending Member',
            'join_year' => now()->year,
            'status' => 'pending',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'pending@example.com',
            'password' => 'Password@123',
        ])->assertStatus(403);
    }

    public function test_allows_active_member_to_login_and_receive_jwt(): void
    {
        $user = User::factory()->create([
            'email' => 'active@example.com',
            'password' => Hash::make('Password@123'),
        ]);

        Member::create([
            'user_id' => $user->id,
            'member_id' => '2026002',
            'full_name' => 'Active Member',
            'join_year' => now()->year,
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'active@example.com',
            'password' => 'Password@123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'expires_in',
            ]);
    }

    public function test_logout_invalidates_current_token(): void
    {
        $user = User::factory()->create([
            'email' => 'logout@example.com',
            'password' => Hash::make('Password@123'),
        ]);

        Member::create([
            'user_id' => $user->id,
            'member_id' => '2026003',
            'full_name' => 'Logout Member',
            'join_year' => now()->year,
            'status' => 'active',
        ]);

        $login = $this->postJson('/api/auth/login', [
            'email' => 'logout@example.com',
            'password' => 'Password@123',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/logout')->assertStatus(200);

        auth()->guard('api')->forgetUser();

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/auth/me')->assertStatus(401);
    }
}
