# NDM Student Wing — 100 Development Tasks
## Complete Laravel 11 API Implementation Checklist

> **How to use this file:**
> - Each task has a checkbox `[ ]` — mark done with `[x]`
> - Every task includes: **What**, **Why**, **How**, **Test**, **Google**
> - Tasks are grouped in phases. Complete each phase before moving to the next.
> - Estimated total: ~120–160 hours for a solo developer

---

## Phase 1 — Project Setup (Tasks 1–10)

---

### Task 1 — Create Laravel 11 Project
- **What:** Initialize a new Laravel 11 application in API mode
- **Why:** Starting point for the entire system
- **How:**
  ```bash
  composer create-project laravel/laravel ndm-student-wing-api
  cd ndm-student-wing-api
  php artisan install:api   # Laravel 11: sets up API routing
  ```
- **Test:** Run `php artisan serve` → visit `http://localhost:8000` → should return JSON
- **Google:** `laravel 11 api only project setup`
- [ ] Done

---

### Task 2 — Configure `.env` Database
- **What:** Set DB credentials, APP_NAME, APP_URL in `.env`
- **Why:** Laravel reads all config from `.env`
- **How:**
  ```env
  APP_NAME="NDM Student Wing API"
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_DATABASE=ndm_student_wing
  DB_USERNAME=root
  DB_PASSWORD=your_password
  ```
  Create DB: `CREATE DATABASE ndm_student_wing CHARACTER SET utf8mb4;`
- **Test:** `php artisan migrate` should complete without error
- **Google:** `laravel 11 mysql utf8mb4 setup`
- [ ] Done

---

### Task 3 — Install JWT Auth Package
- **What:** Install `tymon/jwt-auth` for stateless authentication
- **Why:** The API is stateless — no sessions, only JWT tokens
- **How:**
  ```bash
  composer require tymon/jwt-auth
  php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
  php artisan jwt:secret
  ```
  Add to `config/auth.php`:
  ```php
  'guards' => ['api' => ['driver' => 'jwt', 'provider' => 'users']],
  'defaults' => ['guard' => 'api']
  ```
- **Test:** Check `.env` — `JWT_SECRET=` should now have a value
- **Google:** `tymon jwt-auth laravel 11 install`
- [ ] Done

---

### Task 4 — Configure CORS
- **What:** Allow cross-origin requests from the frontend app
- **Why:** Browser will block API calls if CORS is not configured
- **How:** In `config/cors.php`:
  ```php
  'allowed_origins' => ['*'],    // change to specific domain in production
  'allowed_methods' => ['*'],
  'allowed_headers' => ['*'],
  ```
  Laravel 11 uses middleware in `bootstrap/app.php`:
  ```php
  ->withMiddleware(function (Middleware $middleware) {
      $middleware->api(prepend: [\Illuminate\Http\Middleware\HandleCors::class]);
  })
  ```
- **Test:** Make an OPTIONS request from Postman/browser — should return 200 with CORS headers
- **Google:** `laravel 11 cors middleware configuration`
- [ ] Done

---

### Task 5 — Create All Enums
- **What:** Create PHP 8.1+ backed enums for MemberStatus, UnitType, Gender, PositionAction
- **Why:** Enums enforce valid values at the type level — no magic strings
- **How:** Create files:
  - `app/Enums/MemberStatus.php` → `pending | active | suspended | expelled`
  - `app/Enums/UnitType.php` → `central | division | district | upazila | union | ward | campus`
  - `app/Enums/Gender.php` → `male | female | other`
- **Test:** `php artisan tinker` → `App\Enums\MemberStatus::ACTIVE->label()` should return `"Active Member"`
- **Google:** `php 8.1 backed enum string laravel cast`
- [ ] Done

---

### Task 6 — Create All Migrations
- **What:** Create 7 migration files for all tables
- **Why:** Migrations version-control your database schema
- **How:**
  ```bash
  php artisan make:migration create_member_id_sequences_table
  php artisan make:migration create_organizational_units_table
  php artisan make:migration create_roles_table
  php artisan make:migration create_members_table
  php artisan make:migration create_member_positions_table
  php artisan make:migration create_position_history_table
  ```
  Fill each migration with correct columns, types, foreign keys (see Blueprint in main doc).
- **Test:** `php artisan migrate` — all 7 tables created with no errors
- **Google:** `laravel migration foreignId constrained cascadeOnDelete`
- [ ] Done

---

### Task 7 — Create All Models
- **What:** Create Eloquent models: User, Member, Role, OrganizationalUnit, MemberPosition, PositionHistory
- **Why:** Models are the interface between PHP code and database tables
- **How:**
  ```bash
  php artisan make:model Member
  php artisan make:model Role
  php artisan make:model OrganizationalUnit
  php artisan make:model MemberPosition
  php artisan make:model PositionHistory
  ```
  Add `$fillable`, `$casts`, relationships, and scopes to each (see Models section).
- **Test:** `php artisan tinker` → `App\Models\Member::count()` should return `0`
- **Google:** `laravel eloquent model enum cast relationship`
- [ ] Done

---

### Task 8 — Create Admin Seeder
- **What:** Seed one admin user account into the database
- **Why:** Need at least one admin to start approving members and creating roles
- **How:**
  ```bash
  php artisan make:seeder AdminSeeder
  ```
  Insert user with `user_type = admin`, bcrypt password.
  ```bash
  php artisan db:seed --class=AdminSeeder
  ```
- **Test:** Login with `POST /api/auth/login` using admin credentials → should receive JWT
- **Google:** `laravel seeder bcrypt password`
- [ ] Done

---

### Task 9 — Create OrganizationalUnit Seeder
- **What:** Seed the 8 divisions and 1 central unit of Bangladesh
- **Why:** Members and roles need existing units to reference on registration
- **How:**
  ```php
  OrganizationalUnit::create(['name' => 'Central Committee', 'type' => 'central']);
  // 8 divisions: Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, Mymensingh
  foreach ($divisions as $div) {
      OrganizationalUnit::create(['name' => $div, 'type' => 'division', 'parent_id' => 1]);
  }
  ```
- **Test:** `GET /api/units` → should return tree with central + 8 divisions
- **Google:** `bangladesh 8 divisions list`
- [ ] Done

---

