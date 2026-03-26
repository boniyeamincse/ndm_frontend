<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMemberCommunicationPreferenceRequest;
use App\Models\CommunicationGovernanceLog;
use App\Models\MemberCommunicationPreference;
use Illuminate\Http\JsonResponse;

class CommunicationPreferenceController extends Controller
{
    public function unsubscribe(StoreMemberCommunicationPreferenceRequest $request): JsonResponse
    {
        $member = $request->user()?->member;

        if (! $member) {
            return response()->json(['success' => false, 'message' => 'Member profile not found.'], 404);
        }

        $scope = $request->input('scope');
        $unsubscribe = $request->boolean('unsubscribe', true);

        $pref = MemberCommunicationPreference::firstOrCreate(['member_id' => $member->id]);

        if ($scope === 'all') {
            $pref->update([
                'sms_opt_in' => ! $unsubscribe,
                'whatsapp_opt_in' => ! $unsubscribe,
                'email_opt_in' => ! $unsubscribe,
                'unsubscribed_at' => $unsubscribe ? now() : null,
                'unsubscribe_scope' => $unsubscribe ? 'all' : null,
                'unsubscribe_reason' => $request->input('reason'),
                'updated_by' => $request->user()->id,
            ]);
        } else {
            $field = $scope . '_opt_in';
            $pref->update([
                $field => ! $unsubscribe,
                'unsubscribed_at' => $unsubscribe ? now() : $pref->unsubscribed_at,
                'unsubscribe_scope' => $scope,
                'unsubscribe_reason' => $request->input('reason'),
                'updated_by' => $request->user()->id,
            ]);
        }

        CommunicationGovernanceLog::create([
            'member_id' => $member->id,
            'actor_user_id' => $request->user()->id,
            'event_type' => 'member_unsubscribe_update',
            'decision' => $unsubscribe ? 'unsubscribe' : 'subscribe',
            'notes' => $request->input('reason'),
            'meta' => ['scope' => $scope],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Communication preference updated.',
            'data' => $pref->fresh(),
        ]);
    }
}