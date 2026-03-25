<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\MemberRole;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestMembersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('user_type', 'admin')->first();
        if (!$admin) {
            return;
        }

        $unitId = OrganizationalUnit::query()->value('id');

        $members = [
            [
                'email' => 'test.member@ndm.org.bd',
                'member_id' => 'NDM-TM-001',
                'full_name' => 'Test General Member',
                'phone' => '01710000001',
                'role' => 'general_member',
            ],
            [
                'email' => 'test.organizer@ndm.org.bd',
                'member_id' => 'NDM-TM-002',
                'full_name' => 'Test Organizer Member',
                'phone' => '01710000002',
                'role' => 'organizer',
            ],
            [
                'email' => 'test.adminmember@ndm.org.bd',
                'member_id' => 'NDM-TM-003',
                'full_name' => 'Test Admin Member',
                'phone' => '01710000003',
                'role' => 'admin',
            ],
        ];

        foreach ($members as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'password' => Hash::make('password'),
                    'user_type' => 'member',
                    'is_active' => true,
                ]
            );

            $member = Member::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'member_id' => $data['member_id'],
                    'full_name' => $data['full_name'],
                    'phone' => $data['phone'],
                    'email' => $data['email'],
                    'status' => 'active',
                    'join_year' => (int) date('Y'),
                    'approved_by' => $admin->id,
                    'approved_at' => now(),
                    'organizational_unit_id' => $unitId,
                ]
            );

            MemberRole::updateOrCreate(
                ['member_id' => $member->id],
                [
                    'role' => $data['role'],
                    'assigned_by' => $admin->id,
                    'assigned_at' => now(),
                ]
            );
        }
    }
}