### Task 10 — Create Role Seeder
- **What:** Seed standard roles for all unit types (Central, Division, District, Campus)
- **Why:** Admin can add custom roles, but standard NDM roles should exist from day 1
- **How:** See `RoleSeeder` in main blueprint — create ~19 standard roles across all unit types
- **Test:** `GET /api/admin/roles` (as admin) → should list all seeded roles
- **Google:** `laravel seeder factory order dependency`
- [ ] Done

---

## Phase 2 — Authentication (Tasks 11–18)

---

### Task 11 — Implement User Model for JWT
- **What:** Make `User` model implement `JWTSubject` interface
- **Why:** `tymon/jwt-auth` requires the model to provide `getJWTIdentifier()` and `getJWTCustomClaims()`
- **How:**
  ```php
  class User extends Authenticatable implements JWTSubject {
      public function getJWTIdentifier(): mixed { return $this->getKey(); }
      public function getJWTCustomClaims(): array { return ['user_type' => $this->user_type]; }
  }
  ```
- **Test:** `php artisan tinker` → `JWTAuth::fromUser(User::first())` should return a token string
- **Google:** `tymon jwtsubject laravel 11`
- [ ] Done

---

### Task 12 — Create RegisterRequest Validation
- **What:** Create `app/Http/Requests/RegisterRequest.php` with all registration field rules
- **Why:** Laravel Form Requests centralise validation and auto-return 422 on failure
- **How:** Rules: `email` → unique, `password` → min:8|confirmed, `full_name` → required, etc.
- **Test:** POST with missing `email` → should return `422` with `errors.email` field
- **Google:** `laravel form request validation 422 response`
- [ ] Done

---

### Task 13 — Implement MemberIdService
- **What:** Build the atomic year-sequential member ID generator
- **Why:** Member IDs like `20261`, `20262` must be unique and sequential per year, even under concurrent requests
- **How:** Use `DB::transaction()` with MySQL `INSERT ... ON DUPLICATE KEY UPDATE` on `member_id_sequences` table
- **Test:** Call `generate()` 5 times in a loop → should produce `20261, 20262, 20263, 20264, 20265`
- **Google:** `mysql insert on duplicate key update atomic counter`
- [ ] Done

---

### Task 14 — Implement AuthController::register()
- **What:** Create the user + member records, generate member ID, return 201
- **Why:** This is the entry point for all new student members
- **How:** Use `RegisterRequest`, `MemberIdService::generate()`, `User::create()`, `Member::create()`
- **Test:** POST `/api/auth/register` with valid body → 201 response with `member_id` like `"20261"`
- **Google:** `laravel 11 api controller json response`
- [ ] Done

---

### Task 15 — Implement AuthController::login()
- **What:** Validate credentials, check member status, return JWT on success
- **Why:** Non-active members (pending, suspended, expelled) must be blocked from login
- **How:** `JWTAuth::attempt()`, check `$member->status->canLogin()`, invalidate token if not active
- **Test 1:** Login with pending member → 403
- **Test 2:** Login with active member → 200 with `access_token`
- **Google:** `tymon jwtauth attempt invalidate token`
- [ ] Done

---

### Task 16 — Implement AdminMiddleware
- **What:** Create middleware that blocks non-admin users from admin routes
- **Why:** All `/admin/*` routes must only be accessible to `user_type = admin`
- **How:** Check `auth()->user()->user_type !== 'admin'` → return 403 JSON
  Register alias `'admin'` in `bootstrap/app.php`
- **Test:** Call `GET /api/admin/members` with member JWT → should return 403
- **Google:** `laravel 11 middleware alias bootstrap app.php`
- [ ] Done

---

### Task 17 — Implement AuthController::logout() and refresh()
- **What:** Invalidate current token on logout, issue new token on refresh
- **Why:** JWT doesn't expire on its own — logout must blacklist the token
- **How:**
  ```php
  JWTAuth::invalidate(JWTAuth::getToken());  // logout
  JWTAuth::refresh();                         // refresh
  ```
  Enable token blacklisting in `config/jwt.php`: `'blacklist_enabled' => true`
- **Test:** Login → get token → logout → use same token → should return 401
- **Google:** `tymon jwt blacklist token logout laravel`
- [ ] Done

---

### Task 18 — Write Auth Feature Tests
- **What:** Write Pest tests for registration, login (active/pending), logout
- **Why:** Prevent regressions — auth is the most critical module
- **How:**
  ```bash
  php artisan make:test AuthTest
  ```
  Write tests for: register success, duplicate email, pending login block, active login success, logout
- **Test:** `php artisan test --filter AuthTest` → all pass
- **Google:** `pest php laravel feature test json response`
- [ ] Done

---

## Phase 3 — Member Profile (Tasks 19–27)

---

### Task 19 — Create MemberPublicResource
- **What:** API Resource that exposes safe public data for a member profile
- **Why:** Never expose internal DB fields (user_id, approved_by, nid_or_bc) to the public
- **How:** Include: `member_id, full_name, institution, join_year, photo_url, unit, positions`
- **Test:** `GET /api/members/20261` → response should NOT contain `user_id` or `password`
- **Google:** `laravel api resource hide fields conditional loading`
- [ ] Done

---

### Task 20 — Create MemberResource (Private)
- **What:** Full API Resource for authenticated member's own profile
- **Why:** Members can see their own sensitive fields (email, phone, address, etc.)
- **How:** Extend `JsonResource`, include all fillable fields plus `status_label`
- **Test:** `GET /api/members/me` with own JWT → should show all personal fields
- **Google:** `laravel resource whenLoaded relationship`
- [ ] Done

---

### Task 21 — Implement ProfileController::me()
- **What:** Return the authenticated member's full profile
- **Why:** Members need to view their own data after login
- **How:** `auth()->user()->member->load(['unit', 'positions.role', 'positions.unit'])`
- **Test:** `GET /api/members/me` with valid JWT → full profile with positions
- **Google:** `laravel eager loading multiple levels`
- [ ] Done

---

### Task 22 — Implement ProfileController::update()
- **What:** Allow members to update their own profile fields
- **Why:** Members' contact info, institution, and address change over time
- **How:** Create `UpdateProfileRequest` — allow: `full_name, phone, present_address, institution, department`. Block: `member_id, status, join_year`
- **Test:** PUT `/api/members/me` with `{"phone": "01799999999"}` → profile updated
- **Google:** `laravel form request only validated fields`
- [ ] Done

---

