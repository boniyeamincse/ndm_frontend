<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\EventRsvp;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventMemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $events = Event::with('unit')
            ->where('status', 'published')
            ->when($request->filled('event_type'), fn ($query) => $query->where('event_type', $request->input('event_type')))
            ->orderBy('starts_at')
            ->get();

        return response()->json(['success' => true, 'data' => EventResource::collection($events)]);
    }

    public function show(int $id): JsonResponse
    {
        $event = Event::with(['unit', 'report.media'])->where('status', 'published')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'event' => new EventResource($event),
                'report' => $event->report,
            ],
        ]);
    }

    public function rsvp(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'rsvp_status' => ['required', 'in:going,interested,not_going'],
        ]);

        $member = Member::where('user_id', auth()->id())->firstOrFail();

        $rsvp = EventRsvp::updateOrCreate(
            ['event_id' => $id, 'member_id' => $member->id],
            ['rsvp_status' => $validated['rsvp_status'], 'responded_at' => now()]
        );

        return response()->json(['success' => true, 'data' => $rsvp]);
    }

    public function checkIn(int $id): JsonResponse
    {
        $member = Member::where('user_id', auth()->id())->firstOrFail();
        $rsvp = EventRsvp::firstOrCreate(
            ['event_id' => $id, 'member_id' => $member->id],
            ['rsvp_status' => 'going', 'responded_at' => now()]
        );
        $rsvp->update(['attendance_status' => 'checked_in', 'checked_in_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Checked in successfully.', 'data' => $rsvp]);
    }

    public function checkOut(int $id): JsonResponse
    {
        $member = Member::where('user_id', auth()->id())->firstOrFail();
        $rsvp = EventRsvp::where('event_id', $id)->where('member_id', $member->id)->firstOrFail();
        $rsvp->update(['attendance_status' => 'checked_out', 'checked_out_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Checked out successfully.', 'data' => $rsvp]);
    }
}