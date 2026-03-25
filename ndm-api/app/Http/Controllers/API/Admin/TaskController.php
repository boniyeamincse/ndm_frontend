<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignTaskRequest;
use App\Models\Member;
use App\Models\MemberTask;
use App\Models\TaskAssignment;
use Illuminate\Support\Facades\DB;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin task management + member progress tracking.
 *
 * Admin Routes:
 *  GET    /admin/tasks              → index()      — filtered task list
 *  POST   /admin/tasks              → store()      — create + assign
 *  GET    /admin/tasks/{id}         → show()       — task detail w/ assignments
 *  PUT    /admin/tasks/{id}         → update()     — edit task meta
 *  DELETE /admin/tasks/{id}         → destroy()    — soft-delete
 *
 * Member Routes (active.member middleware):
 *  GET    /tasks/my                 → myTasks()    — own assignments
 *  PUT    /tasks/{task}/progress    → updateProgress() — update own assignment status
 */
class TaskController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLog) {}

    // ── Admin: CRUD ───────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status'   => ['nullable', 'in:open,in_progress,completed,cancelled'],
            'priority' => ['nullable', 'in:low,normal,high,urgent'],
        ]);

        $tasks = MemberTask::with(['creator', 'assignments.member'])
            ->when($request->status,   fn ($q) => $q->where('status',   $request->status))
            ->when($request->priority, fn ($q) => $q->where('priority', $request->priority))
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $tasks]);
    }

    public function store(AssignTaskRequest $request): JsonResponse
    {
        $validated  = $request->validated();
        $memberIds  = $validated['member_ids'] ?? [];
        unset($validated['member_ids']);

        $task = MemberTask::create(array_merge($validated, ['created_by' => auth()->id()]));

        foreach ($memberIds as $memberId) {
            TaskAssignment::create(['task_id' => $task->id, 'member_id' => $memberId, 'status' => 'pending']);
        }

        $this->auditLog->log('task.created', $task, [], $task->toArray());

        return response()->json(['success' => true, 'data' => $task->load('assignments.member')], 201);
    }

    public function show(int $id): JsonResponse
    {
        $task = MemberTask::with(['creator', 'assignments.member', 'subTasks'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $task]);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => ['sometimes', 'string', 'max:191'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status'      => ['sometimes', 'in:open,in_progress,completed,cancelled'],
            'priority'    => ['sometimes', 'in:low,normal,high,urgent'],
            'due_date'    => ['sometimes', 'nullable', 'date'],
        ]);

        $task = MemberTask::findOrFail($id);
        $old  = $task->only(array_keys($validated));
        $task->update($validated);

        $this->auditLog->log('task.updated', $task, $old, $task->only(array_keys($validated)));

        return response()->json(['success' => true, 'data' => $task]);
    }

    public function destroy(int $id): JsonResponse
    {
        $task = MemberTask::findOrFail($id);
        $this->auditLog->log('task.deleted', $task, $task->toArray());
        $task->delete(); // soft-deletes

        return response()->json(['success' => true, 'message' => 'Task deleted.']);
    }

    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'unit_id' => ['nullable', 'integer', 'exists:organizational_units,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $taskQuery = MemberTask::query()
            ->when($request->filled('from'), fn ($query) => $query->whereDate('created_at', '>=', $request->input('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('created_at', '<=', $request->input('to')))
            ->when($request->filled('unit_id'), function ($query) use ($request) {
                $query->whereHas('assignments.member', fn ($memberQuery) =>
                    $memberQuery->where('organizational_unit_id', $request->integer('unit_id'))
                );
            });

        $overview = [
            'total' => (clone $taskQuery)->count(),
            'open' => (clone $taskQuery)->whereIn('status', ['open', 'in_progress'])->count(),
            'completed' => (clone $taskQuery)->where('status', 'completed')->count(),
            'cancelled' => (clone $taskQuery)->where('status', 'cancelled')->count(),
            'overdue' => (clone $taskQuery)
                ->whereDate('due_date', '<', now()->toDateString())
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->count(),
        ];

        $byPriority = (clone $taskQuery)
            ->selectRaw('priority, COUNT(*) as count')
            ->groupBy('priority')
            ->orderByRaw("FIELD(priority, 'urgent', 'high', 'normal', 'low')")
            ->get()
            ->map(fn ($row) => ['priority' => $row->priority, 'count' => (int) $row->count])
            ->values();

        $today = now()->toDateString();

        $unitBreakdown = DB::table('task_assignments')
            ->join('members', 'task_assignments.member_id', '=', 'members.id')
            ->leftJoin('organizational_units', 'members.organizational_unit_id', '=', 'organizational_units.id')
            ->join('member_tasks', 'task_assignments.task_id', '=', 'member_tasks.id')
            ->whereNull('member_tasks.deleted_at')
            ->when($request->filled('from'), fn ($query) => $query->whereDate('member_tasks.created_at', '>=', $request->input('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('member_tasks.created_at', '<=', $request->input('to')))
            ->when($request->filled('unit_id'), fn ($query) => $query->where('members.organizational_unit_id', $request->integer('unit_id')))
            ->selectRaw("COALESCE(organizational_units.id, 0) as unit_id, COALESCE(organizational_units.name, 'Unassigned') as unit_name,
                SUM(CASE WHEN member_tasks.status IN ('open','in_progress') THEN 1 ELSE 0 END) as open_count,
                SUM(CASE WHEN member_tasks.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN member_tasks.due_date < ? AND member_tasks.status NOT IN ('completed','cancelled') THEN 1 ELSE 0 END) as overdue_count", [$today])
            ->groupBy('organizational_units.id', 'organizational_units.name')
            ->orderByDesc('overdue_count')
            ->get()
            ->map(fn ($row) => [
                'unit_id' => $row->unit_id === 0 ? null : (int) $row->unit_id,
                'unit_name' => $row->unit_name,
                'open' => (int) $row->open_count,
                'completed' => (int) $row->completed_count,
                'overdue' => (int) $row->overdue_count,
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => $overview,
                'by_priority' => $byPriority,
                'by_unit' => $unitBreakdown,
            ],
        ]);
    }

    // ── Member: Progress ──────────────────────────────────────────────

    public function myTasks(Request $request): JsonResponse
    {
        $member = auth()->user()->member;

        $assignments = TaskAssignment::with('task')
            ->where('member_id', $member->id)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $assignments]);
    }

    public function updateProgress(int $taskId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status'        => ['required', 'in:pending,in_progress,done'],
            'progress_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $member     = auth()->user()->member;
        $assignment = TaskAssignment::where('task_id', $taskId)
            ->where('member_id', $member->id)
            ->firstOrFail();

        $old = $assignment->only(['status', 'progress_note']);
        $assignment->update(array_merge($validated, [
            'completed_at' => $validated['status'] === 'done' ? now() : null,
        ]));

        return response()->json(['success' => true, 'data' => $assignment]);
    }
}
