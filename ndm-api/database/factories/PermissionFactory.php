<?php

namespace Database\Factories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Permission>
 */
class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    /** Pre-defined permission groups matching the RBAC matrix. */
    private const GROUPS = ['members', 'roles', 'units', 'positions', 'tasks', 'audit', 'reports', 'id_cards'];

    public function definition(): array
    {
        $group  = fake()->randomElement(self::GROUPS);
        $action = fake()->randomElement(['view', 'create', 'update', 'delete', 'approve', 'export']);

        return [
            'name'        => "{$group}.{$action}",
            'group'       => $group,
            'description' => ucfirst("{$action} {$group}"),
        ];
    }

    public function forGroup(string $group): static
    {
        return $this->state(['group' => $group]);
    }
}
