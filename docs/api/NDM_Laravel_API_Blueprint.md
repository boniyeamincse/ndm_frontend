# NDM Student Wing Management System
## Laravel 11 REST API — Complete Blueprint

> **Nationalist Democratic Movement (NDM) Bangladesh — Student Wing**
> Laravel 11 · PHP 8.2+ · MySQL 8 · JWT Auth · REST API

---

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Project File Structure](#2-project-file-structure)
3. [Database Schema — All Tables](#3-database-schema--all-tables)
4. [Migrations](#4-migrations)
5. [Enums](#5-enums)
6. [Models](#6-models)
7. [API Resources](#7-api-resources)
8. [Form Requests (Validation)](#8-form-requests-validation)
9. [Services](#9-services)
10. [Controllers — Auth](#10-controllers--auth)
11. [Controllers — Member](#11-controllers--member)
12. [Controllers — Admin Member](#12-controllers--admin-member)
13. [Controllers — Admin Role](#13-controllers--admin-role)
14. [Controllers — Admin Position](#14-controllers--admin-position)
15. [Controllers — Admin Unit](#15-controllers--admin-unit)
16. [Controllers — Public Directory](#16-controllers--public-directory)
17. [Middleware](#17-middleware)
18. [Routes — api.php](#18-routes--apiphp)
19. [API Endpoints Reference](#19-api-endpoints-reference)
20. [Request & Response Examples](#20-request--response-examples)
21. [Business Rules](#21-business-rules)
22. [Environment & Deployment](#22-environment--deployment)
23. [Seeders](#23-seeders)
24. [Testing](#24-testing)

---

## 1. Project Overview & Architecture

### 1.1 Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Laravel 11 | API mode, no Blade views |
| Language | PHP 8.2+ | Typed properties, enums |
| Database | MySQL 8.0 | InnoDB, UTF-8mb4 |
| Authentication | tymon/jwt-auth v2 | Stateless JWT |
| File Storage | Laravel Storage | Profile photo uploads |
| Validation | Form Requests | Reusable request classes |
| API Response | API Resources | Consistent JSON output |
| Testing | Pest PHP | Feature + unit tests |

### 1.2 Organizational Hierarchy (7 Levels)

```
Central Committee (National)
  └── Division Committee        (e.g. Dhaka Division)
        └── District Committee  (64 districts)
              └── Upazila Committee
                    └── Union Committee
                          └── Ward Committee
                                └── Campus / Institution Committee
```

### 1.3 Member Workflow

```
[Public Registration]
        │
        ▼
[status = pending] ──► No login, no position
        │
   Admin Reviews
        │
   ┌────┴────┐
Reject     Approve
        │
        ▼
[status = active] ◄── Member ID Generated: 20261, 20262...
        │
        ▼
[Member logs in, uploads photo, completes profile]
        │
        ▼
[Admin assigns position: role + unit]
        │
        ▼
[Member appears in public directory with position badge]
```

### 1.4 Member ID Format

```
Year + Sequence  →  20261 (year 2026, first member)
                    20262 (year 2026, second member)
                    20271 (year 2027, first member)
```

---

## 2. Project File Structure

```
ndm-student-wing-api/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       └── GenerateMemberIdCommand.php
│   ├── Enums/
│   │   ├── MemberStatus.php
│   │   ├── UnitType.php
│   │   ├── Gender.php
│   │   └── PositionAction.php
│   ├── Exceptions/
│   │   └── Handler.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── API/
│   │   │       ├── AuthController.php
│   │   │       ├── MemberController.php
│   │   │       ├── ProfileController.php
│   │   │       ├── Admin/
│   │   │       │   ├── AdminMemberController.php
│   │   │       │   ├── RoleController.php
│   │   │       │   ├── PositionController.php
│   │   │       │   └── OrganizationalUnitController.php
│   │   │       └── Public/
│   │   │           └── DirectoryController.php
│   │   ├── Middleware/
│   │   │   ├── AdminMiddleware.php
│   │   │   └── ActiveMemberMiddleware.php
│   │   └── Requests/
│   │       ├── RegisterRequest.php
│   │       ├── LoginRequest.php
│   │       ├── UpdateProfileRequest.php
│   │       ├── CreateRoleRequest.php
│   │       ├── UpdateRoleRequest.php
│   │       ├── PromotePositionRequest.php
│   │       ├── RelievePositionRequest.php
│   │       ├── TransferPositionRequest.php
│   │       └── CreateUnitRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Member.php
│   │   ├── Role.php
│   │   ├── OrganizationalUnit.php
│   │   ├── MemberPosition.php
│   │   └── PositionHistory.php
│   ├── Resources/
│   │   ├── MemberResource.php
│   │   ├── MemberPublicResource.php
│   │   ├── MemberListResource.php
│   │   ├── PositionResource.php
│   │   ├── RoleResource.php
│   │   └── UnitResource.php
│   └── Services/
│       ├── MemberIdService.php
│       ├── MemberService.php
│       ├── PositionService.php
│       └── PhotoService.php
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000000_create_users_table.php
│   │   ├── 2024_01_02_000000_create_member_id_sequences_table.php
│   │   ├── 2024_01_03_000000_create_organizational_units_table.php
│   │   ├── 2024_01_04_000000_create_roles_table.php
│   │   ├── 2024_01_05_000000_create_members_table.php
│   │   ├── 2024_01_06_000000_create_member_positions_table.php
│   │   └── 2024_01_07_000000_create_position_history_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── AdminSeeder.php
│       ├── RoleSeeder.php
│       └── OrganizationalUnitSeeder.php
├── routes/
│   └── api.php
├── storage/
│   └── app/public/photos/
├── tests/
│   ├── Feature/
│   │   ├── AuthTest.php
│   │   ├── MemberTest.php
│   │   ├── AdminMemberTest.php
│   │   ├── RoleTest.php
│   │   ├── PositionTest.php
│   │   └── DirectoryTest.php
│   └── Unit/
│       ├── MemberIdServiceTest.php
│       └── PositionServiceTest.php
├── .env
├── .env.example
├── composer.json
└── README.md
```

---

## 3. Database Schema — All Tables

### 3.1 `users`
| Column | Type | Null | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED PK | NO | Auto-increment |
| email | VARCHAR(191) UNIQUE | NO | Login email |
| password | VARCHAR(255) | NO | bcrypt hashed |
| user_type | ENUM('admin','member') | NO | Default: member |
| is_active | TINYINT(1) | NO | Default: 1 |
| email_verified_at | TIMESTAMP | YES | Email verification |
| remember_token | VARCHAR(100) | YES | Laravel token |
| created_at | TIMESTAMP | YES | — |
| updated_at | TIMESTAMP | YES | — |

### 3.2 `member_id_sequences`
| Column | Type | Null | Description |
|---|---|---|---|
| year | YEAR PK | NO | e.g. 2026 |
| last_seq | INT UNSIGNED | NO | Last used sequence. Default: 0 |

### 3.3 `organizational_units`
| Column | Type | Null | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED PK | NO | Auto-increment |
| name | VARCHAR(191) | NO | e.g. "Dhaka Division" |
| type | ENUM('central','division','district','upazila','union','ward','campus') | NO | Unit level |
| parent_id | BIGINT UNSIGNED FK | YES | Self-referencing. NULL for central |
| code | VARCHAR(20) UNIQUE | YES | e.g. "DHA-DIV" |
| description | TEXT | YES | Optional notes |
| is_active | TINYINT(1) | NO | Default: 1 |
| created_at | TIMESTAMP | YES | — |
| updated_at | TIMESTAMP | YES | — |

### 3.4 `roles`
| Column | Type | Null | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED PK | NO | Auto-increment |
| title | VARCHAR(191) | NO | e.g. "Campus President" |
| unit_type | ENUM('central','division','district','upazila','union','ward','campus') | NO | Role scoped to this unit type |
| rank_order | INT UNSIGNED | NO | 1 = highest. Default: 100 |
| description | TEXT | YES | Optional |
| is_active | TINYINT(1) | NO | Default: 1 |
| created_by | BIGINT UNSIGNED FK | NO | Admin user id |
| created_at | TIMESTAMP | YES | — |
| updated_at | TIMESTAMP | YES | — |

### 3.5 `members`
| Column | Type | Null | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED PK | NO | Auto-increment |
| user_id | BIGINT UNSIGNED FK UNIQUE | NO | References users(id). CASCADE |
| member_id | VARCHAR(20) UNIQUE | NO | Year-sequential e.g. "20261" |
| full_name | VARCHAR(191) | NO | Full name |
| father_name | VARCHAR(191) | YES | Father's name |
| mother_name | VARCHAR(191) | YES | Mother's name |
| date_of_birth | DATE | YES | DOB |
| gender | ENUM('male','female','other') | YES | — |
| nid_or_bc | VARCHAR(50) | YES | NID or birth certificate |
| blood_group | VARCHAR(5) | YES | e.g. A+, O- |
| phone | VARCHAR(20) | YES | Mobile number |
| email | VARCHAR(191) | YES | Personal email |
| present_address | TEXT | YES | Current address |
| permanent_address | TEXT | YES | Permanent address |
| institution | VARCHAR(255) | YES | School/college/university |
| department | VARCHAR(191) | YES | Faculty/department |
| session | VARCHAR(20) | YES | e.g. "2023-24" |
| photo_path | VARCHAR(255) | YES | Storage path |
| status | ENUM('pending','active','suspended','expelled') | NO | Default: pending |
| approved_by | BIGINT UNSIGNED FK | YES | Admin who approved |
| approved_at | TIMESTAMP | YES | Approval time |
| join_year | YEAR | NO | Registration year |
| organizational_unit_id | BIGINT UNSIGNED FK | YES | Primary unit |
| created_at | TIMESTAMP | YES | — |
| updated_at | TIMESTAMP | YES | — |

### 3.6 `member_positions`
| Column | Type | Null | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED PK | NO | Auto-increment |
| member_id | BIGINT UNSIGNED FK | NO | References members(id) |
| role_id | BIGINT UNSIGNED FK | NO | References roles(id) |
| unit_id | BIGINT UNSIGNED FK | NO | References organizational_units(id) |
| assigned_by | BIGINT UNSIGNED FK | NO | Admin user id |
| assigned_at | TIMESTAMP | NO | When assigned |
| relieved_at | TIMESTAMP | YES | NULL if still active |
| is_active | TINYINT(1) | NO | Default: 1 |
| notes | TEXT | YES | Admin notes |
| UNIQUE KEY | (role_id, unit_id, is_active) | — | One person per role per unit |

### 3.7 `position_history`
| Column | Type | Null | Description |
|---|---|---|---|
| id | BIGINT UNSIGNED PK | NO | Auto-increment |
| member_id | BIGINT UNSIGNED FK | NO | Member involved |
| role_id | BIGINT UNSIGNED FK | NO | Role involved |
| unit_id | BIGINT UNSIGNED FK | NO | Unit involved |
| action | ENUM('assigned','relieved','transferred') | NO | Type of action |
| performed_by | BIGINT UNSIGNED FK | NO | Admin who acted |
| performed_at | TIMESTAMP | NO | Action timestamp |
| remarks | TEXT | YES | Admin notes |

---

## 4. Migrations

### `create_member_id_sequences_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('member_id_sequences', function (Blueprint $table) {
            $table->year('year')->primary();
            $table->unsignedInteger('last_seq')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_id_sequences');
    }
};
```

### `create_organizational_units_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('organizational_units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['central','division','district','upazila','union','ward','campus']);
            $table->foreignId('parent_id')->nullable()->constrained('organizational_units')->nullOnDelete();
            $table->string('code', 20)->unique()->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizational_units');
    }
};
```

### `create_roles_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('unit_type', ['central','division','district','upazila','union','ward','campus']);
            $table->unsignedInteger('rank_order')->default(100);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
```

### `create_members_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('member_id', 20)->unique();
            $table->string('full_name');
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male','female','other'])->nullable();
            $table->string('nid_or_bc', 50)->nullable();
            $table->string('blood_group', 5)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('present_address')->nullable();
            $table->text('permanent_address')->nullable();
            $table->string('institution')->nullable();
            $table->string('department')->nullable();
            $table->string('session', 20)->nullable();
            $table->string('photo_path')->nullable();
            $table->enum('status', ['pending','active','suspended','expelled'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->year('join_year');
            $table->foreignId('organizational_unit_id')->nullable()->constrained('organizational_units')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
```

### `create_member_positions_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('member_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained();
            $table->foreignId('unit_id')->constrained('organizational_units');
            $table->foreignId('assigned_by')->constrained('users');
            $table->timestamp('assigned_at');
            $table->timestamp('relieved_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            // One person per role per unit at a time
            $table->unique(['role_id', 'unit_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_positions');
    }
};
```

### `create_position_history_table.php`
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('position_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained();
            $table->foreignId('role_id')->constrained();
            $table->foreignId('unit_id')->constrained('organizational_units');
            $table->enum('action', ['assigned','relieved','transferred']);
            $table->foreignId('performed_by')->constrained('users');
            $table->timestamp('performed_at');
            $table->text('remarks')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('position_history');
    }
};
```

---

## 5. Enums

### `app/Enums/MemberStatus.php`
```php
<?php
namespace App\Enums;

enum MemberStatus: string
{
    case PENDING   = 'pending';
    case ACTIVE    = 'active';
    case SUSPENDED = 'suspended';
    case EXPELLED  = 'expelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING   => 'Pending Approval',
            self::ACTIVE    => 'Active Member',
            self::SUSPENDED => 'Suspended',
            self::EXPELLED  => 'Expelled',
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

### `app/Enums/UnitType.php`
```php
<?php
namespace App\Enums;

enum UnitType: string
{
    case CENTRAL  = 'central';
    case DIVISION = 'division';
    case DISTRICT = 'district';
    case UPAZILA  = 'upazila';
    case UNION    = 'union';
    case WARD     = 'ward';
    case CAMPUS   = 'campus';

    public function label(): string
    {
        return match($this) {
            self::CENTRAL  => 'Central Committee',
            self::DIVISION => 'Division Committee',
            self::DISTRICT => 'District Committee',
            self::UPAZILA  => 'Upazila Committee',
            self::UNION    => 'Union Committee',
            self::WARD     => 'Ward Committee',
            self::CAMPUS   => 'Campus / Institution',
        };
    }
}
```

### `app/Enums/Gender.php`
```php
<?php
namespace App\Enums;

enum Gender: string
{
    case MALE   = 'male';
    case FEMALE = 'female';
    case OTHER  = 'other';
}
```

---

## 6. Models

### `app/Models/User.php`
```php
<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    protected $fillable = ['email', 'password', 'user_type', 'is_active'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['email_verified_at' => 'datetime'];

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'user_type' => $this->user_type,
            'email'     => $this->email,
        ];
    }

    public function member(): HasOne
    {
        return $this->hasOne(Member::class);
    }

    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }
}
```

### `app/Models/Member.php`
```php
<?php
namespace App\Models;

use App\Enums\MemberStatus;
use App\Enums\Gender;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    protected $fillable = [
        'user_id', 'member_id', 'full_name', 'father_name', 'mother_name',
        'date_of_birth', 'gender', 'nid_or_bc', 'blood_group', 'phone',
        'email', 'present_address', 'permanent_address',
        'institution', 'department', 'session', 'photo_path',
        'status', 'approved_by', 'approved_at', 'join_year',
        'organizational_unit_id',
    ];

    protected $casts = [
        'status'       => MemberStatus::class,
        'gender'       => Gender::class,
        'approved_at'  => 'datetime',
        'date_of_birth'=> 'date',
    ];

    // ── Relationships ──────────────────────────────────────────────
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'organizational_unit_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function positions(): HasMany
    {
        return $this->hasMany(MemberPosition::class)->where('is_active', 1);
    }

    public function allPositions(): HasMany
    {
        return $this->hasMany(MemberPosition::class);
    }

    public function positionHistory(): HasMany
    {
        return $this->hasMany(PositionHistory::class);
    }

    // ── Scopes ────────────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('status', MemberStatus::ACTIVE);
    }

    public function scopePending($query)
    {
        return $query->where('status', MemberStatus::PENDING);
    }

    public function scopeByUnit($query, int $unitId)
    {
        return $query->where('organizational_unit_id', $unitId);
    }

    public function scopeByYear($query, int $year)
    {
        return $query->where('join_year', $year);
    }

    // ── Computed Attributes ───────────────────────────────────────
    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path
            ? asset('storage/' . $this->photo_path)
            : null;
    }

    // ── Helpers ───────────────────────────────────────────────────
    public function isActive(): bool
    {
        return $this->status === MemberStatus::ACTIVE;
    }

    public function deactivateAllPositions(string $remarks = ''): void
    {
        $this->positions()->update(['is_active' => 0, 'relieved_at' => now()]);

        PositionHistory::insert(
            $this->positions()->get()->map(fn($p) => [
                'member_id'    => $this->id,
                'role_id'      => $p->role_id,
                'unit_id'      => $p->unit_id,
                'action'       => 'relieved',
                'performed_by' => auth()->id(),
                'performed_at' => now(),
                'remarks'      => $remarks,
            ])->toArray()
        );
    }
}
```

### `app/Models/OrganizationalUnit.php`
```php
<?php
namespace App\Models;

use App\Enums\UnitType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationalUnit extends Model
{
    protected $fillable = ['name', 'type', 'parent_id', 'code', 'description', 'is_active'];

    protected $casts = ['type' => UnitType::class];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(OrganizationalUnit::class, 'parent_id');
    }

    // Recursive tree loading
    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'organizational_unit_id');
    }

    public function positions(): HasMany
    {
        return $this->hasMany(MemberPosition::class, 'unit_id');
    }
}
```

### `app/Models/Role.php`
```php
<?php
namespace App\Models;

use App\Enums\UnitType;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['title', 'unit_type', 'rank_order', 'description', 'is_active', 'created_by'];

    protected $casts = ['unit_type' => UnitType::class];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function positions()
    {
        return $this->hasMany(MemberPosition::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    public function scopeForUnitType($query, string $type)
    {
        return $query->where('unit_type', $type);
    }
}
```

### `app/Models/MemberPosition.php`
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberPosition extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'member_id', 'role_id', 'unit_id',
        'assigned_by', 'assigned_at', 'relieved_at',
        'is_active', 'notes',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'relieved_at' => 'datetime',
    ];

    public function member()     { return $this->belongsTo(Member::class); }
    public function role()       { return $this->belongsTo(Role::class); }
    public function unit()       { return $this->belongsTo(OrganizationalUnit::class); }
    public function assignedBy() { return $this->belongsTo(User::class, 'assigned_by'); }

    public function scopeActive($query) { return $query->where('is_active', 1); }
}
```

### `app/Models/PositionHistory.php`
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PositionHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'member_id', 'role_id', 'unit_id',
        'action', 'performed_by', 'performed_at', 'remarks',
    ];

    protected $casts = ['performed_at' => 'datetime'];

    public function member()      { return $this->belongsTo(Member::class); }
    public function role()        { return $this->belongsTo(Role::class); }
    public function unit()        { return $this->belongsTo(OrganizationalUnit::class); }
    public function performedBy() { return $this->belongsTo(User::class, 'performed_by'); }
}
```

---

## 7. API Resources

### `app/Resources/MemberPublicResource.php`
```php
<?php
namespace App\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MemberPublicResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'member_id'   => $this->member_id,
            'full_name'   => $this->full_name,
            'institution' => $this->institution,
            'department'  => $this->department,
            'join_year'   => $this->join_year,
            'photo_url'   => $this->photo_url,
            'unit'        => $this->whenLoaded('unit', fn() => [
                'id'   => $this->unit->id,
                'name' => $this->unit->name,
                'type' => $this->unit->type->value,
            ]),
            'positions' => $this->whenLoaded('positions', fn() =>
                $this->positions->map(fn($p) => [
                    'role'       => $p->role->title,
                    'unit'       => $p->unit->name,
                    'since'      => $p->assigned_at?->toDateString(),
                    'rank_order' => $p->role->rank_order,
                ])->sortBy('rank_order')->values()
            ),
        ];
    }
}
```

### `app/Resources/MemberResource.php`
```php
<?php
namespace App\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'member_id'        => $this->member_id,
            'full_name'        => $this->full_name,
            'father_name'      => $this->father_name,
            'mother_name'      => $this->mother_name,
            'date_of_birth'    => $this->date_of_birth?->toDateString(),
            'gender'           => $this->gender?->value,
            'blood_group'      => $this->blood_group,
            'phone'            => $this->phone,
            'email'            => $this->email,
            'present_address'  => $this->present_address,
            'permanent_address'=> $this->permanent_address,
            'institution'      => $this->institution,
            'department'       => $this->department,
            'session'          => $this->session,
            'photo_url'        => $this->photo_url,
            'status'           => $this->status->value,
            'status_label'     => $this->status->label(),
            'join_year'        => $this->join_year,
            'approved_at'      => $this->approved_at?->toDateTimeString(),
            'unit'             => new UnitResource($this->whenLoaded('unit')),
            'positions'        => PositionResource::collection($this->whenLoaded('positions')),
            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }
}
```

---

## 8. Form Requests (Validation)

### `app/Http/Requests/RegisterRequest.php`
```php
<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email'       => 'required|email|unique:users,email|max:191',
            'password'    => 'required|string|min:8|confirmed',
            'full_name'   => 'required|string|max:191',
            'phone'       => 'nullable|string|max:20',
            'institution' => 'nullable|string|max:255',
            'department'  => 'nullable|string|max:191',
            'session'     => 'nullable|string|max:20',
            'unit_id'     => 'nullable|exists:organizational_units,id',
            'date_of_birth' => 'nullable|date|before:today',
            'gender'      => 'nullable|in:male,female,other',
            'present_address' => 'nullable|string',
        ];
    }
}
```

### `app/Http/Requests/PromotePositionRequest.php`
```php
<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PromotePositionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'member_id' => 'required|exists:members,id',
            'role_id'   => 'required|exists:roles,id',
            'unit_id'   => 'required|exists:organizational_units,id',
            'notes'     => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'member_id.exists' => 'Member not found.',
            'role_id.exists'   => 'Role not found.',
            'unit_id.exists'   => 'Organizational unit not found.',
        ];
    }
}
```

### `app/Http/Requests/CreateRoleRequest.php`
```php
<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateRoleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title'       => 'required|string|max:191',
            'unit_type'   => 'required|in:central,division,district,upazila,union,ward,campus',
            'rank_order'  => 'required|integer|min:1|max:9999',
            'description' => 'nullable|string',
        ];
    }
}
```

---

## 9. Services

### `app/Services/MemberIdService.php`
```php
<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;

