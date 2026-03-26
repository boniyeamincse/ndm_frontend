<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainingEnrollmentRequest;
use App\Http\Resources\TrainingEnrollmentResource;
use App\Models\TrainingEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingEnrollmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrainingEnrollment::with(['course', 'member', 'certificate']);

        if ($courseId = $request->integer('training_course_id')) {
            $query->where('training_course_id', $courseId);
        }

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        $items = $query->latest()->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => TrainingEnrollmentResource::collection($items),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function store(StoreTrainingEnrollmentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['enrolled_at'] = now();

        $item = TrainingEnrollment::updateOrCreate(
            [
                'training_course_id' => $data['training_course_id'],
                'member_id' => $data['member_id'],
            ],
            $data,
        );

        return response()->json([
            'success' => true,
            'message' => 'Enrollment saved successfully.',
            'data' => new TrainingEnrollmentResource($item->fresh(['course', 'member', 'certificate'])),
        ], 201);
    }

    public function update(StoreTrainingEnrollmentRequest $request, int $id): JsonResponse
    {
        $item = TrainingEnrollment::findOrFail($id);
        $payload = $request->validated();

        if (($payload['status'] ?? null) === 'completed' && empty($item->completed_at)) {
            $payload['completed_at'] = now();
        }

        $item->update($payload);

        return response()->json([
            'success' => true,
            'message' => 'Enrollment updated successfully.',
            'data' => new TrainingEnrollmentResource($item->fresh(['course', 'member', 'certificate'])),
        ]);
    }
}