<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommunicationConnectorRequest;
use App\Http\Resources\CommunicationConnectorResource;
use App\Models\CommunicationConnector;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationConnectorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CommunicationConnector::query();

        if ($channel = $request->string('channel')->value()) {
            $query->where('channel', $channel);
        }

        $items = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => CommunicationConnectorResource::collection($items),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function store(StoreCommunicationConnectorRequest $request): JsonResponse
    {
        $item = CommunicationConnector::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Connector created successfully.',
            'data' => new CommunicationConnectorResource($item),
        ], 201);
    }

    public function update(StoreCommunicationConnectorRequest $request, int $id): JsonResponse
    {
        $item = CommunicationConnector::findOrFail($id);
        $item->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Connector updated successfully.',
            'data' => new CommunicationConnectorResource($item->fresh()),
        ]);
    }

    public function healthCheck(int $id): JsonResponse
    {
        $item = CommunicationConnector::findOrFail($id);
        $status = $item->is_active ? 'healthy' : 'down';

        $item->update([
            'health_status' => $status,
            'last_health_checked_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Connector health checked.',
            'data' => new CommunicationConnectorResource($item->fresh()),
        ]);
    }
}