### Task 23 — Create PhotoService
- **What:** Handle photo upload, validation, storage, and old photo deletion
- **Why:** Centralise photo logic — used by both member self-upload and admin edit
- **How:** `Storage::disk('public')->put()`, validate mime type, max 2MB, delete old photo if exists
- **Test:** Upload a valid JPG → returns `photo_url`. Upload a PDF → returns 422
- **Google:** `laravel storage disk public upload validation`
- [ ] Done

---

### Task 24 — Implement Photo Upload Endpoint
- **What:** `POST /api/members/me/photo` — accept multipart/form-data photo upload
- **Why:** Member profiles need a photo to appear in the public directory
- **How:** `$request->validate(['photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048'])` → `PhotoService::upload()`
- **Test:** Upload photo → `photo_url` returned and accessible in browser
- **Google:** `laravel multipart file upload storage link`
- [ ] Done

---

### Task 25 — Implement MemberController::publicProfile()
- **What:** `GET /api/members/{member_id}` — show public profile with positions
- **Why:** Publicly accessible — anyone can look up a member by their ID
- **How:** Query by `member_id` string field, only show `status = active`, load positions and unit
- **Test:** Active member → 200 with full profile. Pending member → 404
- **Google:** `laravel route parameter model binding custom column`
- [ ] Done

---

### Task 26 — Implement Member Search
- **What:** `GET /api/members/search?q=ahmed&unit_id=5` — search active members
- **Why:** Directory users and admins need to find members quickly
- **How:** Full-text LIKE search on `full_name, member_id, institution`. Filter by `unit_id` if provided
- **Test:** `GET /api/members/search?q=ahmed` → returns matching active members
- **Google:** `laravel where like search paginate`
- [ ] Done

---

### Task 27 — Write Member Feature Tests
- **What:** Tests for public profile, search, own profile, photo upload
- **Why:** Profile module is used by members daily — must be bug-free
- **How:** Mock photo upload with `UploadedFile::fake()->image()`. Test 404 for pending members
- **Test:** `php artisan test --filter MemberTest` → all pass
- **Google:** `pest laravel uploadedfile fake image test`
- [ ] Done

---

## Phase 4 — Admin Member Management (Tasks 28–37)

---

### Task 28 — Implement AdminMemberController::index()
- **What:** `GET /api/admin/members` — paginated list with filters
- **Why:** Admins need to manage hundreds of members efficiently
- **How:** Accept query params: `status, unit_id, unit_type, join_year, search, sort_by, sort_dir, per_page`
- **Test:** `GET /api/admin/members?status=pending` → only pending members returned
- **Google:** `laravel query builder where filter paginate`
- [ ] Done

---

### Task 29 — Implement AdminMemberController::pending()
- **What:** `GET /api/admin/members/pending` — all pending approval queue
- **Why:** Admin's most important daily task is reviewing new registrations
- **How:** `Member::pending()->with(['unit'])->latest()->paginate(20)`
- **Test:** Register 3 members → pending endpoint should return all 3
- **Google:** `laravel scope query paginate`
- [ ] Done

---

### Task 30 — Implement AdminMemberController::approve()
- **What:** `POST /api/admin/members/{id}/approve` — approve pending member
- **Why:** Core workflow: no member can participate until admin approves
- **How:** Check `status === pending` → update to `active`, set `approved_by`, `approved_at`
- **Test:** Approve pending member → login with their credentials → should succeed now
- **Google:** `laravel update model multiple fields`
- [ ] Done

---

### Task 31 — Implement AdminMemberController::reject()
- **What:** `POST /api/admin/members/{id}/reject` — delete rejected registration
- **Why:** Spam/fake registrations should be cleanly removed
- **How:** Delete `user` record → CASCADE deletes `member` record too
- **Test:** Reject member → user and member records should be gone from DB
- **Google:** `laravel cascade delete relationship`
- [ ] Done

---

### Task 32 — Implement AdminMemberController::suspend()
- **What:** `POST /api/admin/members/{id}/suspend` — suspend active member
- **Why:** Disciplinary action — member blocked from login, positions removed
- **How:** Update `status = suspended` → call `deactivateAllPositions()`
- **Test:** Suspend member with active position → login blocked, position count = 0
- **Google:** `laravel update status revoke positions`
- [ ] Done

---

### Task 33 — Implement AdminMemberController::expel()
- **What:** `POST /api/admin/members/{id}/expel` — permanently expel member
- **Why:** Strongest disciplinary action — member removed from all roles
- **How:** Same as suspend but `status = expelled`
- **Test:** Expel → all positions deactivated → `position_history` records with action `relieved`
- **Google:** `laravel mass update related records`
- [ ] Done

---

### Task 34 — Implement Member::deactivateAllPositions()
- **What:** Helper method on Member model to deactivate all active positions and write history
- **Why:** Used by both suspend and expel — keeps logic DRY
- **How:**
  ```php
  $this->positions()->update(['is_active' => 0, 'relieved_at' => now()]);
  // Insert history records for each deactivated position
  ```
- **Test:** Member with 3 positions → call method → 0 active positions, 3 history records
- **Google:** `laravel model helper method bulk update`
- [ ] Done

---

### Task 35 — Implement AdminMemberController::update()
- **What:** `PUT /api/admin/members/{id}` — admin edit of member data
- **Why:** Admins can fix typos or update member info that member cannot change themselves
- **How:** Allow updating: `full_name, institution, department, organizational_unit_id` etc.
- **Test:** Admin updates member's `institution` → change reflected in profile
- **Google:** `laravel admin update model fillable`
- [ ] Done

---

### Task 36 — Implement AdminMemberController::destroy()
- **What:** `DELETE /api/admin/members/{id}` — hard delete member
- **Why:** Permanent removal (for test accounts, duplicates, etc.)
- **How:** Delete `user` → CASCADE handles member + positions
- **Test:** Delete member → all DB records gone including positions and history
- **Google:** `laravel delete cascade all related records`
- [ ] Done

---

### Task 37 — Write Admin Member Feature Tests
- **What:** Tests for all admin member actions: list, approve, reject, suspend, expel
- **Why:** These actions have serious side effects — must be regression-tested
- **How:** Create test admin user, create members in various states, test each action
- **Test:** `php artisan test --filter AdminMemberTest` → all pass
- **Google:** `pest laravel actingas admin test`
- [ ] Done

