<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTrainingEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'training_course_id' => ['required', 'exists:training_courses,id'],
            'member_id' => ['required', 'exists:members,id'],
            'attendance_rate' => ['nullable', 'integer', 'between:0,100'],
            'assessment_score' => ['nullable', 'integer', 'between:0,100'],
            'progress_percent' => ['nullable', 'integer', 'between:0,100'],
            'status' => ['nullable', Rule::in(['enrolled', 'in_progress', 'completed', 'dropped'])],
        ];
    }
}