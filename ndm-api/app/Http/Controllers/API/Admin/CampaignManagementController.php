<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Models\CampaignCheckpoint;
use App\Models\MemberTask;
use App\Models\TaskAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CampaignManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $campaigns = Campaign::with(['unit', 'checkpoints', 'tasks'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->input('status')))
            ->when($request->filled('campaign_type'), fn ($query) => $query->where('campaign_type', $request->input('campaign_type')))
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => CampaignResource::collection($campaigns)]);
    }

    public function store(StoreCampaignRequest $request): JsonResponse
    {
        $campaign = DB::transaction(function () use ($request) {
            $validated = $request->validated();
            $checkpoints = $validated['checkpoints'] ?? [];
            unset($validated['checkpoints']);

            $campaign = Campaign::create(array_merge($validated, ['created_by' => auth()->id()]));

            foreach ($checkpoints as $checkpoint) {
                CampaignCheckpoint::create(array_merge($checkpoint, ['campaign_id' => $campaign->id]));
            }

            return $campaign->load(['unit', 'checkpoints', 'tasks']);
        });

        return response()->json(['success' => true, 'message' => 'Campaign created successfully.', 'data' => new CampaignResource($campaign)], 201);
    }

    public function show(int $id): JsonResponse
    {
        $campaign = Campaign::with(['unit', 'checkpoints', 'tasks.assignments.member'])->findOrFail($id);

        $taskSummary = [
            'total' => $campaign->tasks->count(),
            'completed' => $campaign->tasks->where('status', 'completed')->count(),
            'overdue' => $campaign->tasks->filter(fn ($task) => $task->due_date && $task->due_date->isPast() && ! in_array($task->status, ['completed', 'cancelled']))->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'campaign' => new CampaignResource($campaign),
                'checkpoints' => $campaign->checkpoints->map(fn ($checkpoint) => [
                    'id' => $checkpoint->id,
                    'title' => $checkpoint->title,
                    'notes' => $checkpoint->notes,
                    'status' => $checkpoint->status,
                    'due_date' => $checkpoint->due_date?->toDateString(),
                ])->values(),
                'tasks' => $campaign->tasks->map(fn ($task) => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'status' => $task->status,
                    'priority' => $task->priority,
                    'due_date' => $task->due_date?->toDateString(),
                    'assignment_count' => $task->assignments->count(),
                ])->values(),
                'task_summary' => $taskSummary,
            ],
        ]);
    }

    public function update(StoreCampaignRequest $request, int $id): JsonResponse
    {
        $campaign = Campaign::findOrFail($id);

        DB::transaction(function () use ($request, $campaign) {
            $validated = $request->validated();
            $checkpoints = $validated['checkpoints'] ?? null;
            unset($validated['checkpoints']);

            $campaign->update($validated);

            if (is_array($checkpoints)) {
                $campaign->checkpoints()->delete();
                foreach ($checkpoints as $checkpoint) {
                    CampaignCheckpoint::create(array_merge($checkpoint, ['campaign_id' => $campaign->id]));
                }
            }
        });

        return response()->json(['success' => true, 'data' => new CampaignResource($campaign->fresh(['unit', 'checkpoints', 'tasks']))]);
    }

    public function assignTask(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'priority' => ['required', 'in:low,medium,high,urgent'],
            'due_date' => ['nullable', 'date'],
            'escalation_at' => ['nullable', 'date'],
            'member_ids' => ['required', 'array', 'min:1'],
            'member_ids.*' => ['integer', 'exists:members,id'],
        ]);

        $campaign = Campaign::findOrFail($id);
        $memberIds = $validated['member_ids'];
        unset($validated['member_ids']);

        $task = DB::transaction(function () use ($campaign, $validated, $memberIds) {
            $task = MemberTask::create(array_merge($validated, [
                'campaign_id' => $campaign->id,
                'created_by' => auth()->id(),
                'status' => 'pending',
            ]));

            foreach ($memberIds as $memberId) {
                TaskAssignment::create([
                    'task_id' => $task->id,
                    'member_id' => $memberId,
                    'status' => 'pending',
                ]);
            }

            return $task->load(['assignments.member', 'campaign']);
        });

        return response()->json(['success' => true, 'message' => 'Campaign task assigned successfully.', 'data' => $task], 201);
    }
}