---

## Phase 5 — Role Management (Tasks 38–45)

---

### Task 38 — Implement RoleController::index()
- **What:** `GET /api/admin/roles` — list all active roles grouped by unit type
- **Why:** Admins need to see what roles exist before assigning positions
- **How:** `Role::active()->orderBy('unit_type')->orderBy('rank_order')->get()`
- **Test:** After seeding → 19+ roles returned, sorted by unit type and rank
- **Google:** `laravel orderby multiple columns`
- [ ] Done

---

### Task 39 — Implement RoleController::store()
- **What:** `POST /api/admin/roles` — create new custom role
- **Why:** NDM can create roles like "Sports Secretary" beyond the standard set
- **How:** `CreateRoleRequest` validates: `title, unit_type (enum), rank_order`. Store with `created_by = auth()->id()`
- **Test:** Create role `{"title": "Sports Secretary", "unit_type": "campus", "rank_order": 5}` → 201
- **Google:** `laravel store model set admin created by`
- [ ] Done

---

### Task 40 — Implement RoleController::update()
- **What:** `PUT /api/admin/roles/{id}` — update role title or rank
- **Why:** Role names and priorities may change over time
- **How:** Allow: `title, rank_order, description`. Block: `unit_type` (changing type breaks existing assignments)
- **Test:** Update rank_order → reflected in directory sort order
- **Google:** `laravel update specific fields only`
- [ ] Done

---

### Task 41 — Implement RoleController::destroy()
- **What:** `DELETE /api/admin/roles/{id}` — soft deactivate (not hard delete)
- **Why:** Hard-deleting roles would break position history records
- **How:** `Role::findOrFail($id)->update(['is_active' => 0])`
- **Test:** Deactivate role → existing positions still show in history, but role unavailable for new assignments
- **Google:** `laravel soft delete alternative boolean flag`
- [ ] Done

---

### Task 42 — Validate Role Unit Type in PromotePositionRequest
- **What:** Add custom validation rule that checks role's unit_type matches unit's type
- **Why:** "Campus President" role cannot be assigned at division level
- **How:** Add `after()` hook in PromotePositionRequest or move to PositionService (preferred)
- **Test:** Assign campus role to a district unit → 422 validation error
- **Google:** `laravel custom validation rule after validate`
- [ ] Done

---

### Task 43 — Add Role RoleResource
- **What:** Create `app/Resources/RoleResource.php` for consistent role JSON output
- **Why:** All API responses should use Resource classes for consistency
- **How:** Include: `id, title, unit_type, unit_type_label, rank_order, description, is_active`
- **Test:** `GET /api/admin/roles` → all items have `unit_type_label` (e.g. "Campus / Institution")
- **Google:** `laravel api resource computed field`
- [ ] Done

---

### Task 44 — Seed Default Roles for All Unit Types
- **What:** Complete `RoleSeeder` with all standard NDM roles for all 7 unit types
- **Why:** System is not usable without base roles
- **How:** Seed roles for: central (11), division (5), district (6), upazila (4), union (3), ward (2), campus (4) = 35+ roles
- **Test:** After seed → `Role::count()` ≥ 35
- **Google:** `laravel seeder factory insert multiple records`
- [ ] Done

---

### Task 45 — Write Role Feature Tests
- **What:** Tests for creating, updating, deactivating roles via admin API
- **Why:** Role management is foundational — breaking it breaks promotion
- **How:** Test role creation for valid/invalid unit types, test deactivation
- **Test:** `php artisan test --filter RoleTest` → all pass
- **Google:** `pest laravel json post assert created`
- [ ] Done

---

## Phase 6 — Position & Promotion (Tasks 46–57)

---

### Task 46 — Create PositionService
- **What:** Service class encapsulating all promote / relieve / transfer business logic
- **Why:** Services keep controllers thin and logic testable in isolation
- **How:** See `PositionService.php` in blueprint — includes all 3 rules, auto-relieve, and history write
- **Test:** Call `promote()` in unit test → returns MemberPosition with correct member/role/unit
- **Google:** `laravel service class pattern dependency injection`
- [ ] Done

---

### Task 47 — Implement PositionService::promote()
- **What:** Core method: validate member active, validate role/unit type match, relieve existing, assign new
- **Why:** This is the most business-critical operation in the system
- **How:**
  1. Check `member->status === active` → throw ValidationException if not
  2. Check `role->unit_type === unit->type` → throw ValidationException if not
  3. Find and deactivate existing position holder
  4. Create new MemberPosition
  5. Write PositionHistory record
- **Test:** See PositionTest.php in blueprint — test all 3 rules + auto-relieve
- **Google:** `laravel validation exception custom message service`
- [ ] Done

---

### Task 48 — Implement PositionController::promote()
- **What:** `POST /api/admin/positions/promote` — thin controller calling PositionService
- **Why:** Controller should only parse request and return response
- **How:** Accept `PromotePositionRequest`, call `$this->positionService->promote()`, return 201
- **Test:** Full integration test: create active member, role, unit → promote → 201 + position in DB
- **Google:** `laravel controller service injection constructor`
- [ ] Done

---

### Task 49 — Implement PositionService::relieve()
- **What:** Deactivate a specific position and write history
- **Why:** Members need to be removable from positions (resignation, removal, election)
- **How:** `MemberPosition::findOrFail()` → `update(['is_active' => 0, 'relieved_at' => now()])` → write history
- **Test:** Relieve position → `MemberPosition::active()->find($id)` returns null
- **Google:** `laravel update timestamp field`
- [ ] Done

---

### Task 50 — Implement PositionService::transfer()
- **What:** Move member from one unit to another (same role)
- **Why:** Members can be transferred from one campus to another, for example
- **How:** Relieve from current unit → promote in new unit → write "transferred" history
- **Test:** Transfer campus president from Unit A to Unit B → active in B, inactive in A
- **Google:** `laravel transaction multiple db operations`
- [ ] Done

---

### Task 51 — Implement PositionController::index()
- **What:** `GET /api/admin/positions` — paginated list of all active positions
- **Why:** Admin overview of who currently holds what position where
- **How:** Eager load `member, role, unit` with pagination
- **Test:** 5 active positions → endpoint returns exactly 5 items
- **Google:** `laravel eager load paginate with`
- [ ] Done

---

