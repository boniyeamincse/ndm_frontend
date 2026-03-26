<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\IdCardController;
use App\Http\Controllers\API\MemberController;
use App\Http\Controllers\API\Member\ProfileController;
use App\Http\Controllers\API\UnitController;
use App\Http\Controllers\API\NewsController;
use App\Http\Controllers\API\Admin\AdminDashboardController;
use App\Http\Controllers\API\Admin\AdminMemberController;
use App\Http\Controllers\API\Admin\MemberExportController;
use App\Http\Controllers\API\Admin\OrganizationalUnitController;
use App\Http\Controllers\API\Admin\TaskController;
use App\Http\Controllers\API\Admin\RoleController;
use App\Http\Controllers\API\Admin\CommitteeController;
use App\Http\Controllers\API\Admin\CommitteeRoleController;
use App\Http\Controllers\API\Admin\PositionController;
use App\Http\Controllers\API\Admin\BlogPostController;
use App\Http\Controllers\API\Admin\SystemSettingController;
use App\Http\Controllers\API\Admin\ElectionController;
use App\Http\Controllers\API\Admin\ElectionNominationAdminController;
use App\Http\Controllers\API\Admin\ElectionResultController;
use App\Http\Controllers\API\Admin\ElectionAnalyticsController;
use App\Http\Controllers\API\Admin\EventManagementController;
use App\Http\Controllers\API\Admin\CampaignManagementController;
use App\Http\Controllers\API\Admin\MembershipRenewalAdminController;
use App\Http\Controllers\API\Admin\DonationCampaignController;
use App\Http\Controllers\API\Admin\DonationController;
use App\Http\Controllers\API\Admin\TrainingCourseController;
use App\Http\Controllers\API\Admin\TrainingEnrollmentController;
use App\Http\Controllers\API\Admin\TrainingCertificationController;
use App\Http\Controllers\API\Admin\LeadershipPipelineController;
use App\Http\Controllers\API\Admin\TrainingAnalyticsController;
use App\Http\Controllers\API\Admin\IntegrationConnectorController;
use App\Http\Controllers\API\Admin\AudienceSegmentController;
use App\Http\Controllers\API\Admin\OutreachCampaignController;
use App\Http\Controllers\API\Admin\OutreachDeliveryController;
use App\Http\Controllers\API\Admin\CommunicationGovernanceController;
use App\Http\Controllers\API\DonationPublicController;
use App\Http\Controllers\API\ElectionMemberController;
use App\Http\Controllers\API\EventMemberController;
use App\Http\Controllers\API\MembershipRenewalMemberController;
use App\Http\Controllers\API\TrainingMemberController;
use App\Http\Controllers\API\CommunicationPreferenceController;
use Illuminate\Support\Facades\Route;

// ── Public ─────────────────────────────────────────────────────────────────

Route::get('units/campus', [UnitController::class, 'index']);
Route::get('news', [NewsController::class, 'index']);
Route::get('news/{slug}', [NewsController::class, 'show']);
Route::get('members/search', [MemberController::class, 'search']);
Route::get('id-cards/verify/{member_id}', [IdCardController::class, 'verify'])
    ->where('member_id', '^(?!me$).+');

// Public member profile (by NDM member ID string, e.g. NDM-SW-2026-0001)
Route::get('members/{member_id}', [MemberController::class, 'publicProfile'])
    ->where('member_id', '^(?!me$).+');

Route::get('settings/public', [SystemSettingController::class, 'public']);

// Fundraising (Task 18)
Route::get('fundraising/campaigns', [DonationPublicController::class, 'campaigns']);
Route::post('fundraising/donations', [DonationPublicController::class, 'submitDonation']);

// ── Auth ────────────────────────────────────────────────────────────────────

Route::prefix('auth')->middleware('api')->group(function () {

    // Stricter rate limits on unauthenticated endpoints (5 attempts / min)
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login',    [AuthController::class, 'login']);
    });

    Route::middleware('auth:api')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me',       [AuthController::class, 'me']);
    });
});

// ── Authenticated Member —  own profile & ID card ───────────────────────────