class MemberIdService
{
    /**
     * Generate year-sequential member ID.
     * Outputs: 20261, 20262, 20263 ... (year + sequence)
     */
    public function generate(?int $year = null): string
    {
        $year = $year ?? now()->year;

        return DB::transaction(function () use ($year) {
            DB::statement('
                INSERT INTO member_id_sequences (year, last_seq)
                VALUES (?, 1)
                ON DUPLICATE KEY UPDATE last_seq = last_seq + 1
            ', [$year]);

            $seq = DB::selectOne(
                'SELECT last_seq FROM member_id_sequences WHERE year = ?',
                [$year]
            )->last_seq;

            return (string) ($year . $seq);
        });
    }
}
```

### `app/Services/PositionService.php`
```php
<?php
namespace App\Services;

use App\Enums\MemberStatus;
use App\Models\Member;
use App\Models\MemberPosition;
use App\Models\OrganizationalUnit;
use App\Models\PositionHistory;
use App\Models\Role;
use Illuminate\Validation\ValidationException;

class PositionService
{
    public function promote(array $data, int $adminId): MemberPosition
    {
        $member = Member::findOrFail($data['member_id']);
        $role   = Role::findOrFail($data['role_id']);
        $unit   = OrganizationalUnit::findOrFail($data['unit_id']);

        // Rule 1: Must be active member
        if ($member->status !== MemberStatus::ACTIVE) {
            throw ValidationException::withMessages([
                'member_id' => 'Only active members can be assigned positions.',
            ]);
        }

        // Rule 2: Role unit_type must match unit type
        if ($role->unit_type !== $unit->type) {
            throw ValidationException::withMessages([
                'role_id' => "Role '{$role->title}' is for {$role->unit_type->value} units only.",
            ]);
        }

        // Relieve existing holder of this role+unit
        $existing = MemberPosition::active()
            ->where('role_id', $role->id)
            ->where('unit_id', $unit->id)
            ->first();

        if ($existing) {
            $existing->update(['is_active' => 0, 'relieved_at' => now()]);
            PositionHistory::create([
                'member_id'    => $existing->member_id,
                'role_id'      => $role->id,
                'unit_id'      => $unit->id,
                'action'       => 'relieved',
                'performed_by' => $adminId,
                'performed_at' => now(),
                'remarks'      => 'Auto-relieved: new member assigned to position.',
            ]);
        }

        // Assign new position
        $position = MemberPosition::create([
            'member_id'   => $member->id,
            'role_id'     => $role->id,
            'unit_id'     => $unit->id,
            'assigned_by' => $adminId,
            'assigned_at' => now(),
            'is_active'   => 1,
            'notes'       => $data['notes'] ?? null,
        ]);

        // Write audit trail
        PositionHistory::create([
            'member_id'    => $member->id,
            'role_id'      => $role->id,
            'unit_id'      => $unit->id,
            'action'       => 'assigned',
            'performed_by' => $adminId,
            'performed_at' => now(),
        ]);

        return $position->load(['member', 'role', 'unit']);
    }

