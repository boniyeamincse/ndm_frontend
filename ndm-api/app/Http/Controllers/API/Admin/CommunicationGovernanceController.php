<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommunicationGovernanceLog;
use App\Models\MemberCommunicationPreference;
use App\Models\OutreachCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunicationGovernanceController extends Controller
{
    public function consentReport(): JsonResponse
    {
        $prefs = MemberCommunicationPreference::query();

        $total = $prefs->count();
        $smsOptOut = (clone $prefs)->where('sms_opt_in', false)->count();
        $whatsappOptOut = (clone $prefs)->where('whatsapp_opt_in', false)->count();
        $emailOptOut = (clone $prefs)->where('email_opt_in', false)->count();
        $globalUnsubscribed = (clone $prefs)->whereNotNull('unsubscribed_at')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_preferences' => $total,
                'sms_opt_out' => $smsOptOut,
                'whatsapp_opt_out' => $whatsappOptOut,
                'email_opt_out' => $emailOptOut,
                'global_unsubscribed' => $globalUnsubscribed,
            ],
        ]);
    }

    public function auditTrail(Request $request): JsonResponse
    {
        $query = CommunicationGovernanceLog::query()->with(['campaign', 'member', 'actor']);

        if ($eventType = $request->string('event_type')->value()) {
            $query->where('event_type', $eventType);
        }

        $items = $query->latest()->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function moderation(Request $request, int $campaignId): JsonResponse
    {
        $campaign = OutreachCampaign::findOrFail($campaignId);
        $decision = $request->input('decision', 'approved');
        $notes = $request->input('notes');

        if ($decision === 'rejected') {
            $campaign->update(['status' => 'cancelled']);
        } elseif ($campaign->status === 'pending_approval') {
            $campaign->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);
        }

        CommunicationGovernanceLog::create([
            'outreach_campaign_id' => $campaign->id,
            'actor_user_id' => auth()->id(),
            'event_type' => 'campaign_moderation',
            'decision' => $decision,
            'notes' => $notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Moderation decision recorded.',
        ]);
    }
}