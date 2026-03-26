<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Testing\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
    }

    private function createMemberUser(string $email, string $status, string $memberId): User
    {
        $user = User::factory()->create([
            'email' => $email,
            'password' => Hash::make('Password@123'),
            'user_type' => 'member',
        ]);

        Member::create([
            'user_id' => $user->id,
            'member_id' => $memberId,
            'full_name' => ucfirst($status) . ' Member',
            'join_year' => now()->year,
            'status' => $status,
        ]);

        return $user;
    }

    private function registrationPayload(array $overrides = []): array
    {
        return array_merge([
            'email' => 'register+' . uniqid() . '@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
            'full_name' => 'Registration Candidate',
            'mobile' => '01712345678',
            'phone' => '01712345678',
        ], $overrides);
    }

    public function test_can_register_a_new_member(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
            'full_name' => 'Test Member',
            'mobile' => '01712345678',
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

    public function test_registration_validates_required_fields(): void
    {
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password', 'full_name', 'mobile']);
    }

    public function test_registration_rejects_invalid_mobile_format(): void
    {
        $response = $this->postJson('/api/auth/register', $this->registrationPayload([
            'mobile' => '12345',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mobile']);
    }

    public function test_registration_rejects_duplicate_mobile(): void
    {
        Member::factory()->create([
            'mobile' => '01788889999',
        ]);

        $response = $this->postJson('/api/auth/register', $this->registrationPayload([
            'mobile' => '01788889999',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mobile']);
    }

    public function test_registration_rejects_invalid_nid_format(): void
    {
        $response = $this->postJson('/api/auth/register', $this->registrationPayload([
            'nid_or_bc' => '1234',
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nid_or_bc']);
    }

    public function test_registration_rejects_invalid_organizational_unit_id(): void
    {
        $response = $this->postJson('/api/auth/register', $this->registrationPayload([
            'organizational_unit_id' => 999999,
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['organizational_unit_id']);
    }

    public function test_registration_rejects_invalid_photo_file_type(): void
    {
        $invalidPhoto = File::create('avatar.pdf', 120, 'application/pdf');

        $response = $this->postJson('/api/auth/register', $this->registrationPayload([
            'photo' => $invalidPhoto,
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photo']);
    }

    public function test_registration_rejects_oversized_nid_document(): void
    {
        $largeDoc = File::create('nid.pdf', 6000, 'application/pdf');

        $response = $this->postJson('/api/auth/register', $this->registrationPayload([
            'nid_doc' => $largeDoc,
        ]));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nid_doc']);
    }

    public function test_registration_assigns_organizational_unit_when_provided(): void
    {
        $unit = OrganizationalUnit::factory()->create();

        $response = $this->postJson('/api/auth/register', $this->registrationPayload([
            'email' => 'unit-assigned@example.com',
            'full_name' => 'Unit Assigned Member',
            'mobile' => '01755556666',
            'organizational_unit_id' => $unit->id,
        ]));

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $member = Member::where('email', 'unit-assigned@example.com')->first();

        $this->assertNotNull($member);
        $this->assertSame($unit->id, $member->organizational_unit_id);
    }

    public function test_blocks_pending_member_from_login(): void
    {
        $this->createMemberUser('pending@example.com', 'pending', '2026001');

        $this->postJson('/api/auth/login', [
            'email' => 'pending@example.com',
            'password' => 'Password@123',
        ])->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error', 'Account not active: Pending Approval');
    }

    public function test_blocks_suspended_member_from_login(): void
    {
        $this->createMemberUser('suspended@example.com', 'suspended', '2026004');

        $this->postJson('/api/auth/login', [
            'email' => 'suspended@example.com',
            'password' => 'Password@123',
        ])->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error', 'Account not active: Suspended');
    }

    public function test_rejects_login_with_invalid_password(): void
    {
        $this->createMemberUser('invalid-pass@example.com', 'active', '2026005');

        $this->postJson('/api/auth/login', [
            'email' => 'invalid-pass@example.com',
            'password' => 'WrongPassword@123',
        ])->assertStatus(401)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error', 'Invalid credentials.');
    }

    public function test_allows_active_member_to_login_and_receive_jwt(): void
    {
        $this->createMemberUser('active@example.com', 'active', '2026002');

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

    public function test_allows_admin_to_login_and_returns_admin_user_type(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('Password@123'),
            'user_type' => 'admin',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'Password@123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.user_type', 'admin')
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'expires_in',
            ]);
    }

    public function test_can_register_with_full_details_and_files(): void
    {
        Storage::fake('public');

        $photo = File::image('profile.jpg');
        $nidDoc = File::create('nid.pdf', 500);
        $studentIdDoc = File::create('student-id.pdf', 400);

        $response = $this->postJson('/api/auth/register', [
            'email' => 'full@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
            'full_name' => 'Full Detail Member',
            'father_name' => 'Father Name',
            'mother_name' => 'Mother Name',
            'nid_or_bc' => '1234567890',
            'mobile' => '01711112222',
            'phone' => '01711111111',
            'blood_group' => 'A+',
            'emergency_contact_name' => 'Emergency Name',
            'emergency_contact_phone' => '01700000000',
            'skills' => 'Laravel, React',
            'photo' => $photo,
            'nid_doc' => $nidDoc,
            'student_id_doc' => $studentIdDoc,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('members', [
            'full_name' => 'Full Detail Member',
            'emergency_contact_name' => 'Emergency Name',
        ]);

        $member = Member::where('full_name', 'Full Detail Member')->first();
        
        // Test Encryption: The raw database value should NOT be '1234567890'
        $rawNid = DB::table('members')
            ->where('id', $member->id)
            ->value('nid_or_bc');
            
        $this->assertNotEquals('1234567890', $rawNid);
        
        // Test Decryption via Model: Accessor should return original value
        $this->assertEquals('1234567890', $member->nid_or_bc);

        // Test File Storage
        Storage::disk('public')->assertExists($member->photo_path);
        Storage::disk('public')->assertExists($member->nid_doc_path);
        Storage::disk('public')->assertExists($member->student_id_doc_path);
    }

    public function test_logout_invalidates_current_token(): void
    {
        $this->createMemberUser('logout@example.com', 'active', '2026003');

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

    public function test_logout_fails_when_not_authenticated(): void
    {
        $this->postJson('/api/auth/logout')
            ->assertStatus(401);
    }

    public function test_refresh_returns_new_token_for_authenticated_user(): void
    {
        $this->createMemberUser('refresh@example.com', 'active', '2026006');

        $login = $this->postJson('/api/auth/login', [
            'email' => 'refresh@example.com',
            'password' => 'Password@123',
        ])->assertStatus(200);

        $token = $login->json('access_token');

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/refresh')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'access_token',
                'token_type',
            ]);
    }

    public function test_refresh_fails_when_not_authenticated(): void
    {
        $this->postJson('/api/auth/refresh')
            ->assertStatus(401);
    }
}
