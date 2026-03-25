# NDM System - API Routes, Middleware & RBAC Implementation

## Complete Route & Middleware Configuration

---

## 1. API Routes

```php
<?php
// routes/api.php

use App\Http\Controllers\Api\{
    AuthController,
    MemberController,
    PositionController,
    RoleController,
    OrganizationalUnitController,
    CommitteeController,
    PermissionController,
    ReportController,
    AuditController,
};
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
| Prefix: /api/v1
| Middleware: api, throttle:60,1
*/

Route::prefix('v1')->group(function () {

    // ==================== AUTHENTICATION ====================
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    // Protected routes (require JWT authentication)
    Route::middleware('auth:api')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

        // ==================== MEMBERS ====================
        Route::prefix('members')->group(function () {
            // List & Search
            Route::get('/', [MemberController::class, 'index']);
            Route::get('/{id}', [MemberController::class, 'show']);
            Route::get('/{id}/positions', [MemberController::class, 'positions']);

            // Management (requires permission)
            Route::middleware('permission:manage.members')->group(function () {
                Route::post('/', [MemberController::class, 'store']);
                Route::put('/{id}', [MemberController::class, 'update']);
                Route::delete('/{id}', [MemberController::class, 'destroy']);
                Route::post('/{id}/approve', [MemberController::class, 'approve']);
                Route::post('/{id}/suspend', [MemberController::class, 'suspend']);
                Route::post('/{id}/expel', [MemberController::class, 'expel']);
            });
        });

        // ==================== POSITIONS (ROLES ASSIGNMENT) ====================
        Route::prefix('positions')->middleware('permission:manage.positions')->group(function () {
            // Assign/Relieve/Transfer
            Route::post('/assign', [PositionController::class, 'assign']);
            Route::post('/{id}/relieve', [PositionController::class, 'relieve']);
            Route::post('/{id}/transfer', [PositionController::class, 'transfer']);

            // Query
            Route::get('/current', [PositionController::class, 'current']);
            Route::get('/history', [PositionController::class, 'history']);
            Route::get('/{id}/history', [PositionController::class, 'positionHistory']);
        });

        // ==================== POLITICAL ROLES ====================
        Route::prefix('roles')->group(function () {
            // View
            Route::get('/', [RoleController::class, 'index']);
            Route::get('/{id}', [RoleController::class, 'show']);
            Route::get('/{id}/holders', [RoleController::class, 'holders']);
            Route::get('/{id}/vacancy', [RoleController::class, 'vacancy']);

            // Manage (requires permission)
            Route::middleware('permission:manage.roles')->group(function () {
                Route::post('/', [RoleController::class, 'store']);
                Route::put('/{id}', [RoleController::class, 'update']);
                Route::delete('/{id}', [RoleController::class, 'destroy']);
            });
        });

        // ==================== ORGANIZATIONAL UNITS ====================
        Route::prefix('units')->group(function () {
            // View hierarchy
            Route::get('/', [OrganizationalUnitController::class, 'index']);
            Route::get('/{id}', [OrganizationalUnitController::class, 'show']);
            Route::get('/{id}/members', [OrganizationalUnitController::class, 'members']);
            Route::get('/{id}/positions', [OrganizationalUnitController::class, 'positions']);
            Route::get('/{id}/hierarchy', [OrganizationalUnitController::class, 'hierarchy']);

            // Manage (requires permission)
            Route::middleware('permission:manage.units')->group(function () {
                Route::post('/', [OrganizationalUnitController::class, 'store']);
                Route::put('/{id}', [OrganizationalUnitController::class, 'update']);
                Route::delete('/{id}', [OrganizationalUnitController::class, 'destroy']);
            });
        });

        // ==================== COMMITTEES ====================
        Route::prefix('committees')->group(function () {
            Route::get('/', [CommitteeController::class, 'index']);
            Route::get('/{id}', [CommitteeController::class, 'show']);
            Route::get('/{id}/members', [CommitteeController::class, 'members']);
            Route::get('/{id}/roles', [CommitteeController::class, 'roles']);

            Route::middleware('permission:manage.committees')->group(function () {
                Route::post('/', [CommitteeController::class, 'store']);
                Route::put('/{id}', [CommitteeController::class, 'update']);
                Route::post('/{id}/assign-member', [CommitteeController::class, 'assignMember']);
                Route::post('/{id}/remove-member', [CommitteeController::class, 'removeMember']);
            });
        });

        // ==================== PERMISSIONS & RBAC ====================
        Route::prefix('permissions')->middleware('permission:manage.roles')->group(function () {
            Route::get('/roles', [PermissionController::class, 'listRoles']);
            Route::get('/permissions', [PermissionController::class, 'listPermissions']);
            Route::post('/assign-to-role', [PermissionController::class, 'assignToRole']);
            Route::post('/revoke-from-role', [PermissionController::class, 'revokeFromRole']);
        });

        // ==================== REPORTS & ANALYTICS ====================
        Route::prefix('reports')->middleware('permission:view.reports')->group(function () {
            Route::get('/organization-tree', [ReportController::class, 'organizationTree']);
            Route::get('/role-assignment/{roleId}', [ReportController::class, 'roleAssignment']);
            Route::get('/member-statistics', [ReportController::class, 'memberStatistics']);
            Route::get('/unit-statistics/{unitId}', [ReportController::class, 'unitStatistics']);
            Route::get('/vacancy-status', [ReportController::class, 'vacancyStatus']);
        });

        // ==================== AUDIT LOGS ====================
        Route::prefix('audit')->middleware('permission:view.reports')->group(function () {
            Route::get('/logs', [AuditController::class, 'logs']);
            Route::get('/member-activities/{memberId}', [AuditController::class, 'memberActivities']);
            Route::get('/position-changes', [AuditController::class, 'positionChanges']);
        });
    });

    // ==================== PUBLIC ENDPOINTS ====================
    Route::get('/health', function () {
        return response()->json(['status' => 'ok', 'timestamp' => now()]);
    });
});
```

