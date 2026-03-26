<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MiddlewareTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        return User::factory()->create([
            'email' => 'middleware-admin@example.com',
            'password' => Hash::make('Password@123'),
            'user_type' => 'admin',
            'is_active' => true,
        ]);
    }

    private function createMemberUser(string $status = 'active', string $email = 'middleware-member@example.com'): User
    {
        $user = User::factory()->create([
            'email' => $email,
            'password' => Hash::make('Password@123'),
            'user_type' => 'member',
            'is_active' => true,
        ]);

        Member::factory()->create([
            'user_id' => $user->id,
            'email' => $email,
            'status' => $status,
        ]);

        return $user;
    }

    public function test_admin_middleware_blocks_non_admin_users(): void
    {
        $memberUser = $this->createMemberUser('active', 'non-admin@example.com');

        $this->actingAs($memberUser, 'api')
            ->getJson('/api/admin/members')
            ->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error', 'Unauthorized. Admin access required.');
    }

    public function test_active_member_middleware_blocks_pending_member(): void
    {
        $pendingUser = $this->createMemberUser('pending', 'pending-middleware@example.com');

        $this->actingAs($pendingUser, 'api')
            ->getJson('/api/members/me')
            ->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('status', 'pending');
    }

    public function test_active_member_middleware_allows_admin_bypass(): void
    {
        $admin = $this->createAdminUser();

        $this->actingAs($admin, 'api')
            ->getJson('/api/members/me')
            ->assertStatus(404)
            ->assertJsonPath('message', 'Member profile not found.');
    }

    public function test_audit_middleware_logs_successful_authenticated_mutation(): void
    {
        $memberUser = $this->createMemberUser('active', 'audit-success@example.com');

        $this->actingAs($memberUser, 'api')
            ->putJson('/api/members/me', [
                'full_name' => 'Audit Success Name',
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $memberUser->id,
            'action' => 'put:api/members/me',
        ]);
    }

    public function test_audit_middleware_does_not_log_failed_mutation(): void
    {
        $pendingUser = $this->createMemberUser('pending', 'audit-fail@example.com');

        $this->actingAs($pendingUser, 'api')
            ->putJson('/api/members/me', [
                'full_name' => 'Should Not Persist',
            ])
            ->assertStatus(403);

        $this->assertDatabaseMissing('audit_logs', [
            'user_id' => $pendingUser->id,
            'action' => 'put:api/members/me',
        ]);
    }

    public function test_security_headers_middleware_adds_expected_headers(): void
    {
        $response = $this->getJson('/api/members/search');

        $response->assertStatus(200)
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-XSS-Protection', '1; mode=block')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
            ->assertHeader('Content-Security-Policy', "default-src 'none'");
    }

    public function test_audit_middleware_records_request_metadata_fields(): void
    {
        $memberUser = $this->createMemberUser('active', 'audit-meta@example.com');

        $this->actingAs($memberUser, 'api')
            ->withServerVariables(['HTTP_USER_AGENT' => 'MiddlewareTestAgent/1.0'])
            ->putJson('/api/members/me', [
                'full_name' => 'Metadata Audit Name',
            ])
            ->assertStatus(200);

        $auditLog = AuditLog::where('user_id', $memberUser->id)
            ->where('action', 'put:api/members/me')
            ->latest('performed_at')
            ->first();

        $this->assertNotNull($auditLog);
        $this->assertNotNull($auditLog->ip_address);
        $this->assertStringContainsString('MiddlewareTestAgent/1.0', (string) $auditLog->user_agent);
        $this->assertNotNull($auditLog->performed_at);
    }
}
