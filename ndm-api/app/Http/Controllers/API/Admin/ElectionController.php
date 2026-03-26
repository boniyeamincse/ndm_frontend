<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\ElectionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreElectionRequest;
use App\Http\Resources\ElectionResource;
use App\Models\Election;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * Task 165 — Build internal election framework.
 * Admin CRUD + lifecycle transitions for elections.
 */
class ElectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Election::with(['scopeUnit', 'creator']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('election_type')) {
            $query->where('election_type', $request->election_type);
        }

        if ($request->filled('unit_id')) {
            $query->where('scope_unit_id', $request->unit_id);
        }

        $elections = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => ElectionResource::collection($elections->items()),
            'meta'    => [
                'current_page' => $elections->currentPage(),
                'last_page'    => $elections->lastPage(),
                'total'        => $elections->total(),
            ],
        ]);
    }

    public function store(StoreElectionRequest $request): JsonResponse
    {
        $election = Election::create(array_merge(
            $request->validated(),
            ['created_by' => Auth::id()]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Election created successfully.',
            'data'    => new ElectionResource($election->load(['scopeUnit', 'creator'])),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $election = Election::with([
            'scopeUnit',
            'creator',
            'nominations.candidate',
            'voterReceipts',
        ])->find($id);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        return response()->json(['success' => true, 'data' => new ElectionResource($election)]);
    }

    public function update(StoreElectionRequest $request, int $id): JsonResponse
    {
        $election = Election::find($id);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        if ($election->status === ElectionStatus::RESULT_PUBLISHED) {
            return response()->json(['message' => 'Cannot modify a completed election.'], 422);
        }

        $election->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Election updated.',
            'data'    => new ElectionResource($election->fresh(['scopeUnit', 'creator'])),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $election = Election::find($id);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        if ($election->status !== ElectionStatus::DRAFT->value &&
            $election->status->value !== ElectionStatus::DRAFT->value) {
            if ($election->status !== ElectionStatus::DRAFT) {
                return response()->json(['message' => 'Only draft elections can be deleted.'], 422);
            }
        }

        $election->delete();

        return response()->json(['success' => true, 'message' => 'Election deleted.']);
    }

    /**
     * Transition election status through its lifecycle.
     * Allowed transitions: draft → nomination_open → nomination_closed
     *   → voting_open → voting_closed → result_published | cancelled
     */
    public function transition(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(ElectionStatus::allowedValues())],
        ]);

        $election = Election::find($id);

        if (! $election) {
            return response()->json(['message' => 'Election not found.'], 404);
        }

        $allowed = $this->allowedTransitions($election->status->value);

        if (! in_array($validated['status'], $allowed)) {
            return response()->json([
                'message' => "Cannot transition from '{$election->status->value}' to '{$validated['status']}'.",
                'allowed_transitions' => $allowed,
            ], 422);
        }

        $election->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => "Election status updated to '{$validated['status']}'.",
            'data'    => new ElectionResource($election->fresh(['scopeUnit'])),
        ]);
    }

    private function allowedTransitions(string $current): array
    {
        return match($current) {
            'draft'              => ['nomination_open', 'cancelled'],
            'nomination_open'    => ['nomination_closed', 'cancelled'],
            'nomination_closed'  => ['voting_open', 'cancelled'],
            'voting_open'        => ['voting_closed', 'cancelled'],
            'voting_closed'      => ['result_published'],
            default              => [],
        };
    }
}
