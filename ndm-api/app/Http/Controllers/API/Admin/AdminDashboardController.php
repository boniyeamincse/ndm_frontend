<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\MemberPosition;
use App\Models\OrganizationalUnit;
use App\Models\MemberTask;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

/**
 * Admin Dashboard — KPI statistics endpoint.
 */
class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $members = Member::query();

        $membersByYear = Member::selectRaw('join_year, COUNT(*) as count')
            ->groupBy('join_year')
            ->orderBy('join_year')
            ->get()
            ->map(fn ($row) => [
                'year'  => (int) $row->join_year,
                'count' => (int) $row->count,
            ])
            ->values();

        $unitsByType = OrganizationalUnit::selectRaw('type, COUNT(*) as count')
            ->where('is_active', 1)
            ->groupBy('type')
            ->orderByRaw("FIELD(type,'central','division','district','upazila','union','ward','campus')")
            ->get()
            ->map(fn ($row) => [
                'type'  => $row->type,
                'count' => (int) $row->count,
            ])
            ->values();

        $payload = [
            'members' => [
                'total'     => (clone $members)->count(),
                'active'    => (clone $members)->where('status', 'active')->count(),
                'pending'   => (clone $members)->where('status', 'pending')->count(),
                'suspended' => (clone $members)->where('status', 'suspended')->count(),
                'expelled'  => (clone $members)->where('status', 'expelled')->count(),
            ],
            'positions' => [
                'total_active' => MemberPosition::where('is_active', true)->count(),
            ],
            'units' => [
                'total' => OrganizationalUnit::where('is_active', 1)->count(),
            ],
            'tasks' => [
                'total' => MemberTask::count(),
                'open'  => MemberTask::whereIn('status', ['open', 'pending', 'in_progress'])->count(),
            ],
            'units_by_type'  => $unitsByType,
            'members_by_year' => $membersByYear,
        ];

        return response()->json([
            'success' => true,
            'data'    => $payload,
        ]);
    }

    public function recentActivity(): JsonResponse
    {
        $logs = AuditLog::with('user')
            ->orderByDesc('performed_at')
            ->limit(20)
            ->get()
            ->map(fn ($log) => [
                'id'           => $log->id,
                'action'       => $log->action,
                'model_type'   => $log->model_type,
                'model_id'     => $log->model_id,
                'performed_at' => $log->performed_at,
                'performed_by' => $log->user?->email,
                'ip_address'   => $log->ip_address,
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data'    => $logs,
        ]);
    }
}