    public function relieve(int $positionId, int $adminId, ?string $remarks = null): void
    {
        $position = MemberPosition::findOrFail($positionId);
        $position->update(['is_active' => 0, 'relieved_at' => now()]);

        PositionHistory::create([
            'member_id'    => $position->member_id,
            'role_id'      => $position->role_id,
            'unit_id'      => $position->unit_id,
            'action'       => 'relieved',
            'performed_by' => $adminId,
            'performed_at' => now(),
            'remarks'      => $remarks,
        ]);
    }

    public function transfer(array $data, int $adminId): MemberPosition
    {
        // Relieve from current unit
        $this->relieve($data['position_id'], $adminId, $data['remarks'] ?? 'Transferred');

        // Assign to new unit (same role)
        $old = MemberPosition::findOrFail($data['position_id']);
        return $this->promote([
            'member_id' => $old->member_id,
            'role_id'   => $old->role_id,
            'unit_id'   => $data['to_unit_id'],
            'notes'     => $data['remarks'] ?? null,
        ], $adminId);
    }
}
```

### `app/Services/PhotoService.php`
```php
<?php
namespace App\Services;

use App\Models\Member;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PhotoService
{
    private array $allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
    private int $maxSize = 2 * 1024 * 1024; // 2MB

    public function upload(UploadedFile $file, Member $member): string
    {
        // Delete old photo if exists
        if ($member->photo_path) {
            Storage::disk('public')->delete($member->photo_path);
        }

        $ext      = $file->getClientOriginalExtension();
        $filename = 'photos/' . $member->member_id . '_' . time() . '.' . strtolower($ext);

        Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));

