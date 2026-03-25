# RBAC Access Matrix — NDSM Production

## 1) Core Model

NDSM RBAC is built on 3 layers:

1. **System Role** — who the user is
2. **Permission** — what the user can do
3. **Scope** — where the user can do it (global vs unit-based)

---

## 2) Final Production Roles

1. **Super Admin**
   - Full control of all modules
   - Controls system settings, module toggles, security policies, elections

2. **Central Admin**
   - National-level control
   - Approves major workflows and manages cross-unit operations

3. **Unit Admin** (District / Campus Leader)
   - Controls assigned unit only
   - Can manage members, tasks, and operations in scope

4. **Organizer / Manager**
   - Operational role
   - Handles campaigns, events, assignments, and execution tasks

5. **Member (Verified)**
   - Normal active member
   - Can access profile, participation, complaints, and assigned activities

6. **Applicant (Pending)**
   - Limited access before approval
   - Registration/profile completion only

7. **Suspended / Expelled**
   - Restricted access state
   - No operational privileges

---

## 3) Permission Modules

## A) Authentication & Profile
- `auth.login`
- `auth.logout`
- `profile.view`
- `profile.update`
- `profile.upload_document`

## B) Member Management
- `member.create`
- `member.view`
- `member.update`
- `member.delete`
- `member.approve`
- `member.reject`
- `member.suspend`
- `member.expel`

## C) Units & Structure
- `unit.create`
- `unit.update`
- `unit.delete`
- `unit.view`
- `unit.assign_member`

## D) Roles & Positions
- `role.create`
- `role.update`
- `role.delete`
- `role.assign`
- `position.promote`
- `position.transfer`
- `position.remove`
- `position.view_history`

## E) Communication
- `notice.create`
- `notice.publish`
- `notice.view`
- `message.send`
- `message.broadcast`

## F) Tasks & Activities
- `task.create`
- `task.assign`
- `task.update`
- `task.complete`
- `task.view`

## G) Events & Campaigns
- `event.create`
- `event.approve`
- `event.publish`
- `event.join`
- `event.manage`

## H) Elections
- `election.create`
- `election.manage`
- `vote.cast`
- `vote.count`

## I) Donations
- `donation.create`
- `donation.verify`
- `donation.view`

## J) Complaints
- `complaint.create`
- `complaint.view`
- `complaint.assign`
- `complaint.resolve`

## K) Reports & Analytics
- `report.view`
- `report.export`

## L) System Control
- `system.settings`
- `module.enable_disable`
- `audit.view`
- `audit.export`

---

## 4) Role → Permission Policy Matrix (Production)

- **Super Admin**: all permissions (`*`), all scopes
- **Central Admin**: all business permissions, excludes super-admin-only system governance actions
- **Unit Admin**: unit-scoped administrative and operational permissions
- **Organizer / Manager**: limited operational permissions (tasks, campaigns, communication in scope)
- **Member (Verified)**: self and participation permissions only
- **Applicant (Pending)**: profile completion and application tracking only
- **Suspended / Expelled**: no active permissions

---

## 5) Scope-Based Access Rules (Mandatory)

Scope must always be enforced after permission checks.

Example policy:

```php
if ($user->hasRole('Unit Admin') && $user->unit_id !== $targetMember->unit_id) {
    abort(403, 'Out of scope action');
}
```

Scope model:
- **Global scope**: Super Admin, Central Admin
- **Unit scope**: Unit Admin, Organizer
- **Self scope**: Member, Applicant
- **Restricted scope**: Suspended/Expelled

---

## 6) Security Rules (Must Implement)

1. Prevent privilege escalation (never trust client-provided role/permission claims)
2. Log all admin-level actions to audit trail
3. Protect sensitive endpoints with both role and permission middleware
4. Require reason capture for destructive or override operations
5. Enforce immutable audit history for approval/rejection/suspension/expulsion actions

Recommended middleware style:

```php
Route::middleware(['auth:api', 'role:admin|super-admin', 'permission:member.approve'])
```

---

## 7) Laravel Implementation Standard

Use `spatie/laravel-permission` as the RBAC foundation.

Required RBAC tables:
- `roles`
- `permissions`
- `role_has_permissions`
- `model_has_roles`
- `model_has_permissions` (optional but recommended)

Recommended extensions:
- `scope_type` (`global`, `unit`, `self`)
- `scope_unit_id` nullable for unit-bound roles

---

## 8) Workflow Authority Rules (Locked)

- **Members**: approved by Admin / Organizer (within scope)
- **Complaints**: reviewed by Admin
- **Campaigns**: created by Organizer, approved by Admin
- **Elections**: controlled by Super Admin

---

## 9) Engineering Notes

- Keep permission names stable and versioned in seeders
- Avoid hardcoding role titles in business logic; use permissions + policies
- Validate scope in Policies / Gates, not only in controllers
- Add RBAC regression tests for role + permission + scope combinations
