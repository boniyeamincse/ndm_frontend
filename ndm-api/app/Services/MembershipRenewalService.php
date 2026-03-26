<?php

namespace App\Services;

use App\Enums\MemberStatus;
use App\Models\Member;
use App\Models\MembershipRenewal;
use App\Models\RenewalReminder;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;

class MembershipRenewalService
{
    public function processAutoExpiry(): array
    {
        $enabled = (bool) SystemSetting::get('renewal_auto_expiry_enabled', true);
        $graceDays = (int) SystemSetting::get('renewal_grace_period_days', 30);

        if (! $enabled) {
            return ['success' => true, 'expired_count' => 0, 'message' => 'Auto-expiry disabled by policy setting.'];
        }

        $cutoff = now()->subDays($graceDays)->toDateString();

        $query = Member::query()
            ->where('status', MemberStatus::ACTIVE->value)
            ->whereNotNull('membership_expires_at')
            ->whereDate('membership_expires_at', '<=', $cutoff);

        $ids = $query->pluck('id');

        Member::whereIn('id', $ids)->update(['status' => MemberStatus::SUSPENDED->value]);

        MembershipRenewal::whereIn('member_id', $ids)
            ->where('status', 'submitted')
            ->update(['status' => 'expired', 'processed_at' => now()]);

        return [
            'success' => true,
            'expired_count' => $ids->count(),
            'message' => 'Auto-expiry process completed.',
        ];
    }

    public function queueReminders(): array
    {
        $preDays = (int) SystemSetting::get('renewal_pre_expiry_reminder_days', 30);
        $graceDays = (int) SystemSetting::get('renewal_grace_period_days', 30);

        $today = now()->toDateString();
        $preExpiryDate = now()->addDays($preDays)->toDateString();
        $graceDate = now()->subDays($graceDays)->toDateString();

        $preExpiryMembers = Member::query()
            ->where('status', MemberStatus::ACTIVE->value)
            ->whereDate('membership_expires_at', '=', $preExpiryDate)
            ->pluck('id');

        $graceMembers = Member::query()
            ->where('status', MemberStatus::ACTIVE->value)
            ->whereDate('membership_expires_at', '<', $today)
            ->whereDate('membership_expires_at', '>=', $graceDate)
            ->pluck('id');

        $finalMembers = Member::query()
            ->where('status', MemberStatus::ACTIVE->value)
            ->whereDate('membership_expires_at', '<', $graceDate)
            ->pluck('id');

        $queued = 0;

        DB::transaction(function () use ($preExpiryMembers, $graceMembers, $finalMembers, &$queued) {
            $queued += $this->queueForMembers($preExpiryMembers, 'pre_expiry');
            $queued += $this->queueForMembers($graceMembers, 'grace_period');
            $queued += $this->queueForMembers($finalMembers, 'final_expiry');
        });

        return [
            'success' => true,
            'queued' => $queued,
            'message' => 'Reminder queue prepared successfully.',
        ];
    }

    public function renewalRetentionReport(array $filters = []): array
    {
        $from = $filters['from'] ?? now()->startOfYear()->toDateString();
        $to = $filters['to'] ?? now()->toDateString();

        $renewalBase = MembershipRenewal::query()
            ->whereBetween(DB::raw('DATE(created_at)'), [$from, $to]);

        $totalRenewals = (clone $renewalBase)->count();
        $approvedRenewals = (clone $renewalBase)->where('status', 'approved')->count();
        $expiredRenewals = (clone $renewalBase)->where('status', 'expired')->count();
        $pendingReverification = \App\Models\MemberReverificationRequest::where('status', 'pending')->count();

        $renewalRate = $totalRenewals > 0 ? round(($approvedRenewals / $totalRenewals) * 100, 2) : 0;

        $unitWise = DB::table('members')
            ->leftJoin('organizational_units', 'organizational_units.id', '=', 'members.organizational_unit_id')
            ->leftJoin('membership_renewals', function ($join) use ($from, $to) {
                $join->on('membership_renewals.member_id', '=', 'members.id')
                    ->whereBetween(DB::raw('DATE(membership_renewals.created_at)'), [$from, $to]);
            })
            ->selectRaw("COALESCE(organizational_units.id, 0) as unit_id, COALESCE(organizational_units.name, 'Unassigned') as unit_name,
                COUNT(DISTINCT members.id) as total_members,
                SUM(CASE WHEN membership_renewals.status = 'approved' THEN 1 ELSE 0 END) as renewed_count,
                SUM(CASE WHEN members.status = 'suspended' THEN 1 ELSE 0 END) as expired_count")
            ->groupBy('organizational_units.id', 'organizational_units.name')
            ->orderByDesc('renewed_count')
            ->get()
            ->map(fn ($row) => [
                'unit_id' => $row->unit_id === 0 ? null : (int) $row->unit_id,
                'unit_name' => $row->unit_name,
                'total_members' => (int) $row->total_members,
                'renewed_count' => (int) $row->renewed_count,
                'expired_count' => (int) $row->expired_count,
                'retention_rate' => $row->total_members > 0 ? round(($row->renewed_count / $row->total_members) * 100, 2) : 0,
            ])
            ->values();

        return [
            'overview' => [
                'total_renewals' => $totalRenewals,
                'approved_renewals' => $approvedRenewals,
                'expired_renewals' => $expiredRenewals,
                'pending_reverification' => $pendingReverification,
                'renewal_rate' => $renewalRate,
            ],
            'unit_wise' => $unitWise,
            'period' => ['from' => $from, 'to' => $to],
        ];
    }

    private function queueForMembers($memberIds, string $type): int
    {
        $channels = ['in_app', 'sms', 'whatsapp', 'email'];
        $count = 0;

        foreach ($memberIds as $memberId) {
            foreach ($channels as $channel) {
                RenewalReminder::create([
                    'member_id' => $memberId,
                    'channel' => $channel,
                    'reminder_type' => $type,
                    'delivery_status' => 'queued',
                    'scheduled_for' => now(),
                ]);
                $count++;
            }
        }

        return $count;
    }
}