        $member->update(['photo_path' => $filename]);

        return Storage::disk('public')->url($filename);
    }

    public function allowedMimeTypes(): array
    {
        return array_map(fn($t) => 'image/' . $t, $this->allowedTypes);
    }
}
```

---

## 10. Controllers — Auth

### `app/Http/Controllers/API/AuthController.php`
```php
<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\Member;
use App\Models\User;
use App\Services\MemberIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct(private MemberIdService $memberIdService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'user_type' => 'member',
        ]);

        $memberId = $this->memberIdService->generate();

        Member::create([
            'user_id'                => $user->id,
            'member_id'              => $memberId,
            'full_name'              => $request->full_name,
            'phone'                  => $request->phone,
            'institution'            => $request->institution,
            'department'             => $request->department,
            'session'                => $request->session,
            'present_address'        => $request->present_address,
            'date_of_birth'          => $request->date_of_birth,
            'gender'                 => $request->gender,
            'join_year'              => now()->year,
            'status'                 => 'pending',
            'organizational_unit_id' => $request->unit_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Awaiting admin approval.',
            'data'    => ['member_id' => $memberId, 'status' => 'pending'],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$token = JWTAuth::attempt($request->only('email', 'password'))) {
            return response()->json(['success' => false, 'error' => 'Invalid credentials.'], 401);
        }

        $user   = auth()->user();
        $member = $user->member;

        // Block non-active members
        if ($member && !$member->status->canLogin()) {
            JWTAuth::invalidate($token);
            return response()->json([
                'success' => false,
                'error'   => 'Account not active: ' . $member->status->label(),
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'access_token' => $token,
                'token_type'   => 'bearer',
                'expires_in'   => config('jwt.ttl') * 60,
                'user'         => [
                    'id'        => $user->id,
                    'email'     => $user->email,
                    'user_type' => $user->user_type,
                    'member_id' => $member?->member_id,
                    'full_name' => $member?->full_name,
                    'status'    => $member?->status->value,
                ],
            ],
        ]);
    }

    public function logout(): JsonResponse
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['success' => true, 'message' => 'Logged out successfully.']);
    }

    public function refresh(): JsonResponse
    {
        return response()->json([
            'success'      => true,
            'access_token' => JWTAuth::refresh(),
            'token_type'   => 'bearer',
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => auth()->user()]);
    }
}
```

---

## 11. Controllers — Member

### `app/Http/Controllers/API/ProfileController.php`
```php
<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Resources\MemberResource;
use App\Resources\PositionResource;
use App\Services\PhotoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private PhotoService $photoService) {}

    public function me(): JsonResponse
    {
        $member = auth()->user()->member->load(['unit', 'positions.role', 'positions.unit']);
        return response()->json(['success' => true, 'data' => new MemberResource($member)]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $member = auth()->user()->member;
        $member->update($request->validated());
        return response()->json(['success' => true, 'data' => new MemberResource($member->fresh(['unit']))]);
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $member   = auth()->user()->member;
        $photoUrl = $this->photoService->upload($request->file('photo'), $member);

        return response()->json([
            'success'   => true,
            'photo_url' => $photoUrl,
        ]);
    }

    public function positions(): JsonResponse
    {
        $member = auth()->user()->member->load(['positionHistory.role', 'positionHistory.unit']);
        return response()->json([
            'success' => true,
            'data'    => PositionResource::collection($member->positionHistory),
        ]);
    }
}
```

### `app/Http/Controllers/API/MemberController.php`
```php
<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Resources\MemberPublicResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    // GET /api/members/{member_id}  — public profile
    public function publicProfile(string $memberId): JsonResponse
    {
        $member = Member::where('member_id', $memberId)
            ->where('status', 'active')
            ->with(['unit', 'positions.role', 'positions.unit'])
            ->first();

        if (!$member) {
            return response()->json(['success' => false, 'error' => 'Member not found.'], 404);
        }

        return response()->json(['success' => true, 'data' => new MemberPublicResource($member)]);
    }

    // GET /api/members/search
    public function search(Request $request): JsonResponse
    {
        $query = Member::active()->with(['unit', 'positions.role']);

        if ($request->q) {
            $q = $request->q;
            $query->where(function ($sq) use ($q) {
                $sq->where('full_name', 'like', "%$q%")
                   ->orWhere('member_id', 'like', "%$q%")
                   ->orWhere('institution', 'like', "%$q%");
            });
        }

        if ($request->unit_id) {
            $query->where('organizational_unit_id', $request->unit_id);
        }

        return response()->json([
            'success' => true,
            'data'    => MemberPublicResource::collection($query->paginate(20)),
        ]);
    }
}
```

---

## 12. Controllers — Admin Member

### `app/Http/Controllers/API/Admin/AdminMemberController.php`
```php
<?php
namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Enums\MemberStatus;
use App\Models\Member;
use App\Resources\MemberResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Member::with(['user', 'unit']);

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->unit_id) {
            $query->where('organizational_unit_id', $request->unit_id);
        }
        if ($request->unit_type) {
            $query->whereHas('unit', fn($q) => $q->where('type', $request->unit_type));
        }
        if ($request->join_year) {
            $query->where('join_year', $request->join_year);
        }
        if ($request->search) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('full_name', 'like', "%$s%")
                  ->orWhere('member_id', 'like', "%$s%")
                  ->orWhere('phone', 'like', "%$s%");
            });
        }

        $sortBy  = $request->sort_by ?? 'created_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return response()->json([
            'success' => true,
            'data'    => MemberResource::collection($query->paginate($request->per_page ?? 20)),
        ]);
    }

    public function pending(): JsonResponse
    {
        $members = Member::pending()->with(['unit'])->latest()->paginate(20);
        return response()->json(['success' => true, 'data' => MemberResource::collection($members)]);
    }

    public function show(int $id): JsonResponse
    {
        $member = Member::with(['user', 'unit', 'positions.role', 'positionHistory.role'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => new MemberResource($member)]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $member = Member::findOrFail($id);

        if ($member->status !== MemberStatus::PENDING) {
            return response()->json(['success' => false, 'error' => 'Member is not pending.'], 409);
        }

        $member->update([
            'status'      => MemberStatus::ACTIVE,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member approved successfully.',
            'data'    => ['member_id' => $member->member_id, 'status' => 'active'],
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $member = Member::findOrFail($id);
        $member->user()->delete(); // Cascade deletes member too
        return response()->json(['success' => true, 'message' => 'Member registration rejected and removed.']);
    }

    public function suspend(Request $request, int $id): JsonResponse
    {
        $member = Member::findOrFail($id);
        $member->update(['status' => MemberStatus::SUSPENDED]);
        $member->deactivateAllPositions('Member suspended.');
        return response()->json(['success' => true, 'message' => 'Member suspended. All positions removed.']);
    }

    public function expel(Request $request, int $id): JsonResponse
    {
        $member = Member::findOrFail($id);
        $member->update(['status' => MemberStatus::EXPELLED]);
        $member->deactivateAllPositions('Member expelled.');
        return response()->json(['success' => true, 'message' => 'Member expelled. All positions removed.']);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $member = Member::findOrFail($id);
        $member->update($request->only([
            'full_name', 'father_name', 'mother_name', 'phone',
            'institution', 'department', 'session',
            'present_address', 'permanent_address',
            'organizational_unit_id',
        ]));
        return response()->json(['success' => true, 'data' => new MemberResource($member->fresh())]);
    }

    public function destroy(int $id): JsonResponse
    {
        $member = Member::findOrFail($id);
        $member->user()->delete();
        return response()->json(['success' => true, 'message' => 'Member deleted.']);
    }
}
```

---

## 13. Controllers — Admin Role

### `app/Http/Controllers/API/Admin/RoleController.php`
```php
<?php
namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateRoleRequest;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::active()->orderBy('unit_type')->orderBy('rank_order')->get();
        return response()->json(['success' => true, 'data' => $roles]);
    }

    public function store(CreateRoleRequest $request): JsonResponse
    {
        $role = Role::create([...$request->validated(), 'created_by' => auth()->id()]);
        return response()->json(['success' => true, 'data' => $role], 201);
    }

    public function show(int $id): JsonResponse
    {
        $role = Role::with(['createdBy'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $role]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        $role->update($request->only(['title', 'unit_type', 'rank_order', 'description']));
        return response()->json(['success' => true, 'data' => $role->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        Role::findOrFail($id)->update(['is_active' => 0]);
        return response()->json(['success' => true, 'message' => 'Role deactivated.']);
    }
}
```

---

## 14. Controllers — Admin Position

### `app/Http/Controllers/API/Admin/PositionController.php`
```php
<?php
namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PromotePositionRequest;
use App\Models\MemberPosition;
use App\Models\PositionHistory;
use App\Services\PositionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function __construct(private PositionService $positionService) {}

    public function index(): JsonResponse
    {
        $positions = MemberPosition::active()
            ->with(['member', 'role', 'unit', 'assignedBy'])
            ->orderByDesc('assigned_at')
            ->paginate(20);
        return response()->json(['success' => true, 'data' => $positions]);
    }

    public function history(): JsonResponse
    {
        $history = PositionHistory::with(['member', 'role', 'unit', 'performedBy'])
            ->orderByDesc('performed_at')
            ->paginate(30);
        return response()->json(['success' => true, 'data' => $history]);
    }

    public function memberHistory(int $memberId): JsonResponse
    {
        $history = PositionHistory::where('member_id', $memberId)
            ->with(['role', 'unit', 'performedBy'])
            ->orderByDesc('performed_at')
            ->get();
        return response()->json(['success' => true, 'data' => $history]);
    }

    public function promote(PromotePositionRequest $request): JsonResponse
    {
        $position = $this->positionService->promote($request->validated(), auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Member promoted to position successfully.',
            'data'    => [
                'position_id' => $position->id,
                'member_id'   => $position->member->member_id,
                'member_name' => $position->member->full_name,
                'role'        => $position->role->title,
                'unit'        => $position->unit->name,
                'assigned_at' => $position->assigned_at,
            ],
        ], 201);
    }

    public function relieve(Request $request): JsonResponse
    {
        $request->validate(['position_id' => 'required|exists:member_positions,id']);
        $this->positionService->relieve($request->position_id, auth()->id(), $request->remarks);
        return response()->json(['success' => true, 'message' => 'Member relieved from position.']);
    }

    public function transfer(Request $request): JsonResponse
    {
        $request->validate([
            'position_id' => 'required|exists:member_positions,id',
            'to_unit_id'  => 'required|exists:organizational_units,id',
            'remarks'     => 'nullable|string',
        ]);

        $position = $this->positionService->transfer($request->all(), auth()->id());
        return response()->json(['success' => true, 'message' => 'Member transferred.', 'data' => $position]);
    }
}
```

---

## 15. Controllers — Admin Unit

### `app/Http/Controllers/API/Admin/OrganizationalUnitController.php`
```php
<?php
namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationalUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationalUnitController extends Controller
{
    // GET /api/units — public tree
    public function index(): JsonResponse
    {
        $units = OrganizationalUnit::whereNull('parent_id')
            ->where('is_active', 1)
            ->with('allChildren')
            ->get();
        return response()->json(['success' => true, 'data' => $units]);
    }

    // GET /api/units/{type}
    public function byType(string $type): JsonResponse
    {
        $units = OrganizationalUnit::where('type', $type)->where('is_active', 1)->get();
        return response()->json(['success' => true, 'data' => $units]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => 'required|string|max:191',
            'type'        => 'required|in:central,division,district,upazila,union,ward,campus',
            'parent_id'   => 'nullable|exists:organizational_units,id',
            'code'        => 'nullable|string|max:20|unique:organizational_units,code',
            'description' => 'nullable|string',
        ]);

        $unit = OrganizationalUnit::create($request->all());
        return response()->json(['success' => true, 'data' => $unit], 201);
    }

    public function show(int $id): JsonResponse
    {
        $unit = OrganizationalUnit::with(['parent', 'children'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $unit]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $unit = OrganizationalUnit::findOrFail($id);
        $unit->update($request->only(['name', 'code', 'description', 'parent_id']));
        return response()->json(['success' => true, 'data' => $unit->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        OrganizationalUnit::findOrFail($id)->update(['is_active' => 0]);
        return response()->json(['success' => true, 'message' => 'Unit deactivated.']);
    }
}
```

---

## 16. Controllers — Public Directory

### `app/Http/Controllers/API/Public/DirectoryController.php`
```php
<?php
namespace App\Http\Controllers\API\Public;

use App\Http\Controllers\Controller;
use App\Models\MemberPosition;
use App\Models\OrganizationalUnit;
use Illuminate\Http\JsonResponse;

class DirectoryController extends Controller
{
    public function index(): JsonResponse
    {
        $units = OrganizationalUnit::where('is_active', 1)
            ->withCount(['positions' => fn($q) => $q->where('is_active', 1)])
            ->get();
        return response()->json(['success' => true, 'data' => $units]);
    }

    public function central(): JsonResponse
    {
        $unit = OrganizationalUnit::where('type', 'central')->first();
        return $this->unitDirectory($unit->id);
    }

    public function byUnit(int $unitId): JsonResponse
    {
        return $this->unitDirectory($unitId);
    }

    private function unitDirectory(int $unitId): JsonResponse
    {
        $unit = OrganizationalUnit::findOrFail($unitId);

        $positions = MemberPosition::active()
            ->where('unit_id', $unitId)
            ->with(['member', 'role'])
            ->get()
            ->sortBy('role.rank_order')
            ->values()
            ->map(fn($p) => [
                'member_id'   => $p->member->member_id,
                'full_name'   => $p->member->full_name,
                'photo_url'   => $p->member->photo_url,
                'institution' => $p->member->institution,
                'position'    => $p->role->title,
                'rank_order'  => $p->role->rank_order,
                'since'       => $p->assigned_at?->toDateString(),
            ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'unit'    => ['id' => $unit->id, 'name' => $unit->name, 'type' => $unit->type->value],
                'members' => $positions,
            ],
        ]);
    }
}
```

---

## 17. Middleware

### `app/Http/Middleware/AdminMiddleware.php`
```php
<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || auth()->user()->user_type !== 'admin') {
            return response()->json([
                'success' => false,
                'error'   => 'Admin access required.',
            ], 403);
        }
        return $next($request);
    }
}
```

### `bootstrap/app.php` — Register Middleware Alias
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ]);
})
```

