<?php

namespace Database\Seeders;

use App\Models\OrganizationalUnit;
use App\Enums\UnitType;
use Illuminate\Database\Seeder;

class OrganizationalUnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $central = OrganizationalUnit::create([
            'name' => 'Central Committee',
            'type' => UnitType::CENTRAL,
            'code' => 'CENTRAL',
        ]);

        $divisions = [
            'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'
        ];

        foreach ($divisions as $name) {
            OrganizationalUnit::create([
                'name' => $name . ' Division',
                'type' => UnitType::DIVISION,
                'parent_id' => $central->id,
                'code' => strtoupper(substr($name, 0, 3)) . '-DIV',
            ]);
        }
    }
}
