<?php

namespace Database\Factories;

use App\Enums\UnitType;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Role>
 */
class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition(): array
    {
        static $rank = 1;

        return [
            'title'       => fake()->jobTitle(),
            'unit_type'   => fake()->randomElement(UnitType::cases())->value,
            'rank_order'  => $rank++,
            'description' => fake()->optional()->sentence(),
            'is_active'   => true,
            'created_by'  => User::factory()->state(['user_type' => 'admin']),
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function forUnitType(UnitType $type): static
    {
        return $this->state(['unit_type' => $type->value]);
    }
}