---

## 18. Routes — `routes/api.php`

```php
<?php
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\MemberController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\Admin\AdminMemberController;
use App\Http\Controllers\API\Admin\RoleController;
use App\Http\Controllers\API\Admin\PositionController;
use App\Http\Controllers\API\Admin\OrganizationalUnitController;
use App\Http\Controllers\API\Public\DirectoryController;
use Illuminate\Support\Facades\Route;

// ── Public ─────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

Route::get('members/{member_id}',  [MemberController::class, 'publicProfile']);
Route::get('members/search',       [MemberController::class, 'search']);
Route::get('units',                [OrganizationalUnitController::class, 'index']);
Route::get('units/{type}',         [OrganizationalUnitController::class, 'byType']);
Route::get('directory',            [DirectoryController::class, 'index']);
Route::get('directory/central',    [DirectoryController::class, 'central']);
Route::get('directory/{unit_id}',  [DirectoryController::class, 'byUnit']);

// ── Authenticated (any active member) ──────────────────────────
Route::middleware('auth:api')->group(function () {
    Route::post('auth/logout',  [AuthController::class, 'logout']);
    Route::post('auth/refresh', [AuthController::class, 'refresh']);
    Route::get('auth/me',       [AuthController::class, 'me']);

    Route::prefix('members/me')->group(function () {
        Route::get('/',         [ProfileController::class, 'me']);
        Route::put('/',         [ProfileController::class, 'update']);
        Route::post('photo',    [ProfileController::class, 'uploadPhoto']);
        Route::get('positions', [ProfileController::class, 'positions']);
    });
});

// ── Admin ───────────────────────────────────────────────────────
Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {

    // Member management
    Route::get('members',                [AdminMemberController::class, 'index']);
    Route::get('members/pending',        [AdminMemberController::class, 'pending']);
    Route::get('members/{id}',           [AdminMemberController::class, 'show']);
    Route::put('members/{id}',           [AdminMemberController::class, 'update']);
    Route::delete('members/{id}',        [AdminMemberController::class, 'destroy']);
    Route::post('members/{id}/approve',  [AdminMemberController::class, 'approve']);
    Route::post('members/{id}/reject',   [AdminMemberController::class, 'reject']);
    Route::post('members/{id}/suspend',  [AdminMemberController::class, 'suspend']);
    Route::post('members/{id}/expel',    [AdminMemberController::class, 'expel']);

    // Role management
    Route::apiResource('roles', RoleController::class);

    // Position management
    Route::get('positions',              [PositionController::class, 'index']);
    Route::get('positions/history',      [PositionController::class, 'history']);
    Route::get('positions/{member_id}',  [PositionController::class, 'memberHistory']);
    Route::post('positions/promote',     [PositionController::class, 'promote']);
    Route::post('positions/relieve',     [PositionController::class, 'relieve']);
    Route::post('positions/transfer',    [PositionController::class, 'transfer']);

    // Organizational units
    Route::post('units',        [OrganizationalUnitController::class, 'store']);
    Route::get('units/{id}',    [OrganizationalUnitController::class, 'show']);
    Route::put('units/{id}',    [OrganizationalUnitController::class, 'update']);
    Route::delete('units/{id}', [OrganizationalUnitController::class, 'destroy']);
});
```

