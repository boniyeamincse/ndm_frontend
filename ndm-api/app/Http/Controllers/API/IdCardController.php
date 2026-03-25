<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Services\IdCardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

/**
 * Generate and serve member digital ID cards as PDF.
 *
 * Security:
 *  - Members can only download their own card
 *  - Admins (organizer|admin role) can download any member's card
 *  - No direct file storage — PDF streamed on-demand to prevent enumeration
 */
class IdCardController extends Controller
{
    public function __construct(private readonly IdCardService $idCardService) {}

    /**
     * Public verification endpoint for QR scans.
     */
    public function verify(string $memberId): JsonResponse
    {
        $member = Member::query()
            ->where('member_id', $memberId)
            ->where('status', 'active')
            ->with([
                'organizationalUnit',
                'positions' => function ($query) {
                    $query->where('is_active', 1)->with('role', 'unit');
                },
            ])
            ->first();

        if (! $member) {
            return response()->json([
                'success' => false,
                'verified' => false,
                'message' => 'Card could not be verified.',
            ], 404);
        }

        $activePosition = $member->positions
            ->sortBy(fn ($position) => $position->role?->rank_order ?? PHP_INT_MAX)
            ->first();

        return response()->json([
            'success' => true,
            'verified' => true,
            'data' => [
                'member_id' => $member->member_id,
                'full_name' => $member->full_name,
                'status' => $member->status->value,
                'join_year' => $member->join_year,
                'organization' => 'Nationalist Democratic Student Movement (NDSM)',
                'unit' => $member->organizationalUnit ? [
                    'id' => $member->organizationalUnit->id,
                    'name' => $member->organizationalUnit->name,
                    'type' => $member->organizationalUnit->type,
                ] : null,
                'active_position' => $activePosition ? [
                    'role' => $activePosition->role?->title,
                    'unit' => $activePosition->unit?->name,
                    'assigned_at' => optional($activePosition->assigned_at)?->toDateString(),
                ] : null,
            ],
        ]);
    }

    /**
     * Download the authenticated member's own ID card.
     */
    public function download(): Response
    {
        $member = auth()->user()->member()->with([
            'organizationalUnit', 'positions' => function ($q) {
                $q->where('is_active', 1)->with('role');
            },
        ])->firstOrFail();

        if ($member->status->value !== 'active') {
            abort(403, 'ID card is only available for active members.');
        }

        return $this->streamPdf($member);
    }

    /**
     * Admin: download any member's ID card by numeric DB ID.
     */
    public function downloadByAdmin(int $id): Response
    {
        $member = Member::with([
            'organizationalUnit', 'positions' => function ($q) {
                $q->where('is_active', 1)->with('role');
            },
        ])->findOrFail($id);

        return $this->streamPdf($member);
    }

    /**
     * Preview as inline (for rendering in browser).
     */
    public function preview(): Response
    {
        $member = auth()->user()->member()->with([
            'organizationalUnit', 'positions' => function ($q) {
                $q->where('is_active', 1)->with('role');
            },
        ])->firstOrFail();

        if ($member->status->value !== 'active') {
            abort(403, 'ID card is only available for active members.');
        }

        $pdf = $this->idCardService->generate($member);

        return response($pdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="id_card_preview.pdf"',
        ]);
    }

    // ── Helper ────────────────────────────────────────────────────────

    private function streamPdf(Member $member): Response
    {
        $pdf      = $this->idCardService->generate($member);
        $filename = 'NDM_ID_' . str_replace('/', '_', $member->member_id) . '.pdf';

        return response($pdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-cache, no-store, must-revalidate',
        ]);
    }
}
