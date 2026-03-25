# Approval-State UX Contract

> **Scope:** Defines the API response shapes, HTTP status codes, and expected frontend behaviour for every member lifecycle state.

---

## 1. Member Status Lifecycle

```
[Public]
   │
   ▼
 pending  ──approve──►  active  ──suspend──►  suspended
   │                      │                      │
   └──reject──►  [deleted] └──expel──►  expelled  └──expel──►  expelled
```

| State       | `status` value | `canLogin()` | Can hold position | Description                                |
|-------------|----------------|:------------:|:-----------------:|--------------------------------------------|
| `pending`   | `pending`      | ✗            | ✗                 | Awaiting admin review after self-registration |
| `active`    | `active`       | ✓            | ✓                 | Full member with system access             |
| `suspended` | `suspended`    | ✗            | ✗                 | Temporarily restricted by admin            |
| `expelled`  | `expelled`     | ✗            | ✗                 | Permanently removed from organisation      |

---

## 2. Registration Endpoint

### `POST /api/register`

**Success (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Awaiting admin approval.",
  "data": {
    "member_id": "NDM-SW-2025-0042",
    "status": "pending"
  }
}
```

**Frontend behaviour:**
- Show success page: "Your application has been received."
- Prompt user to check email for confirmation.
- Do **not** attempt to log in — `pending` accounts are blocked.

---

## 3. Login Endpoint

### `POST /api/login`

**Success (200 OK) — active member:**
```json
{
  "success": true,
  "access_token": "<jwt_token>",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 12,
    "email": "member@example.com",
    "user_type": "member"
  }
}
```

**Blocked — non-active member (403 Forbidden):**
```json
{
  "success": false,
  "error": "Account not active: <StatusLabel>"
}
```

| `<StatusLabel>` value | Displayed state | Frontend UX                                       |
|-----------------------|-----------------|---------------------------------------------------|
| `Pending Approval`    | `pending`       | "Your application is under review."              |
| `Suspended`           | `suspended`     | "Your account has been suspended. Contact admin." |
| `Expelled`            | `expelled`      | "Your membership has been terminated."            |

**Invalid credentials (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid credentials."
}
```

---

## 4. Admin — Approve Member

### `PUT /api/admin/members/{id}/approve`

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Member NDM-SW-2025-0042 approved successfully.",
  "data": {
    "member_id": "NDM-SW-2025-0042",
    "status": "active"
  }
}
```

**Already approved / wrong state (422 Unprocessable):**
```json
{
  "success": false,
  "message": "Member is not in pending state."
}
```

**Side-effects:**
- `MemberRole` row created with `role = general_member`.
- `approved_by` and `approved_at` fields stamped on Member.
- Audit log entry: `member.approved`.
- `MemberApprovedNotification` dispatched to member's email.

---

## 5. Admin — Reject Member

### `DELETE /api/admin/members/{id}/reject`

**Request body (optional):**
```json
{ "reason": "Incomplete documentation." }
```

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Member registration rejected and removed."
}
```

**Side-effects:**
- `MemberRejectedNotification` dispatched to member's email **before** deletion.
- User row deleted (cascades to member, membership, positions via DB FK).
- Audit log entry: `member.rejected` with reason.

---

## 6. Admin — Suspend Member

### `PUT /api/admin/members/{id}/suspend`

**Request body (optional):**
```json
{ "reason": "Violation of code of conduct." }
```

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Member NDM-SW-2025-0042 suspended."
}
```

**Wrong state (422):**
```json
{
  "success": false,
  "message": "Only active members can be suspended."
}
```

**Side-effects:**
- All active positions deactivated via `Member::deactivateAllPositions()`.
- Audit log entry: `member.suspended` with reason.
- `MemberSuspendedNotification` dispatched.
- Member can no longer log in (`canLogin()` returns `false`).

---

## 7. Admin — Expel Member

### `PUT /api/admin/members/{id}/expel`

**Request body (optional):**
```json
{ "reason": "Serious disciplinary breach." }
```

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Member NDM-SW-2025-0042 expelled."
}
```

**Side-effects:**
- All active positions deactivated.
- Audit log entry: `member.expelled` with reason.
- `MemberExpelledNotification` dispatched.
- Status is permanent — no re-activation path.

---

## 8. `/api/me` Response Shape by Status

All states share the same shape; the `status` field drives frontend gating:

```json
{
  "success": true,
  "data": {
    "id": 12,
    "email": "member@example.com",
    "user_type": "member",
    "is_active": true,
    "name": "Mohammed Rahman",
    "member": {
      "id": 5,
      "member_id": "NDM-SW-2025-0042",
      "full_name": "Mohammed Rahman",
      "status": "active",
      "organizational_unit": { "id": 3, "name": "Dhaka Division" },
      "positions": []
    }
  }
}
```

**Frontend routing rules based on `member.status`:**

| Status      | Redirect target           | Dashboard access |
|-------------|---------------------------|:----------------:|
| `active`    | `/dashboard`              | ✓                |
| `pending`   | `/pending-approval`       | ✗                |
| `suspended` | `/account-suspended`      | ✗                |
| `expelled`  | `/membership-terminated`  | ✗                |

---

## 9. Notifications Summary

| Event               | Notification class                           | Channels          |
|---------------------|----------------------------------------------|-------------------|
| Registration received | `MemberRegistrationReceivedNotification`   | mail, database    |
| Approved            | `MemberApprovedNotification`                 | mail, database    |
| Rejected            | `MemberRejectedNotification`                 | mail              |
| Suspended           | `MemberSuspendedNotification`                | mail, database    |
| Expelled            | `MemberExpelledNotification`                 | mail, database    |

All notifications implement `ShouldQueue` — they are dispatched asynchronously via the Laravel queue worker.

---

## 10. Error Response Conventions

| HTTP Code | Meaning                                     |
|-----------|---------------------------------------------|
| 200       | OK — read / update succeeded                |
| 201       | Created — registration / store succeeded    |
| 401       | Unauthenticated — no valid token            |
| 403       | Forbidden — authenticated but blocked (non-active status) or insufficient permissions |
| 404       | Not found — member ID does not exist        |
| 422       | Unprocessable — validation failed or business rule violation |
| 500       | Server error — unexpected failure           |