Route::middleware(['auth:api', 'active.member', 'audit'])->group(function () {

    // Profile
    Route::get ('members/me',       [ProfileController::class, 'me']);
    Route::put ('members/me',       [ProfileController::class, 'update']);
    Route::post('members/me/photo', [ProfileController::class, 'uploadPhoto']);
    Route::get ('profile',       [ProfileController::class, 'show']);
    Route::put ('profile',       [ProfileController::class, 'update']);
    Route::put ('profile/password', [ProfileController::class, 'changePassword']);
    Route::get ('profile/activity', [ProfileController::class, 'activity']);
    Route::post('profile/photo', [ProfileController::class, 'uploadPhoto']);
    Route::delete('profile/photo', [ProfileController::class, 'removePhoto']);

    // Digital ID card
    Route::get('id-card',         [IdCardController::class, 'download']);
    Route::get('id-card/preview', [IdCardController::class, 'preview']);

    // Task assignments (member view)
    Route::get('tasks/my',                    [TaskController::class, 'myTasks']);
    Route::put('tasks/{taskId}/progress',     [TaskController::class, 'updateProgress']);

    // ── Elections (member-facing) ──────────────────────────────────────────
    // Task 165-167: browse elections, self-nominate, vote, view results
    Route::get ('elections',                                    [ElectionMemberController::class, 'index']);
    Route::get ('elections/{id}',                               [ElectionMemberController::class, 'show']);
    Route::get ('elections/{id}/results',                       [ElectionMemberController::class, 'results']);
    Route::post('elections/nominate',                           [ElectionMemberController::class, 'nominate']);
    Route::post('elections/{electionId}/withdraw-nomination',   [ElectionMemberController::class, 'withdrawNomination']);
    Route::post('elections/{electionId}/vote',                  [ElectionMemberController::class, 'vote']);

    // ── Events & Campaigns (member-facing) ───────────────────────────────
    Route::get ('events',                       [EventMemberController::class, 'index']);
    Route::get ('events/{id}',                  [EventMemberController::class, 'show']);
    Route::post('events/{id}/rsvp',             [EventMemberController::class, 'rsvp']);
    Route::post('events/{id}/attendance/check-in',  [EventMemberController::class, 'checkIn']);
    Route::post('events/{id}/attendance/check-out', [EventMemberController::class, 'checkOut']);

    // ── Membership Renewal & Re-verification (Task 19) ───────────────────
    Route::get ('membership/renewals',      [MembershipRenewalMemberController::class, 'index']);
    Route::post('membership/renewals',      [MembershipRenewalMemberController::class, 'submitRenewal']);
    Route::post('membership/reverification', [MembershipRenewalMemberController::class, 'submitReverification']);

    // ── Training & Cadre Development (Task 20) ───────────────────────────
    Route::get ('training/courses',                  [TrainingMemberController::class, 'courses']);
    Route::post('training/courses/{courseId}/enroll', [TrainingMemberController::class, 'enroll']);
    Route::get ('training/enrollments/me',           [TrainingMemberController::class, 'myEnrollments']);

    // ── Integration Hub & Mass Outreach (Task 21) ────────────────────────
    Route::post('communications/preferences/unsubscribe', [CommunicationPreferenceController::class, 'unsubscribe']);
});

// ── Admin ───────────────────────────────────────────────────────────────────

