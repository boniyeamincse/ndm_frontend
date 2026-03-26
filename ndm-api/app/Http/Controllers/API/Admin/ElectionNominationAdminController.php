<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\NominationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ElectionNominationResource;
use App\Models\Election;
use App\Models\ElectionNomination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * Task 166 — Candidate nomination workflow.
 * Admin review: approve, reject, publish/unpublish nominations.
 */
class ElectionNominationAdminController extends Controller
{
    public function index(Request $request, int $electionId): JsonResponse
    {
        $election = Election::find($electionId);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        $query = ElectionNomination::where('election_id', $electionId)
            ->with(['candidate.user', 'proposer', 'seconder', 'reviewer']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $nominations = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => ElectionNominationResource::collection($nominations),
        ]);
    }

    public function show(int $electionId, int $nominationId): JsonResponse
    {
        $nomination = ElectionNomination::where('election_id', $electionId)
            ->with(['candidate.user', 'proposer', 'seconder', 'reviewer', 'voteEntries'])
            ->find($nominationId);

        if (! $nomination) {
            return response()->json(['message' => 'Nomination not found.'], 404);
        }

        return response()->json(['success' => true, 'data' => new ElectionNominationResource($nomination)]);
    }

    public function approve(int $electionId, int $nominationId): JsonResponse
    {
        $nomination = ElectionNomination::where('election_id', $electionId)->find($nominationId);

        if (! $nomination) {
            return response()->json(['message' => 'Nomination not found.'], 404);
        }

        if ($nomination->status !== NominationStatus::PENDING) {
            return response()->json(['message' => 'Only pending nominations can be approved.'], 422);
        }

        $nomination->update([
            'status'      => NominationStatus::APPROVED->value,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nomination approved.',
            'data'    => new ElectionNominationResource($nomination->fresh(['candidate', 'proposer', 'seconder'])),
        ]);
    }

    public function reject(Request $request, int $electionId, int $nominationId): JsonResponse
    {
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        $nomination = ElectionNomination::where('election_id', $electionId)->find($nominationId);

        if (! $nomination) {
            return response()->json(['message' => 'Nomination not found.'], 404);
        }

        if (! in_array($nomination->status->value, [
            NominationStatus::PENDING->value,
            NominationStatus::APPROVED->value,
        ])) {
            return response()->json(['message' => 'This nomination cannot be rejected in its current state.'], 422);
        }

        $nomination->update([
            'status'           => NominationStatus::REJECTED->value,
            'reviewed_by'      => Auth::id(),
            'reviewed_at'      => now(),
            'is_published'     => false,
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nomination rejected.',
            'data'    => new ElectionNominationResource($nomination->fresh(['candidate'])),
        ]);
    }

    public function togglePublish(int $electionId, int $nominationId): JsonResponse
    {
        $nomination = ElectionNomination::where('election_id', $electionId)->find($nominationId);

        if (! $nomination) {
            return response()->json(['message' => 'Nomination not found.'], 404);
        }

        if ($nomination->status !== NominationStatus::APPROVED) {
            return response()->json(['message' => 'Only approved nominations can be published.'], 422);
        }

        $nomination->update(['is_published' => ! $nomination->is_published]);

        $action = $nomination->fresh()->is_published ? 'published' : 'unpublished';

        return response()->json([
            'success' => true,
            'message' => "Nomination {$action}.",
            'data'    => new ElectionNominationResource($nomination->fresh(['candidate'])),
        ]);
    }
}
