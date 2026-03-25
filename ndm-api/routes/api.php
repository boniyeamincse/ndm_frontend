<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\IdCardController;
use App\Http\Controllers\API\MemberController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\UnitController;
use App\Http\Controllers\API\Admin\AdminDashboardController;
use App\Http\Controllers\API\Admin\AdminMemberController;
use App\Http\Controllers\API\Admin\TaskController;
use App\Http\Controllers\API\Admin\RoleController;
use Illuminate\Support\Facades\Route;

// ── Public ─────────────────────────────────────────────────────────────────

Route::get('units/campus', [UnitController::class, 'index']);

// Public member profile (by NDM member ID string, e.g. NDM-SW-2026-0001)
Route::get('members/{member_id}', [MemberController::class, 'publicProfile']);

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
    Route::get ('profile',       [ProfileController::class, 'me']);
    Route::put ('profile',       [ProfileController::class, 'update']);
    Route::post('profile/photo', [ProfileController::class, 'uploadPhoto']);

    // Digital ID card
    Route::get('id-card',         [IdCardController::class, 'download']);
    Route::get('id-card/preview', [IdCardController::class, 'preview']);

    // Task assignments (member view)
    Route::get('tasks/my',                    [TaskController::class, 'myTasks']);
    Route::put('tasks/{taskId}/progress',     [TaskController::class, 'updateProgress']);
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
        Route::get   ('members/pending',      [AdminMemberController::class, 'pending']);
        Route::get   ('members/{id}',         [AdminMemberController::class, 'show']);
        Route::put   ('members/{id}',         [AdminMemberController::class, 'update']);
        Route::delete('members/{id}',         [AdminMemberController::class, 'destroy']);
        Route::post  ('members/{id}/approve', [AdminMemberController::class, 'approve']);
        Route::post  ('members/{id}/reject',  [AdminMemberController::class, 'reject']);
        Route::post  ('members/{id}/suspend', [AdminMemberController::class, 'suspend']);
        Route::post  ('members/{id}/expel',   [AdminMemberController::class, 'expel']);
        Route::post  ('members/promote-role', [AdminMemberController::class, 'promoteRole']);
        Route::get   ('members/{id}/documents', [AdminMemberController::class, 'documents']);

        // ID card (admin can download any)
        Route::get('members/{id}/id-card', [IdCardController::class, 'downloadByAdmin']);

        // Task management
        Route::apiResource('tasks', TaskController::class);

        // RBAC
        Route::get   ('roles',                          [RoleController::class, 'index']);
        Route::post  ('roles',                          [RoleController::class, 'store']);
        Route::get   ('roles/{id}',                     [RoleController::class, 'show']);
        Route::put   ('roles/{id}',                     [RoleController::class, 'update']);
        Route::delete('roles/{id}',                     [RoleController::class, 'destroy']);
        Route::post  ('roles/{id}/permissions',         [RoleController::class, 'syncPermissions']);
        Route::get   ('permissions',                    [RoleController::class, 'permissions']);
    });
