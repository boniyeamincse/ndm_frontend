<?php

namespace App\Services;

use App\Models\LeadershipPipeline;
use App\Models\TrainingCourse;
use App\Models\TrainingEnrollment;
use Illuminate\Support\Facades\DB;

class TrainingAnalyticsService
{
    public function summary(): array
    {
        $courseCount = TrainingCourse::count();
        $publishedCourseCount = TrainingCourse::whereIn('status', ['published', 'ongoing', 'completed'])->count();
        $enrollmentCount = TrainingEnrollment::count();
        $completedEnrollmentCount = TrainingEnrollment::where('status', 'completed')->count();

        $completionRate = $enrollmentCount > 0 ? round(($completedEnrollmentCount / $enrollmentCount) * 100, 2) : 0;

        $avgAssessment = (float) TrainingEnrollment::where('status', 'completed')->avg('assessment_score');
        $avgAssessment = round($avgAssessment, 2);

        $unitWise = DB::table('training_enrollments')
            ->join('members', 'members.id', '=', 'training_enrollments.member_id')
            ->leftJoin('organizational_units', 'organizational_units.id', '=', 'members.organizational_unit_id')
            ->selectRaw("COALESCE(organizational_units.id, 0) as unit_id, COALESCE(organizational_units.name, 'Unassigned') as unit_name,
                COUNT(training_enrollments.id) as enrolled_count,
                SUM(CASE WHEN training_enrollments.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                ROUND(AVG(training_enrollments.assessment_score), 2) as avg_score")
            ->groupBy('organizational_units.id', 'organizational_units.name')
            ->orderByDesc('completed_count')
            ->get()
            ->map(fn ($row) => [
                'unit_id' => $row->unit_id === 0 ? null : (int) $row->unit_id,
                'unit_name' => $row->unit_name,
                'enrolled_count' => (int) $row->enrolled_count,
                'completed_count' => (int) $row->completed_count,
                'avg_score' => (float) $row->avg_score,
                'completion_rate' => (int) $row->enrolled_count > 0 ? round(($row->completed_count / $row->enrolled_count) * 100, 2) : 0,
            ])
            ->values();

        $trainerPerformance = DB::table('training_courses')
            ->leftJoin('members as trainer', 'trainer.id', '=', 'training_courses.trainer_member_id')
            ->leftJoin('training_enrollments', 'training_enrollments.training_course_id', '=', 'training_courses.id')
            ->selectRaw('training_courses.trainer_member_id,
                COALESCE(trainer.full_name, "Unassigned") as trainer_name,
                COUNT(DISTINCT training_courses.id) as courses_count,
                COUNT(training_enrollments.id) as enrollments_count,
                ROUND(AVG(training_enrollments.assessment_score), 2) as avg_assessment')
            ->groupBy('training_courses.trainer_member_id', 'trainer.full_name')
            ->orderByDesc('courses_count')
            ->limit(10)
            ->get();

        $pipeline = [
            'total_profiles' => LeadershipPipeline::count(),
            'promotion_eligible' => LeadershipPipeline::where('eligible_for_promotion', true)->count(),
            'advanced_and_strategic' => LeadershipPipeline::whereIn('competency_level', ['advanced', 'strategic'])->count(),
        ];

        return [
            'overview' => [
                'total_courses' => $courseCount,
                'published_courses' => $publishedCourseCount,
                'total_enrollments' => $enrollmentCount,
                'completed_enrollments' => $completedEnrollmentCount,
                'completion_rate' => $completionRate,
                'average_assessment_score' => $avgAssessment,
            ],
            'unit_wise' => $unitWise,
            'trainer_performance' => $trainerPerformance,
            'leadership_pipeline' => $pipeline,
        ];
    }
}