---

## 19. API Endpoints Reference

### Public
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Student registration |
| POST | /api/auth/login | Login → JWT |
| GET | /api/members/{member_id} | Public member profile |
| GET | /api/members/search | Search active members |
| GET | /api/units | All units (tree) |
| GET | /api/units/{type} | Units filtered by type |
| GET | /api/directory | All units with member count |
| GET | /api/directory/central | Central committee listing |
| GET | /api/directory/{unit_id} | Unit committee listing |

### Authenticated (JWT)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/logout | Logout |
| POST | /api/auth/refresh | Refresh token |
| GET | /api/auth/me | Auth user info |
| GET | /api/members/me | Own full profile |
| PUT | /api/members/me | Update own profile |
| POST | /api/members/me/photo | Upload profile photo |
| GET | /api/members/me/positions | Own position history |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/members | List all members |
| GET | /api/admin/members/pending | Pending approvals |
| GET | /api/admin/members/{id} | Member detail |
| PUT | /api/admin/members/{id} | Edit member |
| DELETE | /api/admin/members/{id} | Delete member |
| POST | /api/admin/members/{id}/approve | Approve member |
| POST | /api/admin/members/{id}/reject | Reject registration |
| POST | /api/admin/members/{id}/suspend | Suspend member |
| POST | /api/admin/members/{id}/expel | Expel member |
| GET | /api/admin/roles | List roles |
| POST | /api/admin/roles | Create role |
| PUT | /api/admin/roles/{id} | Update role |
| DELETE | /api/admin/roles/{id} | Deactivate role |
| GET | /api/admin/positions | Active positions |
| GET | /api/admin/positions/history | Full audit trail |
| GET | /api/admin/positions/{member_id} | Member history |
| POST | /api/admin/positions/promote | Assign position |
| POST | /api/admin/positions/relieve | Remove from position |
| POST | /api/admin/positions/transfer | Transfer to new unit |
| POST | /api/admin/units | Create unit |
| GET | /api/admin/units/{id} | Unit detail |
| PUT | /api/admin/units/{id} | Update unit |
| DELETE | /api/admin/units/{id} | Deactivate unit |

