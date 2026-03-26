<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventReportRequest;
use App\Http\Requests\StoreEventRequest;
use App\Http\Resources\EventReportResource;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\EventMedia;
use App\Models\EventReport;
use App\Models\EventRsvp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $events = Event::with(['unit', 'rsvps'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->input('status')))
            ->when($request->filled('event_type'), fn ($query) => $query->where('event_type', $request->input('event_type')))
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => EventResource::collection($events)]);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = Event::create(array_merge($request->validated(), [
            'created_by' => auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully.',
            'data' => new EventResource($event->load(['unit', 'rsvps'])),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $event = Event::with(['unit', 'rsvps.member', 'report.media'])->findOrFail($id);

        $attendanceByUnit = DB::table('event_rsvps')
            ->join('members', 'members.id', '=', 'event_rsvps.member_id')
            ->leftJoin('organizational_units', 'organizational_units.id', '=', 'members.organizational_unit_id')
            ->where('event_rsvps.event_id', $event->id)
            ->selectRaw("COALESCE(organizational_units.name, 'Unassigned') as unit_name, COUNT(*) as total, SUM(CASE WHEN event_rsvps.attendance_status IN ('checked_in', 'checked_out') THEN 1 ELSE 0 END) as attended")
            ->groupBy('organizational_units.name')
            ->orderByDesc('attended')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'event' => new EventResource($event),
                'attendance_by_unit' => $attendanceByUnit,
                'report' => $event->report ? new EventReportResource($event->report->load('media')) : null,
            ],
        ]);
    }

    public function update(StoreEventRequest $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $event->update($request->validated());

        return response()->json(['success' => true, 'data' => new EventResource($event->fresh(['unit', 'rsvps']))]);
    }

    public function approve(int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $event->update([
            'status' => 'pending_approval' === ($event->status->value ?? $event->status) ? 'published' : 'pending_approval',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'published_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Event approval workflow updated.', 'data' => new EventResource($event->fresh(['unit', 'rsvps']))]);
    }

    public function attendanceSummary(int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $rows = EventRsvp::with('member')
            ->where('event_id', $event->id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'rsvp_total' => $rows->count(),
                    'going' => $rows->where('rsvp_status', 'going')->count(),
                    'checked_in' => $rows->whereIn('attendance_status', ['checked_in', 'checked_out'])->count(),
                    'checked_out' => $rows->where('attendance_status', 'checked_out')->count(),
                    'no_show' => $rows->where('attendance_status', 'no_show')->count(),
                ],
                'records' => $rows,
            ],
        ]);
    }

    public function upsertReport(StoreEventReportRequest $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $report = DB::transaction(function () use ($request, $event) {
            $validated = $request->validated();
            $media = $validated['media'] ?? [];
            unset($validated['media']);

            $report = EventReport::updateOrCreate(
                ['event_id' => $event->id],
                array_merge($validated, [
                    'submitted_by' => auth()->id(),
                    'submitted_at' => now(),
                ])
            );

            if ($media) {
                $report->media()->delete();

                foreach ($media as $item) {
                    EventMedia::create(array_merge($item, [
                        'event_report_id' => $report->id,
                        'uploaded_by' => auth()->id(),
                    ]));
                }
            }

            return $report->load('media');
        });

        return response()->json([
            'success' => true,
            'message' => 'Event report saved successfully.',
            'data' => new EventReportResource($report),
        ]);
    }
}