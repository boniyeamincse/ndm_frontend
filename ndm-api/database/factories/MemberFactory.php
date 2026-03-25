<?php

namespace Database\Factories;

use App\Enums\Gender;
use App\Enums\MemberStatus;
use App\Models\Member;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Member>
 */
class MemberFactory extends Factory
{
    protected $model = Member::class;

    public function definition(): array
    {
        static $sequence = 1;
        $year = now()->year;

        return [
            'user_id'               => User::factory(),
            'member_id'             => sprintf('NDM-SW-%d-%04d', $year, $sequence++),
            'full_name'             => fake()->name(),
            'father_name'           => fake()->name('male'),
            'mother_name'           => fake()->name('female'),
            'date_of_birth'         => fake()->dateTimeBetween('-30 years', '-18 years')->format('Y-m-d'),
            'gender'                => fake()->randomElement(Gender::cases())->value,
            'blood_group'           => fake()->randomElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
            'mobile'                => '01' . fake()->numerify('#########'),
            'phone'                 => fake()->optional()->numerify('0##########'),
            'email'                 => fake()->optional()->safeEmail(),
            'present_address'       => fake()->address(),
            'permanent_address'     => fake()->address(),
            'division'              => fake()->randomElement(['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet']),
            'district'              => fake()->city(),
            'upazila'               => fake()->city(),
            'union'                 => null,
            'ward'                  => null,
            'emergency_contact_name'  => fake()->name(),
            'emergency_contact_phone' => '01' . fake()->numerify('#########'),
            'institution'           => fake()->company() . ' University',
            'department'            => fake()->randomElement(['CSE', 'EEE', 'BBA', 'English', 'Economics', 'Law']),
            'session'               => fake()->randomElement(['2020-21', '2021-22', '2022-23', '2023-24']),
            'skills'                => fake()->optional()->sentence(),
            'join_year'             => fake()->numberBetween(2018, now()->year),
            'status'                => MemberStatus::ACTIVE->value,
            'organizational_unit_id' => OrganizationalUnit::factory(),
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => MemberStatus::PENDING->value]);
    }

    public function suspended(): static
    {
        return $this->state(['status' => MemberStatus::SUSPENDED->value]);
    }

    public function expelled(): static
    {
        return $this->state(['status' => MemberStatus::EXPELLED->value]);
    }
}
