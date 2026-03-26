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
use App\Http\Controllers\API\ElectionMemberController;
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
    });
