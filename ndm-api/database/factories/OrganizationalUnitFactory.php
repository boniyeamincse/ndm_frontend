<?php

namespace Database\Factories;

use App\Enums\UnitType;
use App\Models\OrganizationalUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrganizationalUnit>
 */
class OrganizationalUnitFactory extends Factory
{
    protected $model = OrganizationalUnit::class;

    public function definition(): array
    {
        $type = fake()->randomElement(UnitType::cases());
        $name = fake()->city() . ' ' . $type->label();

        return [
            'name'        => $name,
            'type'        => $type->value,
            'code'        => strtoupper(fake()->lexify('???-####')),
            'description' => fake()->optional()->sentence(),
            'is_active'   => true,
            'parent_id'   => null,
        ];
    }

    public function ofType(UnitType $type): static
    {
        return $this->state(['type' => $type->value]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function withParent(OrganizationalUnit $parent): static
    {
        return $this->state(['parent_id' => $parent->id]);
    }
}
