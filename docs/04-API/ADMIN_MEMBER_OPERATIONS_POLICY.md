# Admin Member Operations Policy

This document finalizes the remaining operational rules for Task 04: member deletion policy, bulk actions, and reporting scope.

## 1. Deletion Policy

Hard delete is intentionally restricted.

- Allowed hard-delete states: `pending`, `expelled`
- Not allowed for hard delete: `active`, `suspended`
- Required input: `reason`

Rationale:

- `pending` registrations may be removed when they were rejected, spam, duplicates, or incomplete.
- `expelled` records may be permanently removed only after a clear administrative decision and audit trail.
- `active` and `suspended` members should remain recoverable for compliance, appeals, and historical accountability.

### Endpoint

- `DELETE /api/admin/members/{id}`

### Request body

```json
{
  "reason": "Duplicate registration confirmed by admin review."
}
```

### Behavior

- Uploaded documents are removed from storage before deletion.
- The action is audited as `member.deleted`.
- The owning `users` row is deleted, and related rows are removed by database constraints where applicable.
- Requests for `active` or `suspended` members return `422`.

## 2. Bulk Admin Operations

Bulk operations are provided for high-volume review workflows.

### Endpoint

- `POST /api/admin/members/bulk-action`

### Supported actions

- `approve`
- `reject`
- `suspend`
- `expel`
- `delete`

### Request shape

```json
{
  "action": "approve",
  "ids": [12, 14, 19],
  "reason": "Optional reason for reject, suspend, expel, or delete"
}
```

### Response shape

```json
{
  "success": true,
  "message": "Bulk member action processed.",
  "data": {
    "action": "approve",
    "processed_count": 2,
    "skipped_count": 1,
    "processed": [
      { "id": 12, "member_id": "NDM-SW-2026-0012", "action": "approve" }
    ],
    "skipped": [
      { "id": 19, "reason": "Only pending members can be approved." }
    ]
  }
}
```

### Rules

- Processing is partial-success aware: valid records proceed, invalid ones are skipped with reasons.
- Bulk `delete` requires a reason.
- Bulk actions reuse the same business rules as single-record actions.
- Notifications are dispatched per member where relevant.
- Every processed member generates audit events through existing lifecycle methods.

## 3. Reporting Backlog Delivered As API

The reporting scope for Task 04 is implemented as a summary API rather than deferred backlog notes.

### Endpoint

- `GET /api/admin/members/reports/summary`

### Optional query params

- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `unit_id=<id>`

### Returned report blocks

- `summary`
  - total members
  - active members
  - pending members
  - suspended members
  - expelled members
- `approvals_by_period`
  - date-wise approval counts based on `approved_at`
- `status_changes`
  - counts for `member.approved`, `member.rejected`, `member.suspended`, `member.expelled`, `member.deleted`
- `pending_by_unit`
  - pending-member counts grouped by organizational unit
- `members_by_unit`
  - grouped unit/status membership counts for dashboards and exports

## 4. Document Review Flow

The document review workflow remains:

- `GET /api/admin/members/{id}/documents`

This endpoint returns secured URLs for:

- profile photo
- national ID / birth certificate document
- student ID document

This should be used from the admin approval queue and member detail view only.

## 5. Recommended Frontend Use

- Use single-record actions for detailed review pages.
- Use bulk actions in pending queues and all-members tables with checkbox selection.
- Use the reporting endpoint to power dashboard summary cards, status charts, and unit-level tables.
- Surface deletion as a destructive action with an explicit reason dialog.