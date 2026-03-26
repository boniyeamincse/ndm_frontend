<?php

namespace App\Services;

use App\Models\AudienceSegment;
use App\Models\CommunicationConnector;
use App\Models\CommunicationGovernanceLog;
use App\Models\Member;
use App\Models\MemberCommunicationPreference;
use App\Models\OutreachCampaign;
use App\Models\OutreachCampaignTarget;
use App\Models\OutreachDeliveryLog;
use App\Models\OutreachRetryJob;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class OutreachCampaignService
{
    public function estimateRecipients(OutreachCampaign $campaign): int
    {
        return $this->resolveRecipients($campaign)->count();
    }

    public function approve(OutreachCampaign $campaign, int $userId): OutreachCampaign
    {
        $campaign->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now(),
            'recipient_estimate' => $this->estimateRecipients($campaign),
        ]);

        CommunicationGovernanceLog::create([
            'outreach_campaign_id' => $campaign->id,
            'actor_user_id' => $userId,
            'event_type' => 'campaign_approval',
            'decision' => 'approved',
            'meta' => ['channel' => $campaign->channel],
        ]);

        return $campaign->fresh();
    }

    public function dispatchNow(OutreachCampaign $campaign): array
    {
        if ($campaign->requires_approval && $campaign->status !== 'approved') {
            return [
                'success' => false,
                'message' => 'Campaign requires approval before sending.',
            ];
        }

        $recipients = $this->resolveRecipients($campaign);
        $connector = $this->resolveConnector($campaign->channel);

        $sent = 0;
        $failed = 0;

        DB::transaction(function () use ($campaign, $recipients, $connector, &$sent, &$failed) {
            $campaign->update(['status' => 'sending']);

            foreach ($recipients as $member) {
                $consent = $this->hasConsent($member, $campaign->channel);

                OutreachCampaignTarget::updateOrCreate(
                    ['outreach_campaign_id' => $campaign->id, 'member_id' => $member->id],
                    [
                        'resolved_channel_contact' => $this->resolveContact($member, $campaign->channel),
                        'consent_ok' => $consent,
                    ],
                );

                if (! $consent) {
                    CommunicationGovernanceLog::create([
                        'outreach_campaign_id' => $campaign->id,
                        'member_id' => $member->id,
                        'event_type' => 'consent_blocked',
                        'decision' => 'blocked',
                        'meta' => ['channel' => $campaign->channel],
                    ]);

                    continue;
                }

                $status = $connector ? 'sent' : 'failed';

                $log = OutreachDeliveryLog::create([
                    'outreach_campaign_id' => $campaign->id,
                    'member_id' => $member->id,
                    'connector_id' => $connector?->id,
                    'channel' => $campaign->channel,
                    'status' => $status,
                    'attempt_count' => 1,
                    'failure_reason' => $connector ? null : 'No active connector configured.',
                    'sent_at' => $connector ? now() : null,
                    'delivered_at' => $connector ? now() : null,
                ]);

                if ($status === 'failed') {
                    $failed++;
                    OutreachRetryJob::create([
                        'outreach_delivery_log_id' => $log->id,
                        'retry_number' => 1,
                        'next_retry_at' => now()->addMinutes(10),
                        'status' => 'queued',
                        'failure_reason' => $log->failure_reason,
                    ]);
                } else {
                    $sent++;
                }
            }

            $campaign->update([
                'status' => 'sent',
                'sent_at' => now(),
                'recipient_estimate' => $recipients->count(),
                'sent_count' => $sent,
                'failed_count' => $failed,
            ]);
        });

        return [
            'success' => true,
            'campaign_id' => $campaign->id,
            'recipients' => $recipients->count(),
            'sent' => $sent,
            'failed' => $failed,
            'message' => 'Campaign dispatch completed.',
        ];
    }

    public function retryFailedLogs(array $logIds = []): array
    {
        $query = OutreachDeliveryLog::query()->where('status', 'failed');

        if (! empty($logIds)) {
            $query->whereIn('id', $logIds);
        }

        $logs = $query->get();
        $retried = 0;

        foreach ($logs as $log) {
            $connector = $this->resolveConnector($log->channel);
            $nextStatus = $connector ? 'sent' : 'failed';

            $log->update([
                'status' => $nextStatus,
                'attempt_count' => $log->attempt_count + 1,
                'sent_at' => $connector ? now() : $log->sent_at,
                'delivered_at' => $connector ? now() : $log->delivered_at,
                'failure_reason' => $connector ? null : 'Retry failed: connector unavailable.',
            ]);

            OutreachRetryJob::create([
                'outreach_delivery_log_id' => $log->id,
                'retry_number' => $log->attempt_count,
                'next_retry_at' => $connector ? null : now()->addMinutes(30),
                'status' => $connector ? 'processed' : 'failed',
                'failure_reason' => $log->failure_reason,
            ]);

            $retried++;
        }

        return [
            'success' => true,
            'retried' => $retried,
            'message' => 'Retry execution completed.',
        ];
    }

    private function resolveRecipients(OutreachCampaign $campaign): Collection
    {
        $segment = $campaign->segment;
        $filters = $campaign->custom_filters ?? [];

        if ($segment && ! empty($segment->filters)) {
            $filters = array_merge($segment->filters, $filters);
        }

        $type = $segment?->segment_type ?? ($filters['segment_type'] ?? 'all_members');

        $query = Member::query()->where('status', 'active')->with('memberRole');

        if ($type === 'role_based') {
            $roles = $filters['roles'] ?? [];
            if (! empty($roles)) {
                $query->whereHas('memberRole', fn ($q) => $q->whereIn('role', $roles));
            }
        }

        if ($type === 'unit_based') {
            $unitIds = $filters['unit_ids'] ?? [];
            if (! empty($unitIds)) {
                $query->whereIn('organizational_unit_id', $unitIds);
            }
        }

        if ($type === 'status_based') {
            $statuses = $filters['statuses'] ?? ['active'];
            $query->whereIn('status', $statuses);
        }

        if ($type === 'custom') {
            $memberIds = $filters['member_ids'] ?? [];
            if (! empty($memberIds)) {
                $query->whereIn('id', $memberIds);
            }
        }

        return $query->get();
    }

    private function resolveConnector(string $channel): ?CommunicationConnector
    {
        return CommunicationConnector::where('channel', $channel)
            ->where('is_active', true)
            ->whereIn('health_status', ['healthy', 'degraded'])
            ->first();
    }

    private function hasConsent(Member $member, string $channel): bool
    {
        $pref = MemberCommunicationPreference::firstOrCreate(
            ['member_id' => $member->id],
            ['sms_opt_in' => true, 'whatsapp_opt_in' => true, 'email_opt_in' => true],
        );

        return match ($channel) {
            'sms' => (bool) $pref->sms_opt_in,
            'whatsapp' => (bool) $pref->whatsapp_opt_in,
            'email' => (bool) $pref->email_opt_in,
            default => false,
        };
    }

    private function resolveContact(Member $member, string $channel): ?string
    {
        return match ($channel) {
            'sms', 'whatsapp' => $member->mobile ?: $member->phone,
            'email' => $member->email,
            default => null,
        };
    }
}