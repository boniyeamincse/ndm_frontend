<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainingCourseRequest;
use App\Http\Resources\TrainingCourseResource;
use App\Models\TrainingCourse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingCourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrainingCourse::query()->withCount('enrollments');

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($unitId = $request->integer('organizational_unit_id')) {
            $query->where('organizational_unit_id', $unitId);
        }

        $items = $query->latest()->paginate($request->integer('per_page', 15));

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

    public function store(StoreTrainingCourseRequest $request): JsonResponse
    {
        $course = TrainingCourse::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Training course created successfully.',
            'data' => new TrainingCourseResource($course->loadCount('enrollments')),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $course = TrainingCourse::with(['unit', 'trainer', 'enrollments.member'])->withCount('enrollments')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'course' => new TrainingCourseResource($course),
                'enrollments' => \App\Http\Resources\TrainingEnrollmentResource::collection($course->enrollments),
            ],
        ]);
    }

    public function update(StoreTrainingCourseRequest $request, int $id): JsonResponse
    {
        $course = TrainingCourse::findOrFail($id);
        $course->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Training course updated successfully.',
            'data' => new TrainingCourseResource($course->fresh()->loadCount('enrollments')),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $course = TrainingCourse::findOrFail($id);
        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Training course deleted successfully.',
        ]);
    }
}