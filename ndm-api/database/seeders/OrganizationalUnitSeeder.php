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

        // Add diverse campus units (Public, Private, National University, Polytechnic)
        $campuses = [
            // Public Universities
            'DU' => 'University of Dhaka',
            'BUET' => 'Bangladesh University of Engineering and Technology',
            'RU' => 'University of Rajshahi',
            'CU' => 'University of Chittagong',
            'JU' => 'Jahangirnagar University',
            'KU' => 'Khulna University',
            
            // Private Universities
            'NSU' => 'North South University',
            'IUB' => 'Independent University, Bangladesh',
            'BRAC' => 'BRAC University',
            
            // National University Colleges
            'DHAKA-COL' => 'Dhaka College',
            'EDEN-COL' => 'Eden Mohila College',
            'MC-COL' => 'M.C. College, Sylhet',
            'BM-COL' => 'B.M. College, Barisal',
            
            // Polytechnic/Diploma
            'DPI' => 'Dhaka Polytechnic Institute',
            'CPI' => 'Chittagong Polytechnic Institute',
            
            // Others (Medical/Engineering)
            'DMC' => 'Dhaka Medical College',
            'SSMC' => 'Sir Salimullah Medical College',
        ];

        foreach ($campuses as $code => $name) {
            OrganizationalUnit::create([
                'name' => $name,
                'type' => UnitType::CAMPUS,
                'parent_id' => $central->id, // Simplified for now
                'code' => $code,
            ]);
        }
    }
}
