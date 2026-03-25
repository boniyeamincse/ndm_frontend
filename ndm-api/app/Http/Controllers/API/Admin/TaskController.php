<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignTaskRequest;
use App\Models\Member;
use App\Models\MemberTask;
use App\Models\TaskAssignment;
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