### Task 52 — Implement PositionController::history()
- **What:** `GET /api/admin/positions/history` — full audit trail of all actions
- **Why:** Accountability — who assigned/relieved whom, and when
- **How:** `PositionHistory::with(['member', 'role', 'unit', 'performedBy'])->orderByDesc('performed_at')->paginate(30)`
- **Test:** After promote + relieve → history has 2 records for that member
- **Google:** `laravel audit trail history table`
- [ ] Done

---

### Task 53 — Implement PositionController::memberHistory()
- **What:** `GET /api/admin/positions/{member_id}` — all history for one member
- **Why:** Track individual member's career path within the organization
- **How:** Filter history by `member_id`, ordered by `performed_at DESC`
- **Test:** Member assigned then relieved then assigned again → 3 history records returned
- **Google:** `laravel where member history ordered`
- [ ] Done

---

### Task 54 — Enforce Expelled/Suspended Member Position Revocation
- **What:** When admin suspends or expels member, all their active positions must be automatically deactivated
- **Why:** Suspended members should have no active presence in the directory
- **How:** Already implemented in `Member::deactivateAllPositions()` — call from `AdminMemberController::suspend/expel`
- **Test:** Suspend member with 2 active positions → `member->positions()->count()` = 0, history shows 2 relieved
- **Google:** `laravel observer model event suspend deactivate`
- [ ] Done

---

### Task 55 — Add PositionResource
- **What:** `app/Resources/PositionResource.php` for consistent position JSON output
- **Why:** Positions appear in multiple API responses — keep format consistent
- **How:** Include: `id, member (id + name + photo), role (title + rank_order), unit (name + type), assigned_at, is_active`
- **Test:** `GET /api/admin/positions` → each item has `member.member_id` and `role.rank_order`
- **Google:** `laravel nested resource json output`
- [ ] Done

---

### Task 56 — Add UnitResource
- **What:** `app/Resources/UnitResource.php` for organizational unit JSON output
- **Why:** Units appear in member profiles, directories, and admin responses
- **How:** Include: `id, name, type, type_label, code, parent (id + name), children_count`
- **Test:** `GET /api/units` → each unit has `type_label` like "Campus / Institution"
- **Google:** `laravel api resource withCount`
- [ ] Done

---

### Task 57 — Write Position Feature Tests
- **What:** Tests for promote, relieve, transfer, auto-relieve, pending-block, unit-type mismatch
- **Why:** Business rules are most critical in the position module
- **How:** See `PositionTest.php` in blueprint
- **Test:** `php artisan test --filter PositionTest` → all pass
- **Google:** `pest php test service class unit test`
- [ ] Done

---

## Phase 7 — Organizational Units (Tasks 58–63)

---

### Task 58 — Implement OrganizationalUnitController::index()
- **What:** `GET /api/units` — return full tree of all active units
- **Why:** Mobile apps and frontends need the full hierarchy to build dropdowns
- **How:** Load root units (no parent) with recursive `allChildren` relationship
- **Test:** Returns tree starting with "Central Committee" → 8 division children
- **Google:** `laravel recursive relationship with eager loading`
- [ ] Done

---

### Task 59 — Implement OrganizationalUnitController::byType()
- **What:** `GET /api/units/{type}` — flat list of units of a specific type
- **Why:** Registration form needs list of all campuses, or all districts, etc.
- **How:** `OrganizationalUnit::where('type', $type)->where('is_active', 1)->get()`
- **Test:** `GET /api/units/division` → returns 8 division units
- **Google:** `laravel route parameter enum validate`
- [ ] Done

---

### Task 60 — Implement OrganizationalUnitController::store()
- **What:** `POST /api/admin/units` — admin creates a new unit
- **Why:** New campuses, wards, and unions need to be added over time
- **How:** Validate `name, type, parent_id, code (unique)` → create record
- **Test:** Create new campus unit → appears in `GET /api/units/campus`
- **Google:** `laravel create nested hierarchical record`
- [ ] Done

---

### Task 61 — Implement Unit Update and Deactivate
- **What:** `PUT /api/admin/units/{id}` and `DELETE /api/admin/units/{id}`
- **Why:** Unit names change (e.g. college renamed), units may be closed
- **How:** Update: allow `name, code, description, parent_id`. Delete: soft `is_active = 0`
- **Test:** Deactivate unit → does NOT appear in public `GET /api/units`
- **Google:** `laravel update hide inactive records`
- [ ] Done

---

### Task 62 — Validate Parent Unit Type Compatibility
- **What:** When creating a district unit, enforce that parent must be a division unit
- **Why:** District cannot be child of campus — hierarchy must be logical
- **How:** Add validation in `CreateUnitRequest`: lookup parent, check types are compatible
  ```
  central → no parent
  division → parent must be central
  district → parent must be division
  upazila → parent must be district
  ...
  ```
- **Test:** Create district with a campus as parent → 422 error
- **Google:** `laravel conditional validation rule closure`
- [ ] Done

---

### Task 63 — Write Unit Feature Tests
- **What:** Tests for create, list, filter by type, deactivate
- **Why:** Units are foundational — all members and positions reference them
- **How:** Test valid/invalid parent types, test inactive filtering
- **Test:** `php artisan test --filter UnitTest` → all pass
- **Google:** `pest laravel assert json structure`
- [ ] Done

---

## Phase 8 — Public Directory (Tasks 64–69)

---

### Task 64 — Implement DirectoryController::central()
- **What:** `GET /api/directory/central` — list all central committee members with positions
- **Why:** The most viewed page — public face of NDM student wing leadership
- **How:** Find central unit → load active positions with member + role, sort by `rank_order`
- **Test:** After promoting members to central committee → endpoint shows them sorted by rank
- **Google:** `laravel sort collection by relationship field`
- [ ] Done

---

### Task 65 — Implement DirectoryController::byUnit()
- **What:** `GET /api/directory/{unit_id}` — committee listing for any unit
- **Why:** Campus, district, division committees need separate public pages
- **How:** Reuse private `unitDirectory()` helper from DirectoryController
- **Test:** Division unit with 3 assigned positions → returns all 3 with photos and roles
- **Google:** `laravel private method reuse controller`
- [ ] Done

---

### Task 66 — Implement DirectoryController::index()
- **What:** `GET /api/directory` — overview of all units with member counts
- **Why:** Landing page for directory — shows which units are active
- **How:** `OrganizationalUnit::withCount(['positions' => fn($q) => $q->where('is_active', 1)])->get()`
- **Test:** After adding positions to 3 units → each shows correct `positions_count`
- **Google:** `laravel withcount conditional relationship`
- [ ] Done

