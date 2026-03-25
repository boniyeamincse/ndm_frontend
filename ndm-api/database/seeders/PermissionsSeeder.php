<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Seeds all RBAC permissions and binds them to the default admin role.
 *
 * Safe to run multiple times (uses firstOrCreate).
 *
 * Run:
 *   php artisan db:seed --class=PermissionsSeeder
 */
class PermissionsSeeder extends Seeder
{
    /**
     * Canonical permission definitions grouped by domain.
     */
    private array $permissions = [
        'Members' => [
            'members.view'    => 'View member list and profiles',
            'members.approve' => 'Approve pending member registrations',
            'members.reject'  => 'Reject and remove pending registrations',
            'members.suspend' => 'Suspend active members',
            'members.expel'   => 'Expel members permanently',
            'members.edit'    => 'Edit member profile data',
            'members.delete'  => 'Hard-delete member records',
            'members.promote' => 'Change member organisational role',
        ],
        'Tasks' => [
            'tasks.view'   => 'View all tasks',
            'tasks.manage' => 'Create, edit and delete tasks and assignments',
        ],
        'Roles' => [
            'roles.view'   => 'View roles and permission list',
            'roles.manage' => 'Create, edit and delete roles; sync permissions',
        ],
        'Units' => [
            'units.view'   => 'View organisational unit tree',
            'units.manage' => 'Create, edit and delete organisational units',
        ],
        'Reports' => [
            'reports.view'   => 'View dashboard stats and audit logs',
            'reports.export' => 'Export reports and audit logs to CSV/PDF',
        ],
    ];

    public function run(): void
    {
        $allIds = [];

        foreach ($this->permissions as $group => $items) {
            foreach ($items as $name => $description) {
                $perm     = Permission::firstOrCreate(
                    ['name' => $name],
                    ['group' => $group, 'description' => $description]
                );
                $allIds[] = $perm->id;
            }
        }

        // The built-in 'admin' role (user_type === 'admin') gets all permissions
        $adminRole = Role::firstOrCreate(
            ['title' => 'admin'],
            ['description' => 'System administrator — full access', 'is_active' => true, 'created_by' => 1]
        );
        $adminRole->permissions()->sync($allIds);

        // 'organizer' role gets read + member management but not role admin
        $organizerPermissions = Permission::whereIn('name', [
            'members.view', 'members.approve', 'members.reject',
            'members.suspend', 'members.edit', 'tasks.view', 'tasks.manage',
            'units.view', 'reports.view',
        ])->pluck('id')->toArray();

        $organizerRole = Role::firstOrCreate(
            ['title' => 'organizer'],
            ['description' => 'Unit organizer — member & task management', 'is_active' => true, 'created_by' => 1]
        );
        $organizerRole->permissions()->sync($organizerPermissions);

        // 'general_member' — view only
        $memberPermissions = Permission::whereIn('name', [
            'members.view', 'tasks.view', 'units.view',
        ])->pluck('id')->toArray();

        $generalRole = Role::firstOrCreate(
            ['title' => 'general_member'],
            ['description' => 'General member — read-only access', 'is_active' => true, 'created_by' => 1]
        );
        $generalRole->permissions()->sync($memberPermissions);

        $this->command->info('Permissions seeded: ' . count($allIds) . ' permissions across ' . count($this->permissions) . ' groups.');
    }
}
