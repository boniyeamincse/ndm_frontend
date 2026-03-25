<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
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

        $stats = [
            'total_members'     => (clone $members)->count(),
            'active_members'    => (clone $members)->where('status', 'active')->count(),
            'pending_approval'  => (clone $members)->where('status', 'pending')->count(),
            'suspended_members' => (clone $members)->where('status', 'suspended')->count(),
            'expelled_members'  => (clone $members)->where('status', 'expelled')->count(),
            'total_units'       => OrganizationalUnit::where('is_active', 1)->count(),
            'total_tasks'       => MemberTask::count(),
            'open_tasks'        => MemberTask::whereIn('status', ['pending', 'in_progress'])->count(),
        ];

        $recentActivity = AuditLog::with('user')
            ->orderByDesc('performed_at')
            ->limit(10)
            ->get()
            ->map(fn ($log) => [
                'action'       => $log->action,
                'performed_by' => $log->user?->email,
                'ip'           => $log->ip_address,
                'at'           => $log->performed_at?->diffForHumans(),
            ]);

        $membersByStatus = Member::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $membersByYear = Member::selectRaw('join_year, COUNT(*) as total')
            ->groupBy('join_year')
            ->orderBy('join_year')
            ->pluck('total', 'join_year');

        return response()->json([
            'success'         => true,
            'stats'           => $stats,
            'members_by_status' => $membersByStatus,
            'members_by_year'   => $membersByYear,
            'recent_activity'   => $recentActivity,
        ]);
    }
}
