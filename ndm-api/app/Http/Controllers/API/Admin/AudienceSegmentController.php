<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAudienceSegmentRequest;
use App\Http\Resources\AudienceSegmentResource;
use App\Models\AudienceSegment;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AudienceSegmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = AudienceSegment::withCount('campaigns')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => AudienceSegmentResource::collection($items),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function store(StoreAudienceSegmentRequest $request): JsonResponse
    {
        $item = AudienceSegment::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Audience segment created successfully.',
            'data' => new AudienceSegmentResource($item),
        ], 201);
    }

    public function update(StoreAudienceSegmentRequest $request, int $id): JsonResponse
    {
        $item = AudienceSegment::findOrFail($id);
        $item->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Audience segment updated successfully.',
            'data' => new AudienceSegmentResource($item->fresh()),
        ]);
    }

    public function previewCount(int $id): JsonResponse
    {
        $segment = AudienceSegment::findOrFail($id);
        $filters = $segment->filters ?? [];
        $type = $segment->segment_type;

        $query = Member::query()->where('status', 'active');

        if ($type === 'role_based' && ! empty($filters['roles'])) {
            $query->whereHas('memberRole', fn ($q) => $q->whereIn('role', $filters['roles']));
        }

        if ($type === 'unit_based' && ! empty($filters['unit_ids'])) {
            $query->whereIn('organizational_unit_id', $filters['unit_ids']);
        }

        if ($type === 'status_based' && ! empty($filters['statuses'])) {
            $query->whereIn('status', $filters['statuses']);
        }

        if ($type === 'custom' && ! empty($filters['member_ids'])) {
            $query->whereIn('id', $filters['member_ids']);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'segment_id' => $segment->id,
                'segment_name' => $segment->name,
                'recipient_count' => $query->count(),
            ],
        ]);
    }
}