---

### Task 67 — Add Photo Placeholder for Members Without Photo
- **What:** Return a default/placeholder image URL when `photo_path` is null
- **Why:** Members without photos should still appear in the directory gracefully
- **How:** In `MemberPublicResource` or `getPhotoUrlAttribute()`:
  ```php
  return $this->photo_path
      ? asset('storage/' . $this->photo_path)
      : asset('images/default-avatar.png');
  ```
- **Test:** Member without photo → `photo_url` returns placeholder, not null
- **Google:** `laravel asset default image placeholder`
- [ ] Done

---

### Task 68 — Cache Central Committee Response
- **What:** Cache `GET /api/directory/central` for 5 minutes using Laravel Cache
- **Why:** Most viewed endpoint — caching reduces DB load significantly
- **How:**
  ```php
  return Cache::remember('directory.central', 300, function () {
      return $this->unitDirectory($centralUnitId);
  });
  ```
  Flush cache on any position change.
- **Test:** Hit endpoint twice rapidly → second hit faster, same data
- **Google:** `laravel cache remember flush tags`
- [ ] Done

---

### Task 69 — Write Directory Feature Tests
- **What:** Tests for central directory, unit directory, index with counts
- **Why:** Public-facing — must always work correctly
- **How:** Create positions, test sort order by rank_order, test no photo member handling
- **Test:** `php artisan test --filter DirectoryTest` → all pass
- **Google:** `pest laravel assert json path nested`
- [ ] Done

---

## Phase 9 — Error Handling & Polish (Tasks 70–79)

---

### Task 70 — Customize Exception Handler for JSON
- **What:** Override `bootstrap/app.php` exception handling to always return JSON
- **Why:** Default Laravel returns HTML for 404, 500 etc. — API must return JSON
- **How:**
  ```php
  ->withExceptions(function (Exceptions $exceptions) {
      $exceptions->render(function (NotFoundHttpException $e, Request $request) {
          return response()->json(['success' => false, 'error' => 'Resource not found.'], 404);
      });
  })
  ```
- **Test:** `GET /api/nonexistent-route` → JSON 404, not HTML
- **Google:** `laravel 11 exception handler always json api`
- [ ] Done

---

### Task 71 — Handle Validation Errors Consistently
- **What:** Ensure all 422 validation errors follow `{success, error, errors}` structure
- **Why:** Frontend depends on consistent error format for all fields
- **How:** In exception handler, catch `ValidationException` → format errors as JSON
- **Test:** Submit registration without email → 422 with `errors.email` array
- **Google:** `laravel validation exception json format`
- [ ] Done

---

### Task 72 — Handle Unauthenticated Requests
- **What:** Return JSON 401 for missing/expired JWT — not redirect to login page
- **Why:** API clients get HTML redirects by default in Laravel — must be JSON
- **How:** In exception handler, catch `AuthenticationException` → return JSON 401
- **Test:** Call `GET /api/members/me` without token → JSON `{success: false, error: "Unauthenticated"}`
- **Google:** `laravel api unauthenticated json 401 exception`
- [ ] Done

---

### Task 73 — Add Request Rate Limiting
- **What:** Limit API calls to 60/min for public, 300/min for authenticated users
- **Why:** Prevent brute-force attacks and API abuse
- **How:** In `bootstrap/app.php`:
  ```php
  RateLimiter::for('api', function (Request $request) {
      return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
  });
  ```
- **Test:** Hit endpoint 61 times in a minute → 62nd returns 429
- **Google:** `laravel 11 rate limiter per minute by user`
- [ ] Done

---

### Task 74 — Add Request Logging Middleware
- **What:** Log every incoming API request (method, path, user, response time)
- **Why:** Debugging and monitoring in production
- **How:** Create `LogRequestMiddleware` that logs to `storage/logs/api.log` using `Log::channel('api')`
- **Test:** Make a request → check `storage/logs/api.log` for entry
- **Google:** `laravel custom log channel daily api requests`
- [ ] Done

---

### Task 75 — Add API Response Helper / Trait
- **What:** Create `ApiResponseTrait` with `success()`, `error()`, `paginated()` methods
- **Why:** Keep all controllers using identical JSON response format
- **How:**
  ```php
  trait ApiResponseTrait {
      protected function success($data, int $code = 200): JsonResponse {
          return response()->json(['success' => true, 'data' => $data], $code);
      }
      protected function error(string $msg, int $code = 400): JsonResponse {
          return response()->json(['success' => false, 'error' => $msg], $code);
      }
  }
  ```
- **Test:** All controllers using trait → consistent JSON structure across all endpoints
- **Google:** `laravel controller trait json response helper`
- [ ] Done

---

### Task 76 — Add Admin Activity Log
- **What:** Log every admin action (approve, expel, promote) to a separate `admin_logs` table or file
- **Why:** Accountability — which admin did what and when
- **How:** Create `AdminLog` model + migration. Write log entry in each admin action method.
- **Test:** Approve a member → admin_logs table has 1 record with action type and admin id
- **Google:** `laravel audit log admin action db table`
- [ ] Done

---

### Task 77 — Validate Photo File Size Server-Side
- **What:** Ensure `UPLOAD_MAX_SIZE` env var is enforced even if PHP config is different
- **Why:** PHP `upload_max_filesize` in php.ini may allow large files — application should still enforce 2MB
- **How:** Add custom validation rule in photo upload: `max:2048` (KB in Laravel rules = 2MB)
  Also check `$file->getSize() <= config('app.upload_max_size')`
- **Test:** Upload 3MB file → 422. Upload 1MB file → 200
- **Google:** `laravel file validation max size custom`
- [ ] Done

---

### Task 78 — Add Member ID Year-Boundary Test
- **What:** Ensure member IDs reset sequence correctly when year changes
- **Why:** First member of 2027 should be `20271`, not continue from 2026 count
- **How:** Unit test MemberIdService with year = 2025 (5 members), then year = 2026 → should start at `20261`
- **Test:** `generate(2025)` × 3 = 20251, 20252, 20253. `generate(2026)` = 20261
- **Google:** `php unit test year boundary sequence counter`
- [ ] Done

---

