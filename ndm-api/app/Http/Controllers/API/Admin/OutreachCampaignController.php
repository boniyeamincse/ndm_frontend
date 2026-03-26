<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOutreachCampaignRequest;
use App\Http\Resources\OutreachCampaignResource;
use App\Models\OutreachCampaign;
use App\Services\OutreachCampaignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OutreachCampaignController extends Controller
{
    public function __construct(private readonly OutreachCampaignService $service) {}

    public function index(Request $request): JsonResponse
    {
        $query = OutreachCampaign::query();

        if ($status = $request->string('status')->value()) {
            $query->where('status', $status);
        }

        if ($channel = $request->string('channel')->value()) {
            $query->where('channel', $channel);
        }

        $items = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => OutreachCampaignResource::collection($items),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function store(StoreOutreachCampaignRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] = $data['requires_approval'] ?? true ? 'pending_approval' : 'approved';
        $data['created_by'] = auth()->id();

        $item = OutreachCampaign::create($data);
        $item->update(['recipient_estimate' => $this->service->estimateRecipients($item)]);

        return response()->json([
            'success' => true,
            'message' => 'Outreach campaign created successfully.',
            'data' => new OutreachCampaignResource($item->fresh()),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $item = OutreachCampaign::with(['segment', 'targets.member', 'deliveryLogs'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'campaign' => new OutreachCampaignResource($item),
                'targets' => $item->targets,
                'delivery_logs' => \App\Http\Resources\OutreachDeliveryLogResource::collection($item->deliveryLogs),
            ],
        ]);
    }

    public function update(StoreOutreachCampaignRequest $request, int $id): JsonResponse
    {
        $item = OutreachCampaign::findOrFail($id);
        $item->update($request->validated());
        $item->update(['recipient_estimate' => $this->service->estimateRecipients($item)]);

        return response()->json([
            'success' => true,
            'message' => 'Outreach campaign updated successfully.',
            'data' => new OutreachCampaignResource($item->fresh()),
        ]);
    }

    public function approve(int $id): JsonResponse
    {
        $item = OutreachCampaign::findOrFail($id);
        $item = $this->service->approve($item, auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Campaign approved successfully.',
            'data' => new OutreachCampaignResource($item),
        ]);
    }

    public function schedule(Request $request, int $id): JsonResponse
    {
        $item = OutreachCampaign::findOrFail($id);
        $item->update([
            'status' => 'scheduled',
            'scheduled_at' => $request->date('scheduled_at') ?? now()->addMinutes(30),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Campaign scheduled successfully.',
            'data' => new OutreachCampaignResource($item->fresh()),
        ]);
    }

    public function sendNow(int $id): JsonResponse
    {
        $item = OutreachCampaign::with('segment')->findOrFail($id);
        $result = $this->service->dispatchNow($item);

        $statusCode = ($result['success'] ?? false) ? 200 : 422;

        return response()->json($result, $statusCode);
    }
}