---

## 2. Authentication Middleware

```php
<?php
// app/Http/Middleware/AuthenticateApi.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthenticateApi
{
    /**
     * Verify JWT Token and set authenticated user
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            if (!$token = $this->getToken($request)) {
                return response()->json([
                    'error' => true,
                    'message' => 'Token not provided',
                    'status_code' => 401,
                ], 401);
            }

            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return response()->json([
                    'error' => true,
                    'message' => 'User not found',
                    'status_code' => 401,
                ], 401);
            }

            Auth::setUser($user);

            // Verify user is active
            if (!$user->is_active) {
                return response()->json([
                    'error' => true,
                    'message' => 'User account is inactive',
                    'status_code' => 403,
                ], 403);
            }

        } catch (JWTException $e) {
            return response()->json([
                'error' => true,
                'message' => 'Token validation failed',
                'details' => $e->getMessage(),
                'status_code' => 401,
            ], 401);
        }

        return $next($request);
    }

    /**
     * Get token from request
     */
    protected function getToken(Request $request): ?string
    {
        return $request->bearerToken();
    }
}
```

---

## 3. Permission Middleware (Spatie)

```php
<?php
// app/Http/Middleware/CheckPermission.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    /**
     * Check if user has required permission
     */
    public function handle(Request $request, Closure $next, ...$permissions)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'error' => true,
                'message' => 'Unauthenticated',
                'status_code' => 401,
            ], 401);
        }

        // Check if user has any of the required permissions
        foreach ($permissions as $permission) {
            if ($user->hasPermissionTo($permission)) {
                return $next($request);
            }
        }

        return response()->json([
            'error' => true,
            'message' => 'Forbidden - Insufficient permissions',
            'required_permissions' => $permissions,
            'status_code' => 403,
        ], 403);
    }
}
```

---

## 4. Role Middleware

```php
<?php
// app/Http/Middleware/CheckRole.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    /**
     * Check if user has required role
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'error' => true,
                'message' => 'Unauthenticated',
                'status_code' => 401,
            ], 401);
        }

        // Check system roles (admin, moderator, member)
        if ($user->hasRole($roles)) {
            return $next($request);
        }

        return response()->json([
            'error' => true,
            'message' => 'Forbidden - Insufficient role',
            'required_roles' => $roles,
            'status_code' => 403,
        ], 403);
    }
}
```

---

## 5. Rate Limiting Configuration

```php
<?php
// app/Providers/RouteServiceProvider.php - configure rate limiting

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)
        ->by($request->user()?->id ?: $request->ip());
});

// Strict rate limit for sensitive endpoints
RateLimiter::for('sensitive', function (Request $request) {
    return Limit::perMinute(5)
        ->by($request->user()?->id ?: $request->ip());
});

// Very strict for auth endpoints
RateLimiter::for('auth', function (Request $request) {
    return Limit::perMinute(5)
        ->by($request->input('email', $request->ip()));
});
```

---

## 6. CORS Configuration

