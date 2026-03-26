<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTrainingCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $courseId = $this->route('id');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('training_courses', 'slug')->ignore($courseId)],
            'description' => ['nullable', 'string'],
            'curriculum_outline' => ['nullable', 'string', 'max:1000'],
            'organizational_unit_id' => ['nullable', 'exists:organizational_units,id'],
            'trainer_member_id' => ['nullable', 'exists:members,id'],
            'starts_on' => ['nullable', 'date'],
            'ends_on' => ['nullable', 'date', 'after_or_equal:starts_on'],
            'status' => ['nullable', Rule::in(['draft', 'published', 'ongoing', 'completed', 'archived'])],
        ];
    }
}