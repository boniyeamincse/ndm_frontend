<?php

namespace Database\Factories;

use App\Models\MemberTask;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemberTask>
 */
class MemberTaskFactory extends Factory
{
    protected $model = MemberTask::class;

    private const STATUSES  = ['pending', 'in_progress', 'completed', 'cancelled'];
    private const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

    public function definition(): array
    {
        return [
            'title'          => fake()->sentence(4),
            'description'    => fake()->optional()->paragraph(),
            'status'         => 'pending',
            'priority'       => fake()->randomElement(self::PRIORITIES),
            'due_date'       => fake()->optional()->dateTimeBetween('now', '+60 days')?->format('Y-m-d'),
            'created_by'     => User::factory()->state(['user_type' => 'admin']),
            'parent_task_id' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed']);
    }

    public function overdue(): static
    {
        return $this->state([
            'status'   => 'in_progress',
            'due_date' => fake()->dateTimeBetween('-30 days', '-1 day')->format('Y-m-d'),
        ]);
    }

    public function withParent(MemberTask $parent): static
    {
        return $this->state(['parent_task_id' => $parent->id]);
    }
}
