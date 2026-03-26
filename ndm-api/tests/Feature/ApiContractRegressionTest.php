<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiContractRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'email' => 'contract-admin@example.com',
            'user_type' => 'admin',
            'is_active' => true,
        ]);
    }

    private function createActiveMember(int $index): Member
    {
        $user = User::factory()->create([
            'email' => 'contract-member-' . $index . '@example.com',
            'user_type' => 'member',
            'is_active' => true,
        ]);

        return Member::factory()->create([
            'user_id' => $user->id,
            'member_id' => 'NDM-CTR-2026-' . str_pad((string) $index, 4, '0', STR_PAD_LEFT),
            'full_name' => 'Contract Member ' . $index,
            'email' => $user->email,
            'status' => 'active',
            'join_year' => (int) now()->year,
        ]);
    }

    public function test_public_member_search_contract_has_expected_success_and_pagination_shape(): void
    {
        $this->createActiveMember(1);
        $this->createActiveMember(2);
        $this->createActiveMember(3);

        $response = $this->getJson('/api/members/search?per_page=2');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data',
                'meta' => ['current_page', 'per_page', 'total', 'last_page'],
            ]);

        $this->assertIsArray($response->json('data'));
        $this->assertIsInt($response->json('meta.current_page'));
        $this->assertIsInt($response->json('meta.per_page'));
        $this->assertIsInt($response->json('meta.total'));
        $this->assertIsInt($response->json('meta.last_page'));
    }

    public function test_login_validation_error_contract_has_message_and_errors_map(): void
    {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors' => ['email', 'password'],
            ]);

        $this->assertIsString($response->json('message'));
        $this->assertIsArray($response->json('errors.email'));
        $this->assertIsArray($response->json('errors.password'));
    }

    public function test_member_public_profile_not_found_contract_has_expected_error_shape(): void
    {
        $response = $this->getJson('/api/members/NDM-NOT-FOUND-0000');

        $response->assertStatus(404)
            ->assertJsonPath('success', false)
            ->assertJsonStructure([
                'success',
                'error',
            ]);

        $this->assertIsString($response->json('error'));
    }

    public function test_admin_members_index_contract_has_expected_pagination_and_item_shape(): void
    {
        $admin = $this->createAdmin();
        $this->createActiveMember(10);
        $this->createActiveMember(11);
        $this->createActiveMember(12);

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/admin/members?per_page=5');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'current_page',
                    'data',
                    'per_page',
                    'total',
                    'last_page',
                ],
            ]);

        $items = $response->json('data.data');

        $this->assertIsArray($items);
        $this->assertNotEmpty($items);
        $this->assertArrayHasKey('id', $items[0]);
        $this->assertArrayHasKey('full_name', $items[0]);
        $this->assertArrayHasKey('status', $items[0]);
    }
}
