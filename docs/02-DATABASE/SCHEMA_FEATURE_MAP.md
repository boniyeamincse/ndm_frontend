# Schema-to-Feature Mapping

**Project:** NDSM — Nationalist Democratic Student Movement Student Wing
**Last Updated:** 2026-03-25

This table maps each database table to the business features, models, controllers, resources, and tests that rely on it.

---

## Core Tables

| Table | Model | Controller(s) | Resource(s) | Business Features | Tests |
|---|---|---|---|---|---|
| `users` | `User` | `AuthController` | — | Account creation, JWT auth, login/logout, token refresh | `AuthTest` |
| `members` | `Member` | `AdminMemberController`, `Member/ProfileController`, `MemberController` | `MemberResource`, `AdminMemberResource`, `MemberPublicResource` | Registration, admission, profile management, public directory | `MemberTest`, `RegistrationTest` |
| `member_id_sequences` | *(raw query)* | `AuthController` (via `MemberService`) | — | `NDM-SW-YYYY-XXXX` sequential ID generation — transactional, collision-safe | `MemberIdGenerationTest` |
| `organizational_units` | `OrganizationalUnit` | `OrganizationalUnitController`, `Admin/OrganizationalUnitController`, `UnitController` | `OrganizationalUnitResource` | Unit hierarchy (central → campus), unit management, member unit assignment | `UnitTest` |
| `roles` | `Role` | `Admin/RoleController` | `RoleResource` | Organizational roles by unit type, rank ordering, role CRUD | `RoleTest` |
| `permissions` | `Permission` | `Admin/RoleController` (via sync) | `PermissionResource` | Permission registry, RBAC matrix, module-level access gates | `RbacTest` |
| `role_permissions` | *(pivot)* | `Admin/RoleController` | — | Role ↔ Permission assignment, idempotent sync, privilege escalation guard | `RbacTest` |
| `member_roles` | `MemberRole` | `Admin/AdminMemberController` | — | System-level role (`general_member`/`organizer`/`admin`) assigned per member | `MemberRoleTest` |
| `member_positions` | `MemberPosition` | `Admin/PositionController` | `PositionResource` | Promote, relieve, transfer, active position queries, position history | `PositionTest` |
| `position_history` | `PositionHistory` | `Admin/PositionController` | — | Immutable audit trail for all position state changes | `PositionTest` |
| `member_tasks` | `MemberTask` | `Admin/TaskController` | `TaskResource` | Task creation, lifecycle states, priorities, due dates, sub-tasks | `TaskTest` |
| `task_assignments` | `TaskAssignment` | `Admin/TaskController`, `Member/ProfileController` | `TaskAssignmentResource` | Assign tasks to members, track progress notes and completion | `TaskTest` |
| `audit_logs` | `AuditLog` | `Admin/AdminDashboardController` | `AuditLogResource` | Immutable event log for all admin/member actions, IP + actor capture | `AuditTest` |

---

## Authentication & Identity Tables

| Table | Model | Business Features |
|---|---|---|
| `personal_access_tokens` | *(Sanctum)* | Token management (not primary — JWT is primary auth) |
| `cache` | *(Laravel)* | Rate limit counters, session cache, transient data |
| `jobs` | *(Laravel)* | Queue jobs: ID card generation, email/SMS notifications, exports |
| `failed_jobs` | *(Laravel)* | Dead-letter queue for failed async jobs |

---

## Supplementary Tables

| Table | Model | Controller(s) | Business Features |
|---|---|---|---|
| `committees` | `Committee` | `Admin/CommitteeController` | Committee creation and management by unit |
| `committee_roles` | `CommitteeRole` | `Admin/CommitteeRoleController` | Member assignments within committees |
| `blog_posts` | `BlogPost` | `Admin/BlogPostController`, `NewsController` | Public news/blog content — CRUD, publish state |

---

## Enum Constraints

| Enum | Column(s) Affected | Allowed Values |
|---|---|---|
| `Gender` | `members.gender` | `male`, `female`, `other` |
| `MemberStatus` | `members.status` | `pending`, `active`, `suspended`, `expelled` |
| `UnitType` | `organizational_units.type`, `roles.unit_type` | `central`, `division`, `district`, `upazila`, `union`, `ward`, `campus` |

---

## Key Index Strategy

| Table | Indexed Column(s) | Reason |
|---|---|---|
| `members` | `user_id` (UNIQUE) | One-to-one user↔member link |
| `members` | `member_id` (UNIQUE) | Public-facing ID lookups |
| `members` | `mobile` (UNIQUE) | Registration duplicate check |
| `members` | `status` | Admin list filtering by status |
| `members` | `organizational_unit_id` | Unit-scoped member queries |
| `members` | `join_year` | Cohort/annual reporting |
| `members` | `(organizational_unit_id, status)` | Dashboard composite filter |
| `permissions` | `name` (UNIQUE) | Prevent duplicate permission registration |
| `organizational_units` | `code` | Unit code lookup |
| `member_positions` | `(member_id, is_active)` | Active position resolution |

---

## Service Layer Ownership

| Service Class | Tables / Models Touched | Responsibility |
|---|---|---|
| `MemberService` | `users`, `members`, `member_id_sequences`, `member_roles` | Registration, ID generation, profile update |
| `DocumentUploadService` | *(file storage)* | MIME check, disk routing, path storage |
| `PositionService` | `member_positions`, `position_history` | Promote, relieve, transfer, validation |
| `AuditService` | `audit_logs` | Structured event logging for all domains |
| `IdCardService` | `members`, `member_positions` | PDF generation, QR code, download |