---

## 20. Request & Response Examples

### Register
**Request:**
```json
POST /api/auth/register
{
  "email":        "ahmed@example.com",
  "password":     "SecurePass@123",
  "password_confirmation": "SecurePass@123",
  "full_name":    "Ahmed Rahman",
  "phone":        "01712345678",
  "institution":  "Dhaka University",
  "department":   "Computer Science",
  "unit_id":      12
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Awaiting admin approval.",
  "data": { "member_id": "20261", "status": "pending" }
}
```

### Login
**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type":   "bearer",
    "expires_in":   86400,
    "user": {
      "id": 5, "email": "ahmed@example.com",
      "user_type": "member", "member_id": "20261",
      "full_name": "Ahmed Rahman", "status": "active"
    }
  }
}
```

### Promote Member
**Request:**
```json
POST /api/admin/positions/promote
Authorization: Bearer {admin_token}
{
  "member_id": 42,
  "role_id":   5,
  "unit_id":   12,
  "notes":     "Elected at general meeting 2026-03-20"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Member promoted to position successfully.",
  "data": {
    "position_id":  15,
    "member_id":    "20261",
    "member_name":  "Ahmed Rahman",
    "role":         "Campus President",
    "unit":         "Dhaka University Campus",
    "assigned_at":  "2026-03-25T10:00:00Z"
  }
}
```

### Public Profile
**Response (200):**
```json
{
  "success": true,
  "data": {
    "member_id":   "20261",
    "full_name":   "Ahmed Rahman",
    "institution": "Dhaka University",
    "department":  "Computer Science",
    "join_year":   2026,
    "photo_url":   "https://api.ndmstudent.org/storage/photos/20261_1711234567.jpg",
    "unit":        { "id": 12, "name": "Dhaka University Campus", "type": "campus" },
    "positions":   [
      { "role": "Campus President", "unit": "Dhaka University Campus", "since": "2026-01-15", "rank_order": 1 }
    ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Only active members can be assigned positions.",
  "errors": { "member_id": ["Only active members can be assigned positions."] }
}
```

---

## 21. Business Rules

| # | Rule | Enforced In | If Violated |
|---|---|---|---|
| 1 | Only active members can hold positions | `PositionService::promote()` | 422 error |
| 2 | No position before approval | Status check in PositionService | 422 error |
| 3 | Member ID is year-sequential | `MemberIdService` + atomic DB | Unique guaranteed |
| 4 | One person per role per unit at a time | UNIQUE KEY + `relieveExisting()` | Auto-relieves old holder |
| 5 | Role must match unit type | `PositionService` role vs unit check | 422 error |
| 6 | Pending members cannot log in | `AuthController::login()` | 403 error |
| 7 | Suspended/expelled = positions revoked | `AdminMemberController::suspend/expel` | All positions deactivated |
| 8 | All position changes are logged | `PositionService` → PositionHistory | Full audit trail |
| 9 | Photo stored in secure storage | `PhotoService` | Never exposed as filesystem path |
| 10 | Member ID is immutable after creation | Not in fillable, never updated | Permanent for life |
| 11 | Admin routes require user_type = admin | `AdminMiddleware` | 403 error |
| 12 | Password must be bcrypt hashed | `AuthController::register()` | Plain text never stored |

---

## 22. Environment & Deployment

### `.env`
```env
APP_NAME="NDM Student Wing API"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.ndmstudent.org

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ndm_student_wing
DB_USERNAME=ndm_user
DB_PASSWORD=your_strong_password

JWT_SECRET=your_jwt_secret_key_64_chars_minimum_here
JWT_TTL=1440
JWT_REFRESH_TTL=20160

FILESYSTEM_DISK=public
UPLOAD_MAX_SIZE=2097152

CACHE_STORE=redis
QUEUE_CONNECTION=redis
```

### `composer.json`
```json
{
  "require": {
    "php":                          "^8.2",
    "laravel/framework":            "^11.0",
    "tymon/jwt-auth":               "^2.1",
    "spatie/laravel-query-builder": "^5.8"
  },
  "require-dev": {
    "pestphp/pest":                 "^2.0",
    "pestphp/pest-plugin-laravel":  "^2.0",
    "fakerphp/faker":               "^1.23"
  }
}
```

### Installation
```bash
git clone https://github.com/yourorg/ndm-student-wing-api
cd ndm-student-wing-api
composer install --optimize-autoloader --no-dev
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --force
php artisan db:seed
php artisan storage:link
php artisan config:cache
php artisan route:cache
```

### HTTP Status Codes
| Code | Meaning | Used When |
|---|---|---|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Malformed request |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Not admin, pending member |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Business rule violation |
| 422 | Unprocessable | Validation failed |
| 500 | Server Error | Unexpected error |

---

## 23. Seeders

### `database/seeders/AdminSeeder.php`
```php
<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'email'     => 'admin@ndmstudent.org',
            'password'  => Hash::make('Admin@123456'),
            'user_type' => 'admin',
            'is_active' => 1,
        ]);
    }
}
```

### `database/seeders/RoleSeeder.php`
```php
<?php
namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = User::where('user_type', 'admin')->first()->id;

        $roles = [
            // Central
            ['title' => 'President',                'unit_type' => 'central',  'rank_order' => 1],
            ['title' => 'Senior Vice President',    'unit_type' => 'central',  'rank_order' => 2],
            ['title' => 'Vice President',           'unit_type' => 'central',  'rank_order' => 3],
            ['title' => 'General Secretary',        'unit_type' => 'central',  'rank_order' => 4],
            ['title' => 'Joint General Secretary',  'unit_type' => 'central',  'rank_order' => 5],
            ['title' => 'Organizing Secretary',     'unit_type' => 'central',  'rank_order' => 6],
            ['title' => 'Treasurer',                'unit_type' => 'central',  'rank_order' => 7],
            ['title' => 'Office Secretary',         'unit_type' => 'central',  'rank_order' => 8],
            ['title' => 'Publicity Secretary',      'unit_type' => 'central',  'rank_order' => 9],
            ['title' => 'IT Secretary',             'unit_type' => 'central',  'rank_order' => 10],
            ['title' => 'Education Secretary',      'unit_type' => 'central',  'rank_order' => 11],
            // Division
            ['title' => 'Divisional President',    'unit_type' => 'division', 'rank_order' => 1],
            ['title' => 'Divisional Secretary',    'unit_type' => 'division', 'rank_order' => 2],
            ['title' => 'Organizing Secretary',    'unit_type' => 'division', 'rank_order' => 3],
            // District
            ['title' => 'District President',      'unit_type' => 'district', 'rank_order' => 1],
            ['title' => 'District General Secretary','unit_type' => 'district','rank_order' => 2],
            // Campus
            ['title' => 'Campus President',        'unit_type' => 'campus',   'rank_order' => 1],
            ['title' => 'Campus Secretary',        'unit_type' => 'campus',   'rank_order' => 2],
            ['title' => 'Department Coordinator',  'unit_type' => 'campus',   'rank_order' => 3],
        ];

        foreach ($roles as $role) {
            Role::create([...$role, 'created_by' => $adminId]);
        }
    }
}
```

---

## 24. Testing

### `tests/Feature/AuthTest.php`
```php
<?php
use App\Models\User;
use App\Models\Member;

