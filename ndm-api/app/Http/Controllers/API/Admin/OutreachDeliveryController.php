<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OutreachDeliveryLogResource;
use App\Models\OutreachDeliveryLog;
use App\Models\OutreachRetryJob;
use App\Services\OutreachCampaignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OutreachDeliveryController extends Controller
{
    public function __construct(private readonly OutreachCampaignService $service) {}

    public function logs(Request $request): JsonResponse
    {
        $query = OutreachDeliveryLog::query();

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($channel = $request->string('channel')->value()) {
            $query->where('channel', $channel);
        }

        $items = $query->latest()->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => OutreachDeliveryLogResource::collection($items),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function retry(Request $request): JsonResponse
    {
        $logIds = $request->input('log_ids', []);
        $result = $this->service->retryFailedLogs($logIds);

        return response()->json($result);
    }

    public function retryQueue(Request $request): JsonResponse
    {
        $items = OutreachRetryJob::latest()->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }
}