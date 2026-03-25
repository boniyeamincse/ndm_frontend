<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\MemberRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemberRole>
 */
class MemberRoleFactory extends Factory
{
    protected $model = MemberRole::class;

    public function definition(): array
    {
        return [
            'member_id'   => Member::factory(),
            'role'        => 'general_member',
            'assigned_by' => User::factory()->state(['user_type' => 'admin']),
            'assigned_at' => now(),
        ];
    }

    public function organizer(): static
    {
        return $this->state(['role' => 'organizer']);
    }

    public function admin(): static
    {
        return $this->state(['role' => 'admin']);
    }
}
