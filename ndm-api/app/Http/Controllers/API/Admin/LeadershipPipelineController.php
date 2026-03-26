<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadershipPipelineRequest;
use App\Http\Resources\LeadershipPipelineResource;
use App\Models\LeadershipPipeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadershipPipelineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LeadershipPipeline::query()->with('member');

        if ($level = $request->string('competency_level')->value()) {
            $query->where('competency_level', $level);
        }

        if (! is_null($request->query('eligible_for_promotion'))) {
            $query->where('eligible_for_promotion', $request->boolean('eligible_for_promotion'));
        }

        $items = $query->latest()->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => LeadershipPipelineResource::collection($items),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function store(StoreLeadershipPipelineRequest $request): JsonResponse
    {
        $item = LeadershipPipeline::updateOrCreate(
            ['member_id' => $request->integer('member_id')],
            $request->validated(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Leadership pipeline profile saved successfully.',
            'data' => new LeadershipPipelineResource($item->fresh('member')),
        ], 201);
    }

    public function update(StoreLeadershipPipelineRequest $request, int $id): JsonResponse
    {
        $item = LeadershipPipeline::findOrFail($id);
        $item->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Leadership pipeline profile updated successfully.',
            'data' => new LeadershipPipelineResource($item->fresh('member')),
        ]);
    }
}