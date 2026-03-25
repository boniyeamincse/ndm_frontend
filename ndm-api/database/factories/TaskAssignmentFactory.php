<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\MemberTask;
use App\Models\TaskAssignment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaskAssignment>
 */
class TaskAssignmentFactory extends Factory
{
    protected $model = TaskAssignment::class;

    public function definition(): array
    {
        return [
            'task_id'       => MemberTask::factory(),
            'member_id'     => Member::factory(),
            'status'        => 'pending',
            'progress_note' => null,
            'completed_at'  => null,
        ];
    }

    public function completed(): static
    {
        return $this->state([
            'status'        => 'completed',
            'progress_note' => fake()->sentence(),
            'completed_at'  => now(),
        ]);
    }

    public function inProgress(): static
    {
        return $this->state([
            'status'        => 'in_progress',
            'progress_note' => fake()->sentence(),
        ]);
    }
}
