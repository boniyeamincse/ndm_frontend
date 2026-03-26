<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrainingCourseResource;
use App\Http\Resources\TrainingEnrollmentResource;
use App\Models\TrainingCourse;
use App\Models\TrainingEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingMemberController extends Controller
{
    public function courses(Request $request): JsonResponse
    {
        $items = TrainingCourse::whereIn('status', ['published', 'ongoing'])
            ->withCount('enrollments')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => TrainingCourseResource::collection($items),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function enroll(Request $request, int $courseId): JsonResponse
    {
        $member = $request->user()?->member;

        if (! $member) {
            return response()->json(['success' => false, 'message' => 'Member profile not found.'], 404);
        }

        $course = TrainingCourse::whereIn('status', ['published', 'ongoing'])->findOrFail($courseId);

        $item = TrainingEnrollment::firstOrCreate(
            ['training_course_id' => $course->id, 'member_id' => $member->id],
            ['status' => 'enrolled', 'enrolled_at' => now()],
        );

        return response()->json([
            'success' => true,
            'message' => 'Enrollment submitted successfully.',
            'data' => new TrainingEnrollmentResource($item->load(['course', 'member', 'certificate'])),
        ], 201);
    }

    public function myEnrollments(Request $request): JsonResponse
    {
        $member = $request->user()?->member;

        if (! $member) {
            return response()->json(['success' => false, 'message' => 'Member profile not found.'], 404);
        }

        $items = TrainingEnrollment::where('member_id', $member->id)
            ->with(['course', 'certificate'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => TrainingEnrollmentResource::collection($items),
        ]);
    }
}