```php
<?php
// config/cors.php

return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('APP_URL'),
        env('FRONTEND_URL', 'http://localhost:5174'),
    ],

    'allowed_origins_patterns' => [
        '/localhost:[0-9]+/',
        '/.+\.ndm\.org\.bd$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Authorization',
        'Content-Type',
        'X-Total-Count',
        'X-Total-Pages',
    ],

    'max_age' => 0,

    'supports_credentials' => true,
];
```

---

## 7. Register Middleware in Kernel

```php
<?php
// app/Http/Kernel.php

protected $routeMiddleware = [
    // Laravel
    'auth' => \App\Http\Middleware\Authenticate::class,
    'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
    'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
    'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
    'can' => \Illuminate\Auth\Middleware\Authorize::class,
    'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
    'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,

    // Custom API Middleware
    'auth:api' => \App\Http\Middleware\AuthenticateApi::class,
    'permission' => \App\Http\Middleware\CheckPermission::class,
    'role' => \App\Http\Middleware\CheckRole::class,
    'cors' => \Fruitcake\Cors\HandleCors::class,
];

protected $middlewareGroups = [
    'api' => [
        \Fruitcake\Cors\HandleCors::class,
        'throttle:60,1',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];
```

---

## 8. Enums for Type Safety

```php
<?php
// app/Enums/UnitType.php

namespace App\Enums;

enum UnitType: string
{
    case CENTRAL = 'CENTRAL';
    case DIVISION = 'DIVISION';
    case DISTRICT = 'DISTRICT';
    case UPAZILA = 'UPAZILA';
    case UNION = 'UNION';
    case CAMPUS = 'CAMPUS';

    public function label(): string
    {
        return match($this) {
            self::CENTRAL => 'Central Committee',
            self::DIVISION => 'Division Committee',
            self::DISTRICT => 'District Committee',
            self::UPAZILA => 'Upazila Committee',
            self::UNION => 'Union/Ward Committee',
            self::CAMPUS => 'Campus Committee',
        };
    }

    public function hierarchy_level(): int
    {
        return match($this) {
            self::CENTRAL => 1,
            self::DIVISION => 2,
            self::DISTRICT => 3,
            self::UPAZILA => 4,
            self::UNION => 5,
            self::CAMPUS => 5,
        };
    }
}
```

```php
<?php
// app/Enums/MemberStatus.php

namespace App\Enums;

enum MemberStatus: string
{
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case EXPELLED = 'expelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending Approval',
            self::ACTIVE => 'Active Member',
            self::SUSPENDED => 'Suspended',
            self::EXPELLED => 'Expelled',
        };
    }

    public function canLogin(): bool
    {
        return $this === self::ACTIVE;
    }

    public function canHoldPosition(): bool
    {
        return $this === self::ACTIVE;
    }
}
```

---

## 9. Exception Handling

```php
<?php
// app/Exceptions/RoleAssignmentException.php

namespace App\Exceptions;

use Exception;

class RoleAssignmentException extends Exception
{
    public function render()
    {
        return response()->json([
            'error' => true,
            'message' => 'Role Assignment Failed',
            'details' => $this->message,
            'status_code' => 422,
        ], 422);
    }
}
```

```php
<?php
// app/Exceptions/Handler.php - exception handling

public function register()
{
    $this->reportable(function (Throwable $e) {
        if (app()->bound('sentry')) {
            app('sentry')->captureException($e);
        }
    });

    $this->renderable(function (Exception $e, $request) {
        if ($request->is('api/*')) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage() ?: 'Internal Server Error',
                'status_code' => $e->getCode() ?: 500,
            ], $e->getCode() ?: 500);
        }
    });
}
```

---

## 10. Spatie Permission Configuration

```php
<?php
// config/permission.php (after config:publish spatie/laravel-permission)

return [
    'models' => [
        'permission' => App\Models\Permission::class,
        'role' => App\Models\Role::class,
    ],

    'table_names' => [
        'roles' => 'roles',
        'permissions' => 'permissions',
        'model_has_permissions' => 'model_has_permissions',
        'model_has_roles' => 'model_has_roles',
        'role_has_permissions' => 'role_has_permissions',
    ],

    'column_names' => [
        'model_morph_key' => 'model_id',
    ],

    'register_permission_check_method' => true,
    'register_role_check_method' => true,

    'cache' => [
        'expiration_time' => 86400, // 24 hours
        'key' => 'spatie.permission.cache',
    ],

    'display_permission_in_exception' => false,
    'display_role_in_exception' => false,
    'strict_mode' => false,
];
```

---

**Document Status:** Complete  
**Version:** 1.0.0  
**Last Updated:** March 2026
