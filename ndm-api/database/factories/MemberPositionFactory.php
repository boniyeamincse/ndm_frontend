<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\MemberPosition;
use App\Models\OrganizationalUnit;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemberPosition>
 */
class MemberPositionFactory extends Factory
{
    protected $model = MemberPosition::class;

    public function definition(): array
    {
        return [
            'member_id'   => Member::factory(),
            'role_id'     => Role::factory(),
            'unit_id'     => OrganizationalUnit::factory(),
            'assigned_by' => User::factory()->state(['user_type' => 'admin']),
            'assigned_at' => fake()->dateTimeBetween('-2 years', 'now'),
            'relieved_at' => null,
            'is_active'   => true,
            'notes'       => fake()->optional()->sentence(),
        ];
    }

    public function relieved(): static
    {
        return $this->state([
            'is_active'   => false,
            'relieved_at' => now(),
        ]);
    }
}
