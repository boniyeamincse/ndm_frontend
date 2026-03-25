<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\User;
use App\Services\IdCardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\TestCase;

class IdCardPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_member_can_download_own_id_card_pdf(): void
    {
        [$user, $member] = $this->createMemberUser('active-card@example.com', 'NDSM-2026-0101', 'active');
        $token = $this->loginAndGetToken($user, 'Password@123');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get('/api/id-card');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('attachment;', (string) $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('NDM_ID_' . $member->member_id . '.pdf', (string) $response->headers->get('Content-Disposition'));
    }

    public function test_active_member_can_preview_own_id_card_pdf_inline(): void
    {
        [$user] = $this->createMemberUser('preview-card@example.com', 'NDSM-2026-0102', 'active');
        $token = $this->loginAndGetToken($user, 'Password@123');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get('/api/id-card/preview');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('inline;', (string) $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('id_card_preview.pdf', (string) $response->headers->get('Content-Disposition'));
    }

    public function test_non_active_member_cannot_access_id_card_routes(): void
    {
        [$user] = $this->createMemberUser('suspended-card@example.com', 'NDSM-2026-0103', 'suspended');

        $this->postJson('/api/auth/login', [
            'email' => 'suspended-card@example.com',
            'password' => 'Password@123',
        ])->assertStatus(403);
    }

    public function test_non_admin_cannot_download_other_members_id_card_from_admin_route(): void
    {
        [$user] = $this->createMemberUser('member-card@example.com', 'NDSM-2026-0104', 'active');
        [, $targetMember] = $this->createMemberUser('target-card@example.com', 'NDSM-2026-0105', 'active');
        $token = $this->loginAndGetToken($user, 'Password@123');

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get('/api/admin/members/' . $targetMember->id . '/id-card')
            ->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_download_any_members_id_card_pdf(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin-card@example.com',
            'password' => Hash::make('Password@123'),
            'user_type' => 'admin',
        ]);

        [, $member] = $this->createMemberUser('admin-target-card@example.com', 'NDSM-2026-0106', 'active');
        $token = $this->loginAndGetToken($admin, 'Password@123');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get('/api/admin/members/' . $member->id . '/id-card');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('attachment;', (string) $response->headers->get('Content-Disposition'));
    }

    public function test_id_card_preview_returns_server_error_when_generation_fails(): void
    {
        [$user] = $this->createMemberUser('failed-card@example.com', 'NDSM-2026-0107', 'active');
        $token = $this->loginAndGetToken($user, 'Password@123');

        $this->app->instance(IdCardService::class, new class {
            public function generate($member)
            {
                throw new RuntimeException('PDF generation failed.');
            }
        });

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get('/api/id-card/preview')
            ->assertStatus(500);
    }

    private function createMemberUser(string $email, string $memberId, string $status): array
    {
        $user = User::factory()->create([
            'email' => $email,
            'password' => Hash::make('Password@123'),
            'user_type' => 'member',
        ]);

        $member = Member::create([
            'user_id' => $user->id,
            'member_id' => $memberId,
            'full_name' => 'Card Holder ' . $memberId,
            'join_year' => now()->year,
            'status' => $status,
        ]);

        return [$user, $member];
    }

    private function loginAndGetToken(User $user, string $password): string
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertStatus(200);

        return (string) $response->json('access_token');
    }
}