Route::prefix('admin')
    ->middleware(['auth:api', 'admin', 'audit'])
    ->group(function () {

        // Dashboard stats
        Route::get('dashboard/stats',    [AdminDashboardController::class, 'stats']);
        Route::get('dashboard/activity', [AdminDashboardController::class, 'recentActivity']);

        // Member management
        Route::get   ('members',              [AdminMemberController::class, 'index']);
        Route::post  ('members',              [AdminMemberController::class, 'store']);
        Route::get   ('members/pending',      [AdminMemberController::class, 'pending']);
        // Static/named routes MUST come before {id} wildcard
        Route::post  ('members/bulk-action',    [AdminMemberController::class, 'bulkAction']);
        Route::get   ('members/reports/summary',[AdminMemberController::class, 'reports']);
        Route::get   ('members/export/pdf',     [MemberExportController::class, 'pdf']);
        Route::get   ('members/export/csv',     [MemberExportController::class, 'csv']);
        Route::post  ('members/promote-role',   [AdminMemberController::class, 'promoteRole']);
        // Dynamic {id} wildcard routes
        Route::get   ('members/{id}',           [AdminMemberController::class, 'show']);
        Route::put   ('members/{id}',           [AdminMemberController::class, 'update']);
        Route::delete('members/{id}',           [AdminMemberController::class, 'destroy']);
        Route::post  ('members/{id}/approve',   [AdminMemberController::class, 'approve']);
        Route::post  ('members/{id}/reject',    [AdminMemberController::class, 'reject']);
        Route::post  ('members/{id}/suspend',   [AdminMemberController::class, 'suspend']);
        Route::post  ('members/{id}/expel',     [AdminMemberController::class, 'expel']);
        Route::get   ('members/{id}/documents', [AdminMemberController::class, 'documents']);
        Route::get   ('members/{id}/id-card',   [IdCardController::class, 'downloadByAdmin']);

        // Task management
        Route::get('tasks/summary', [TaskController::class, 'summary']);
        Route::apiResource('tasks', TaskController::class);

        // RBAC
        Route::get   ('roles',                          [RoleController::class, 'index']);
        Route::post  ('roles',                          [RoleController::class, 'store']);
        Route::get   ('roles/{id}',                     [RoleController::class, 'show']);
        Route::put   ('roles/{id}',                     [RoleController::class, 'update']);
        Route::delete('roles/{id}',                     [RoleController::class, 'destroy']);
        Route::patch ('roles/{id}/toggle',              [RoleController::class, 'toggle']);
        Route::post  ('roles/{id}/permissions',         [RoleController::class, 'syncPermissions']);
        Route::get   ('permissions',                    [RoleController::class, 'permissions']);


        // Organizational units
        Route::get   ('units',                          [OrganizationalUnitController::class, 'index']);
        Route::post  ('units',                          [OrganizationalUnitController::class, 'store']);
        Route::get   ('units/{id}',                     [OrganizationalUnitController::class, 'show']);
        Route::put   ('units/{id}',                     [OrganizationalUnitController::class, 'update']);
        Route::patch ('units/{id}/toggle',              [OrganizationalUnitController::class, 'toggle']);
        Route::delete('units/{id}',                     [OrganizationalUnitController::class, 'destroy']);

        // Positions (static /history route must come before the {id} wildcard)
        Route::get   ('positions/history',    [PositionController::class, 'history']);
        Route::get   ('positions',            [PositionController::class, 'index']);
        Route::post  ('positions',            [PositionController::class, 'store']);
        Route::post  ('positions/{id}/transfer', [PositionController::class, 'transfer']);
        Route::delete('positions/{id}',       [PositionController::class, 'destroy']);


        // Blog management
        Route::get   ('blog-posts',       [BlogPostController::class, 'index']);
        Route::post  ('blog-posts',       [BlogPostController::class, 'store']);
        Route::get   ('blog-posts/{id}',  [BlogPostController::class, 'show']);
        Route::put   ('blog-posts/{id}',  [BlogPostController::class, 'update']);
        Route::delete('blog-posts/{id}',  [BlogPostController::class, 'destroy']);

        // Committee Management
        Route::apiResource('committees',                      CommitteeController::class);
        Route::post  ('committees/{id}/members',              [CommitteeRoleController::class, 'store']);
        Route::put   ('committees/{id}/roles/{role_id}',      [CommitteeRoleController::class, 'update']);
        Route::delete('committees/{id}/roles/{role_id}',      [CommitteeRoleController::class, 'destroy']);

        // System Settings & Governance (Task 14)
        Route::get   ('settings',            [SystemSettingController::class, 'index']);
        Route::post  ('settings/bulk-update', [SystemSettingController::class, 'update']);

        // ── Election & Voting System (Tasks 165-169) ───────────────────────────

        // Task 165: election framework CRUD + lifecycle transitions
        Route::get   ('elections',                          [ElectionController::class, 'index']);
        Route::post  ('elections',                          [ElectionController::class, 'store']);
        Route::get   ('elections/{id}',                     [ElectionController::class, 'show']);
        Route::put   ('elections/{id}',                     [ElectionController::class, 'update']);
        Route::delete('elections/{id}',                     [ElectionController::class, 'destroy']);
        Route::post  ('elections/{id}/transition',          [ElectionController::class, 'transition']);

        // Task 166: nomination workflow (admin review)
        Route::get   ('elections/{electionId}/nominations',                         [ElectionNominationAdminController::class, 'index']);
        Route::get   ('elections/{electionId}/nominations/{nominationId}',          [ElectionNominationAdminController::class, 'show']);
        Route::post  ('elections/{electionId}/nominations/{nominationId}/approve',  [ElectionNominationAdminController::class, 'approve']);
        Route::post  ('elections/{electionId}/nominations/{nominationId}/reject',   [ElectionNominationAdminController::class, 'reject']);
        Route::patch ('elections/{electionId}/nominations/{nominationId}/publish',  [ElectionNominationAdminController::class, 'togglePublish']);

        // Task 168: result generation
        Route::get   ('elections/{electionId}/results',             [ElectionResultController::class, 'index']);
        Route::post  ('elections/{electionId}/results/tally',       [ElectionResultController::class, 'tally']);
        Route::post  ('elections/{electionId}/results/declare-winners', [ElectionResultController::class, 'declareWinners']);
        Route::post  ('elections/{electionId}/results/publish',     [ElectionResultController::class, 'publish']);
        Route::get   ('elections/{electionId}/results/report',      [ElectionResultController::class, 'report']);

        // Task 169: election analytics
        Route::get   ('elections/{electionId}/analytics/summary',               [ElectionAnalyticsController::class, 'summary']);
        Route::get   ('elections/{electionId}/analytics/unit-participation',    [ElectionAnalyticsController::class, 'unitParticipation']);
        Route::get   ('elections/{electionId}/analytics/candidate-performance', [ElectionAnalyticsController::class, 'candidatePerformance']);
        Route::get   ('elections/analytics/cycle-comparison',                   [ElectionAnalyticsController::class, 'cycleComparison']);

        // ── Event & Campaign Management (Tasks 170-174) ───────────────────
        Route::get   ('events',                                 [EventManagementController::class, 'index']);
        Route::post  ('events',                                 [EventManagementController::class, 'store']);
        Route::get   ('events/{id}',                            [EventManagementController::class, 'show']);
        Route::put   ('events/{id}',                            [EventManagementController::class, 'update']);
        Route::post  ('events/{id}/approve',                    [EventManagementController::class, 'approve']);
        Route::get   ('events/{id}/attendance-summary',         [EventManagementController::class, 'attendanceSummary']);
        Route::post  ('events/{id}/report',                     [EventManagementController::class, 'upsertReport']);

        Route::get   ('campaigns',                              [CampaignManagementController::class, 'index']);
        Route::post  ('campaigns',                              [CampaignManagementController::class, 'store']);
        Route::get   ('campaigns/{id}',                         [CampaignManagementController::class, 'show']);
        Route::put   ('campaigns/{id}',                         [CampaignManagementController::class, 'update']);
        Route::post  ('campaigns/{id}/tasks',                   [CampaignManagementController::class, 'assignTask']);

        // ── Fundraising & Donation Tracking (Task 18) ───────────────────
        Route::get   ('fundraising/stats',            [DonationController::class, 'stats']);
        Route::apiResource('fundraising/campaigns',   DonationCampaignController::class);
        Route::apiResource('fundraising/donations',   DonationController::class);
        Route::post  ('fundraising/donations/{id}/verify', [DonationController::class, 'verify']);
        Route::post  ('fundraising/donations/{id}/reject', [DonationController::class, 'reject']);

        // ── Membership Renewal & Re-verification (Task 19) ───────────────
        Route::get ('membership/renewals',                                [MembershipRenewalAdminController::class, 'renewalsIndex']);
        Route::post('membership/renewals/{renewal}/approve',              [MembershipRenewalAdminController::class, 'renewalsApprove']);
        Route::post('membership/renewals/{renewal}/reject',               [MembershipRenewalAdminController::class, 'renewalsReject']);
        Route::get ('membership/reverification',                           [MembershipRenewalAdminController::class, 'reverificationIndex']);
        Route::post('membership/reverification/{reverification}/approve',  [MembershipRenewalAdminController::class, 'reverificationApprove']);
        Route::post('membership/reverification/{reverification}/reject',   [MembershipRenewalAdminController::class, 'reverificationReject']);
        Route::get ('membership/reminders',                               [MembershipRenewalAdminController::class, 'reminders']);
        Route::post('membership/reminders/queue',                         [MembershipRenewalAdminController::class, 'queueReminders']);
        Route::post('membership/process-expiry',                          [MembershipRenewalAdminController::class, 'processExpiry']);
        Route::get ('membership/reports/retention',                       [MembershipRenewalAdminController::class, 'retentionReport']);

        // ── Training & Cadre Development (Task 20) ───────────────────────
        Route::get   ('training/courses',                     [TrainingCourseController::class, 'index']);
        Route::post  ('training/courses',                     [TrainingCourseController::class, 'store']);
        Route::get   ('training/courses/{id}',                [TrainingCourseController::class, 'show']);
        Route::put   ('training/courses/{id}',                [TrainingCourseController::class, 'update']);
        Route::delete('training/courses/{id}',                [TrainingCourseController::class, 'destroy']);

        Route::get   ('training/enrollments',                 [TrainingEnrollmentController::class, 'index']);
        Route::post  ('training/enrollments',                 [TrainingEnrollmentController::class, 'store']);
        Route::put   ('training/enrollments/{id}',            [TrainingEnrollmentController::class, 'update']);

        Route::post  ('training/enrollments/{enrollmentId}/certificate/issue', [TrainingCertificationController::class, 'issue']);
        Route::post  ('training/certificates/{certificateId}/revoke',           [TrainingCertificationController::class, 'revoke']);
        Route::get   ('training/certificates/verify/{verificationId}',          [TrainingCertificationController::class, 'verify']);

        Route::get   ('training/leadership-pipeline',         [LeadershipPipelineController::class, 'index']);
        Route::post  ('training/leadership-pipeline',         [LeadershipPipelineController::class, 'store']);
        Route::put   ('training/leadership-pipeline/{id}',    [LeadershipPipelineController::class, 'update']);

        Route::get   ('training/analytics/summary',           [TrainingAnalyticsController::class, 'summary']);

        // ── Integration Hub & Mass Outreach Campaigns (Task 21) ──────────
        Route::get   ('integration/connectors',                    [IntegrationConnectorController::class, 'index']);
        Route::post  ('integration/connectors',                    [IntegrationConnectorController::class, 'store']);
        Route::put   ('integration/connectors/{id}',               [IntegrationConnectorController::class, 'update']);
        Route::post  ('integration/connectors/{id}/health-check',  [IntegrationConnectorController::class, 'healthCheck']);

        Route::get   ('integration/segments',                      [AudienceSegmentController::class, 'index']);
        Route::post  ('integration/segments',                      [AudienceSegmentController::class, 'store']);
        Route::put   ('integration/segments/{id}',                 [AudienceSegmentController::class, 'update']);
        Route::get   ('integration/segments/{id}/preview-count',   [AudienceSegmentController::class, 'previewCount']);

        Route::get   ('integration/campaigns',                     [OutreachCampaignController::class, 'index']);
        Route::post  ('integration/campaigns',                     [OutreachCampaignController::class, 'store']);
        Route::get   ('integration/campaigns/{id}',                [OutreachCampaignController::class, 'show']);
        Route::put   ('integration/campaigns/{id}',                [OutreachCampaignController::class, 'update']);
        Route::post  ('integration/campaigns/{id}/approve',        [OutreachCampaignController::class, 'approve']);
        Route::post  ('integration/campaigns/{id}/schedule',       [OutreachCampaignController::class, 'schedule']);
        Route::post  ('integration/campaigns/{id}/send-now',       [OutreachCampaignController::class, 'sendNow']);

        Route::get   ('integration/delivery/logs',                 [OutreachDeliveryController::class, 'logs']);
        Route::post  ('integration/delivery/retry',                [OutreachDeliveryController::class, 'retry']);
        Route::get   ('integration/delivery/retry-queue',          [OutreachDeliveryController::class, 'retryQueue']);

        Route::get   ('integration/governance/consent-report',     [CommunicationGovernanceController::class, 'consentReport']);
        Route::get   ('integration/governance/audit-trail',        [CommunicationGovernanceController::class, 'auditTrail']);
        Route::post  ('integration/governance/campaigns/{campaignId}/moderate', [CommunicationGovernanceController::class, 'moderation']);
    });
