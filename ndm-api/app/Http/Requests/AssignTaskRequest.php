<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'priority'    => ['required', 'in:low,medium,high,urgent'],
            'due_date'    => ['nullable', 'date', 'after:today'],
            'parent_task_id' => ['nullable', 'integer', 'exists:member_tasks,id'],
            'member_ids'  => ['required', 'array', 'min:1'],
            'member_ids.*' => ['integer', 'exists:members,id'],
        ];
    }
}
