<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Enums\UnitType;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('user_type', 'admin')->first();
        if (!$admin) return;

        $roles = [
            // Central Roles
            ['title' => 'President', 'unit_type' => UnitType::CENTRAL, 'rank' => 1],
            ['title' => 'General Secretary', 'unit_type' => UnitType::CENTRAL, 'rank' => 2],
            ['title' => 'Vice President', 'unit_type' => UnitType::CENTRAL, 'rank' => 3],
            ['title' => 'Joint General Secretary', 'unit_type' => UnitType::CENTRAL, 'rank' => 4],
            ['title' => 'Organizing Secretary', 'unit_type' => UnitType::CENTRAL, 'rank' => 5],
            
            // Division/District Roles
            ['title' => 'President', 'unit_type' => UnitType::DIVISION, 'rank' => 1],
            ['title' => 'General Secretary', 'unit_type' => UnitType::DIVISION, 'rank' => 2],
            ['title' => 'President', 'unit_type' => UnitType::DISTRICT, 'rank' => 1],
            ['title' => 'General Secretary', 'unit_type' => UnitType::DISTRICT, 'rank' => 2],

            // Campus Roles
            ['title' => 'Campus President', 'unit_type' => UnitType::CAMPUS, 'rank' => 1],
            ['title' => 'Campus General Secretary', 'unit_type' => UnitType::CAMPUS, 'rank' => 2],
        ];

        foreach ($roles as $role) {
            Role::create([
                'title' => $role['title'],
                'unit_type' => $role['unit_type'],
                'rank_order' => $role['rank'],
                'created_by' => $admin->id,
            ]);
        }
    }
}