it('can register a new member', function () {
    $response = $this->postJson('/api/auth/register', [
        'email'                 => 'test@example.com',
        'password'              => 'Password@123',
        'password_confirmation' => 'Password@123',
        'full_name'             => 'Test Member',
        'phone'                 => '01712345678',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('success', true)
             ->assertJsonPath('data.status', 'pending');

    expect(Member::where('full_name', 'Test Member')->exists())->toBeTrue();
});

it('blocks pending member from login', function () {
    $user = User::factory()->create(['password' => bcrypt('Password@123')]);
    Member::factory()->create(['user_id' => $user->id, 'status' => 'pending']);

    $this->postJson('/api/auth/login', [
        'email'    => $user->email,
        'password' => 'Password@123',
    ])->assertStatus(403);
});

it('allows active member to login and receive JWT', function () {
    $user = User::factory()->create(['password' => bcrypt('Password@123')]);
    Member::factory()->create(['user_id' => $user->id, 'status' => 'active']);

    $response = $this->postJson('/api/auth/login', [
        'email'    => $user->email,
        'password' => 'Password@123',
    ]);

    $response->assertStatus(200)
             ->assertJsonStructure(['data' => ['access_token', 'token_type', 'expires_in']]);
});
```

### `tests/Feature/PositionTest.php`
```php
<?php
use App\Models\Member;
use App\Models\Role;
use App\Models\OrganizationalUnit;

it('blocks assigning position to pending member', function () {
    $admin  = loginAsAdmin();
    $member = Member::factory()->create(['status' => 'pending']);
    $role   = Role::factory()->create(['unit_type' => 'campus']);
    $unit   = OrganizationalUnit::factory()->create(['type' => 'campus']);

    $this->actingAs($admin)->postJson('/api/admin/positions/promote', [
        'member_id' => $member->id,
        'role_id'   => $role->id,
        'unit_id'   => $unit->id,
    ])->assertStatus(422);
});

it('auto-relieves existing position holder on new assignment', function () {
    $admin   = loginAsAdmin();
    $member1 = Member::factory()->active()->create();
    $member2 = Member::factory()->active()->create();
    $role    = Role::factory()->create(['unit_type' => 'campus']);
    $unit    = OrganizationalUnit::factory()->create(['type' => 'campus']);

    // Assign member1
    $this->actingAs($admin)->postJson('/api/admin/positions/promote', [
        'member_id' => $member1->id,
        'role_id'   => $role->id,
        'unit_id'   => $unit->id,
    ])->assertStatus(201);

    // Assign member2 to same role+unit → member1 should be auto-relieved
    $this->actingAs($admin)->postJson('/api/admin/positions/promote', [
        'member_id' => $member2->id,
        'role_id'   => $role->id,
        'unit_id'   => $unit->id,
    ])->assertStatus(201);

    expect($member1->positions()->count())->toBe(0);
    expect($member2->positions()->count())->toBe(1);
});
```

---

*NDM Student Wing Management System — Laravel 11 REST API Blueprint*
*Nationalist Democratic Movement (NDM) Bangladesh*