### Task 79 — Add Member Status Transition Validation
- **What:** Prevent invalid status transitions (e.g. can't re-approve an active member)
- **Why:** Status must follow logical path: pending → active → suspended/expelled
- **How:** In each admin action, check current status before allowing change
  ```php
  if ($member->status !== MemberStatus::PENDING) {
      return $this->error('Member is not pending.', 409);
  }
  ```
- **Test:** Approve active member → 409 Conflict response
- **Google:** `laravel state machine status transition check`
- [ ] Done

---

## Phase 10 — Testing (Tasks 80–90)

---

### Task 80 — Configure Pest PHP Testing
- **What:** Set up Pest as the test runner with Laravel plugin
- **Why:** Pest provides cleaner syntax than PHPUnit and better output
- **How:**
  ```bash
  composer require pestphp/pest --dev
  composer require pestphp/pest-plugin-laravel --dev
  php artisan pest:install
  ```
  Configure `phpunit.xml` to use test database
- **Test:** `php artisan test` → all default tests pass
- **Google:** `pest php laravel 11 install configure`
- [ ] Done

---

### Task 81 — Create Test Database Configuration
- **What:** Configure a separate SQLite in-memory or MySQL test DB
- **Why:** Tests should not touch production data
- **How:** In `phpunit.xml`:
  ```xml
  <env name="DB_CONNECTION" value="sqlite"/>
  <env name="DB_DATABASE" value=":memory:"/>
  ```
  Use `RefreshDatabase` trait in all Feature tests
- **Test:** Tests run without affecting the main database
- **Google:** `laravel pest sqlite memory test database`
- [ ] Done

---

### Task 82 — Create Model Factories
- **What:** Create Factories for: User, Member, Role, OrganizationalUnit, MemberPosition
- **Why:** Factories generate fake test data — tests should not rely on seeder data
- **How:**
  ```bash
  php artisan make:factory MemberFactory
  php artisan make:factory OrganizationalUnitFactory
  ```
  Add `.active()`, `.pending()` states to MemberFactory
- **Test:** `Member::factory()->active()->create()` → creates active member in test DB
- **Google:** `laravel factory state active pending`
- [ ] Done

---

### Task 83 — Write MemberIdService Unit Tests
- **What:** Test that IDs generate correctly, increment, and year-boundary resets work
- **Why:** MemberIdService is atomic and tricky — unit tests catch concurrency bugs
- **How:** Test: first call returns `{year}1`, 5th call returns `{year}5`, new year returns `{year+1}1`
- **Test:** `php artisan test --filter MemberIdServiceTest` → all pass
- **Google:** `pest unit test service class laravel`
- [ ] Done

---

### Task 84 — Write PositionService Unit Tests
- **What:** Unit test all 3 business rules in isolation
- **Why:** Service tests run faster than feature tests and pinpoint exact failures
- **How:** Mock Member, Role, OrganizationalUnit models. Test each rule throws correct exception
- **Test:** `php artisan test --filter PositionServiceTest` → all pass
- **Google:** `pest mock model laravel unit test`
- [ ] Done

---

### Task 85 — Write Full Registration → Approval → Login Flow Test
- **What:** End-to-end integration test of the complete member lifecycle
- **Why:** Most critical user journey — must always work
- **How:**
  ```php
  it('completes full member lifecycle', function () {
      $res = $this->postJson('/api/auth/register', [...]);
      $res->assertStatus(201);
      $memberId = $res->json('data.member_id');

      // Login blocked while pending
      $this->postJson('/api/auth/login', [...])->assertStatus(403);

      // Admin approves
      $admin = loginAsAdmin();
      $this->actingAs($admin)->postJson("/api/admin/members/1/approve")->assertStatus(200);

      // Login now succeeds
      $this->postJson('/api/auth/login', [...])->assertStatus(200)
           ->assertJsonStructure(['data' => ['access_token']]);
  });
  ```
- **Test:** Full flow test passes
- **Google:** `pest laravel full integration test lifecycle`
- [ ] Done

---

### Task 86 — Write Full Promote → Relieve → History Flow Test
- **What:** Integration test for position lifecycle
- **Why:** Verify auto-relieve, history recording, and concurrent assignment handling
- **How:** Create active member, assign position, check directory, relieve, verify history count = 2
- **Test:** All assertions pass in single test
- **Google:** `pest laravel assertDatabaseHas position`
- [ ] Done

---

### Task 87 — Write Directory Public Tests
- **What:** Test public directory endpoints without any authentication
- **Why:** Directory is unauthenticated — must be accessible and correct
- **How:** Create unit, create role, promote member → check directory returns correct structure
- **Test:** `GET /api/directory/central` returns positions sorted by `rank_order`
- **Google:** `pest php assert json array sorted`
- [ ] Done

---

### Task 88 — Write Photo Upload Tests
- **What:** Test photo upload with valid image and invalid file types
- **Why:** Photo upload is used by all members — must be reliable
- **How:**
  ```php
  $file = UploadedFile::fake()->image('photo.jpg', 400, 400);
  $this->actingAs($member)->postJson('/api/members/me/photo', ['photo' => $file])
       ->assertStatus(200)
       ->assertJsonPath('photo_url', fn($url) => str_contains($url, 'storage/photos'));
  ```
- **Test:** Valid → 200. PDF → 422. 3MB file → 422
- **Google:** `laravel pest fake upload file test`
- [ ] Done

---

### Task 89 — Run Full Test Suite and Fix All Failures
- **What:** Execute `php artisan test` and ensure 100% pass rate
- **Why:** No failing tests before deployment
- **How:** Run `php artisan test --coverage` → fix any failures → ensure coverage > 80%
- **Test:** Zero failures, >80% coverage
- **Google:** `laravel pest code coverage html report`
- [ ] Done

---

### Task 90 — Write Admin Role and Unit Tests
- **What:** Tests for role CRUD, unit CRUD, and unit type compatibility validation
- **Why:** These admin tools are used constantly — regressions are costly
- **How:** Test: create role, deactivate role (positions still in history), create unit with invalid parent type
- **Test:** `php artisan test --filter RoleTest` and `UnitTest` → all pass
- **Google:** `laravel pest database assertion after route`
- [ ] Done

---

## Phase 11 — Deployment & Final Polish (Tasks 91–100)

---

### Task 91 — Configure Production `.env`
- **What:** Set all production environment variables correctly
- **Why:** Wrong config in production = data loss, security breach, or downtime
- **How:** Set `APP_ENV=production`, `APP_DEBUG=false`, strong `JWT_SECRET`, `DB_PASSWORD`, correct `APP_URL`
  Never commit `.env` to git — only commit `.env.example`
- **Test:** `php artisan config:show` → check all values
- **Google:** `laravel production env checklist deployment`
- [ ] Done

---

### Task 92 — Add Storage Link for Photos
- **What:** Create symbolic link from `public/storage` → `storage/app/public`
- **Why:** Without this, uploaded photos are not accessible via URL
- **How:** `php artisan storage:link`
- **Test:** Upload photo → access `https://api.ndmstudent.org/storage/photos/filename.jpg` → shows image
- **Google:** `laravel storage link public disk`
- [ ] Done

---

### Task 93 — Production Caching
- **What:** Cache config, routes, and views for performance
- **Why:** File-based config parsing is slow — caching removes this overhead
- **How:**
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan event:cache
  ```
  Clear with `php artisan optimize:clear` after code changes
- **Test:** API response time < 50ms for simple GET requests
- **Google:** `laravel production optimize cache commands`
- [ ] Done

---

### Task 94 — Configure Queue for Async Jobs
- **What:** Set up a queue worker for background jobs (email notifications, logs)
- **Why:** Sending email synchronously in a web request blocks response time
- **How:**
  ```bash
  php artisan queue:work --daemon
  ```
  In `.env`: `QUEUE_CONNECTION=redis`
- **Test:** Trigger email job → response returns immediately, email delivered in background
- **Google:** `laravel queue worker redis daemon`
- [ ] Done

---

### Task 95 — Add API Documentation (Postman Collection)
- **What:** Create a Postman collection with all 40+ endpoints, example requests and responses
- **Why:** Other developers (mobile app, frontend) need to know how to use the API
- **How:** Export from Postman as JSON → commit to `docs/NDM_API.postman_collection.json`
  Include: all headers, body examples, expected responses for each endpoint
- **Test:** Import collection → all requests work against local server
- **Google:** `postman collection export json api documentation`
- [ ] Done

---

### Task 96 — Add `README.md`
- **What:** Write comprehensive project README with setup, architecture, and API overview
- **Why:** New developers must be able to get started without asking questions
- **How:** Include: installation steps, env setup, migration, seeding, test running, endpoint overview
- **Test:** Follow README from scratch on a clean machine → system running within 10 minutes
- **Google:** `laravel api github readme template`
- [ ] Done

---

### Task 97 — Configure Web Server (Nginx)
- **What:** Configure Nginx to route all requests to `public/index.php`
- **Why:** Laravel requires this for routing — direct file access returns 404
- **How:**
  ```nginx
  server {
      root /var/www/ndm-student-wing-api/public;
      location / { try_files $uri $uri/ /index.php?$query_string; }
      location ~ \.php$ { fastcgi_pass unix:/var/run/php/php8.2-fpm.sock; }
  }
  ```
- **Test:** `curl https://api.ndmstudent.org/api/units` → returns JSON (not 404)
- **Google:** `laravel nginx configuration php-fpm production`
- [ ] Done

---

### Task 98 — Enable HTTPS / SSL
- **What:** Install SSL certificate and redirect HTTP → HTTPS
- **Why:** JWT tokens in transit must be encrypted — never over plain HTTP
- **How:** Use Let's Encrypt with Certbot:
  ```bash
  certbot --nginx -d api.ndmstudent.org
  ```
- **Test:** `http://api.ndmstudent.org` redirects to `https://` — browser shows padlock
- **Google:** `certbot nginx ssl lets encrypt ubuntu`
- [ ] Done

---

### Task 99 — Set Up Database Backups
- **What:** Automated daily MySQL backups stored securely
- **Why:** Data loss is unrecoverable — backups are critical
- **How:**
  ```bash
  # Cron job (daily at 2am)
  0 2 * * * mysqldump ndm_student_wing > /backups/ndm_$(date +\%F).sql
  ```
  Or use Laravel package `spatie/laravel-backup`
- **Test:** Run backup manually → `.sql` file created with all tables and data
- **Google:** `laravel spatie backup mysql cron job`
- [ ] Done

---

### Task 100 — Final System Smoke Test
- **What:** Full end-to-end manual test of the complete production system
- **Why:** Final validation before public launch
- **Checklist:**
  - [ ] Register new member via API → `member_id` generated correctly (e.g. `20261`)
  - [ ] Login with pending member → blocked (403)
  - [ ] Admin login → JWT received
  - [ ] Admin approves member → status = active
  - [ ] Active member logs in → JWT received
  - [ ] Member uploads photo → photo accessible via URL
  - [ ] Admin creates role: "Campus President" for `campus` unit type
  - [ ] Admin promotes member to Campus President → position active
  - [ ] `GET /api/directory/{unit_id}` → member appears with position
  - [ ] Admin promotes another member to same role → old member auto-relieved
  - [ ] `GET /api/admin/positions/history` → full audit trail visible
  - [ ] Admin suspends member → positions removed, login blocked
  - [ ] `GET /api/members/{member_id}` for suspended member → 404
  - [ ] All tests pass: `php artisan test`
  - [ ] API response times < 200ms for all endpoints
- **Test:** All checklist items pass ✅
- **Google:** `api smoke test checklist production`
- [ ] Done

---

## Summary

| Phase | Tasks | Focus |
|---|---|---|
| 1 | 1–10 | Project setup, migrations, models, seeders |
| 2 | 11–18 | JWT auth, registration, login, middleware |
| 3 | 19–27 | Member profile, photo upload, search |
| 4 | 28–37 | Admin member management (approve/suspend/expel) |
| 5 | 38–45 | Role CRUD management |
| 6 | 46–57 | Position promotion, relieve, transfer, audit |
| 7 | 58–63 | Organizational unit management |
| 8 | 64–69 | Public directory and caching |
| 9 | 70–79 | Error handling, logging, rate limiting |
| 10 | 80–90 | Full test suite (Pest PHP) |
| 11 | 91–100 | Deployment, Nginx, SSL, backups, smoke test |

**Total: 100 tasks → Complete Laravel 11 API**

---

*NDM Student Wing Management System*
*Nationalist Democratic Movement (NDM) Bangladesh*
