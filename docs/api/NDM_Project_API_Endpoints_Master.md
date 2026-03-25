
# NDSM Project API Endpoints Master (DEV + UNDEV, Deduplicated)

This document defines the full API endpoint map for the NDSM platform with **no duplicate METHOD + PATH** entries.

Base URL (recommended):
- `https://api.ndsm.org.bd/api/v1`

Status legend:
- `DEV` = developed and available in current codebase
- `UNDEV` = under development / planned and not yet implemented

Authority rule:
- `Super Admin` has full control over **all modules** and can override approval workflows, global settings, module states, and election governance actions.

RBAC specification reference:
- `../04-API/RBAC_ACCESS_MATRIX_NDSM.md`

---

## 1) DEV Endpoints (Developed)

All endpoints in this section are treated as `DEV`.

### Public
- `GET /api/v1/units/campus` — Implemented
- `GET /api/v1/news` — Implemented
- `GET /api/v1/news/{slug}` — Implemented
- `GET /api/v1/members/search` — Implemented
- `GET /api/v1/members/{member_id}` — Implemented

### Auth
- `POST /api/v1/auth/register` — Implemented
- `POST /api/v1/auth/login` — Implemented
- `POST /api/v1/auth/logout` — Implemented
- `POST /api/v1/auth/refresh` — Implemented
- `GET /api/v1/auth/me` — Implemented

### Member Self Service
- `GET /api/v1/members/me` — Implemented
- `PUT /api/v1/members/me` — Implemented
- `POST /api/v1/members/me/photo` — Implemented
- `GET /api/v1/profile` — Implemented
- `PUT /api/v1/profile` — Implemented
- `PUT /api/v1/profile/password` — Implemented
- `GET /api/v1/profile/activity` — Implemented
- `POST /api/v1/profile/photo` — Implemented
- `DELETE /api/v1/profile/photo` — Implemented
- `GET /api/v1/id-card` — Implemented
- `GET /api/v1/id-card/preview` — Implemented
- `GET /api/v1/tasks/my` — Implemented
- `PUT /api/v1/tasks/{taskId}/progress` — Implemented

### Admin Core
- `GET /api/v1/admin/dashboard/stats` — Implemented
- `GET /api/v1/admin/dashboard/activity` — Implemented
- `GET /api/v1/admin/members` — Implemented
- `POST /api/v1/admin/members` — Implemented
- `GET /api/v1/admin/members/pending` — Implemented
- `GET /api/v1/admin/members/export/pdf` — Implemented
- `GET /api/v1/admin/members/export/csv` — Implemented
- `POST /api/v1/admin/members/promote-role` — Implemented
- `GET /api/v1/admin/members/{id}` — Implemented
- `PUT /api/v1/admin/members/{id}` — Implemented
- `DELETE /api/v1/admin/members/{id}` — Implemented
- `POST /api/v1/admin/members/{id}/approve` — Implemented
- `POST /api/v1/admin/members/{id}/reject` — Implemented
- `POST /api/v1/admin/members/{id}/suspend` — Implemented
- `POST /api/v1/admin/members/{id}/expel` — Implemented
- `GET /api/v1/admin/members/{id}/documents` — Implemented
- `GET /api/v1/admin/members/{id}/id-card` — Implemented

### Admin Tasks
- `GET /api/v1/admin/tasks` — Implemented
- `POST /api/v1/admin/tasks` — Implemented
- `GET /api/v1/admin/tasks/{id}` — Implemented
- `PUT /api/v1/admin/tasks/{id}` — Implemented
- `PATCH /api/v1/admin/tasks/{id}` — Implemented
- `DELETE /api/v1/admin/tasks/{id}` — Implemented

### Admin RBAC and Organization
- `GET /api/v1/admin/roles` — Implemented
- `POST /api/v1/admin/roles` — Implemented
- `GET /api/v1/admin/roles/{id}` — Implemented
- `PUT /api/v1/admin/roles/{id}` — Implemented
- `DELETE /api/v1/admin/roles/{id}` — Implemented
- `POST /api/v1/admin/roles/{id}/permissions` — Implemented
- `GET /api/v1/admin/permissions` — Implemented
- `GET /api/v1/admin/units` — Implemented
- `GET /api/v1/admin/positions/history` — Implemented
- `GET /api/v1/admin/positions` — Implemented
- `POST /api/v1/admin/positions` — Implemented
- `DELETE /api/v1/admin/positions/{id}` — Implemented

### Admin Content and Committees
- `GET /api/v1/admin/blog-posts` — Implemented
- `POST /api/v1/admin/blog-posts` — Implemented
- `GET /api/v1/admin/blog-posts/{id}` — Implemented
- `PUT /api/v1/admin/blog-posts/{id}` — Implemented
- `DELETE /api/v1/admin/blog-posts/{id}` — Implemented
- `GET /api/v1/admin/committees` — Implemented
- `POST /api/v1/admin/committees` — Implemented
- `GET /api/v1/admin/committees/{id}` — Implemented
- `PUT /api/v1/admin/committees/{id}` — Implemented
- `PATCH /api/v1/admin/committees/{id}` — Implemented
- `DELETE /api/v1/admin/committees/{id}` — Implemented
- `POST /api/v1/admin/committees/{id}/members` — Implemented
- `PUT /api/v1/admin/committees/{id}/roles/{role_id}` — Implemented
- `DELETE /api/v1/admin/committees/{id}/roles/{role_id}` — Implemented

---

## 2) UNDEV Endpoints (Under Development / Planned)

All endpoints in this section are treated as `UNDEV`.

## 2.1 Fundraising & Donation Tracking (UNDEV)
- `POST /api/v1/admin/fundraising/campaigns`
- `GET /api/v1/admin/fundraising/campaigns`
- `GET /api/v1/admin/fundraising/campaigns/{campaignId}`
- `PUT /api/v1/admin/fundraising/campaigns/{campaignId}`
- `POST /api/v1/admin/fundraising/campaigns/{campaignId}/close`
- `POST /api/v1/fundraising/donations`
- `GET /api/v1/admin/fundraising/donations`
- `GET /api/v1/admin/fundraising/donations/{donationId}`
- `POST /api/v1/admin/fundraising/donations/{donationId}/verify`
- `POST /api/v1/admin/fundraising/donations/{donationId}/reject`
- `GET /api/v1/admin/fundraising/reports/summary`
- `GET /api/v1/admin/fundraising/reports/compliance`

## 2.2 Membership Renewal & Re-verification (UNDEV)
- `GET /api/v1/member/renewal/status`
- `POST /api/v1/member/renewal/submit`
- `POST /api/v1/member/reverification/submit`
- `GET /api/v1/admin/renewals`
- `GET /api/v1/admin/renewals/{renewalId}`
- `POST /api/v1/admin/renewals/{renewalId}/approve`
- `POST /api/v1/admin/renewals/{renewalId}/reject`
- `POST /api/v1/admin/renewals/run-auto-expiry`
- `POST /api/v1/admin/renewals/send-reminders`
- `GET /api/v1/admin/renewals/reports/retention`

## 2.3 Training & Cadre Development (UNDEV)
- `POST /api/v1/admin/training/courses`
- `GET /api/v1/admin/training/courses`
- `GET /api/v1/admin/training/courses/{courseId}`
- `PUT /api/v1/admin/training/courses/{courseId}`
- `POST /api/v1/admin/training/courses/{courseId}/publish`
- `POST /api/v1/member/training/enroll/{courseId}`
- `GET /api/v1/member/training/my-courses`
- `POST /api/v1/admin/training/enrollments/{enrollmentId}/complete`
- `POST /api/v1/admin/training/certificates/{enrollmentId}/issue`
- `GET /api/v1/member/training/certificates`
- `GET /api/v1/admin/training/leadership-pipeline`
- `GET /api/v1/admin/training/reports/outcomes`

## 2.4 Integration Hub (SMS/WhatsApp/Email) + Delivery Logs + Retry (UNDEV)
- `POST /api/v1/admin/integrations/connectors`
- `GET /api/v1/admin/integrations/connectors`
- `GET /api/v1/admin/integrations/connectors/{connectorId}`
- `PUT /api/v1/admin/integrations/connectors/{connectorId}`
- `POST /api/v1/admin/integrations/connectors/{connectorId}/enable`
- `POST /api/v1/admin/integrations/connectors/{connectorId}/disable`
- `POST /api/v1/admin/integrations/connectors/{connectorId}/test`
- `GET /api/v1/admin/communications/delivery-logs`
- `GET /api/v1/admin/communications/delivery-logs/{logId}`
- `POST /api/v1/admin/communications/delivery-logs/{logId}/retry`
- `POST /api/v1/admin/communications/retry-failed-batch`
- `GET /api/v1/admin/communications/retry-queue`

## 2.5 Complaint Tribunal + Escalation (UNDEV)
- `POST /api/v1/member/complaints`
- `POST /api/v1/public/complaints/anonymous`
- `GET /api/v1/member/complaints/my`
- `GET /api/v1/member/complaints/{complaintId}`
- `GET /api/v1/admin/complaints`
- `GET /api/v1/admin/complaints/{complaintId}`
- `POST /api/v1/admin/complaints/{complaintId}/triage`
- `POST /api/v1/admin/complaints/{complaintId}/assign`
- `POST /api/v1/admin/complaints/{complaintId}/escalate`
- `POST /api/v1/admin/complaints/{complaintId}/resolve`
- `POST /api/v1/admin/complaints/{complaintId}/close`
- `POST /api/v1/admin/complaints/{complaintId}/reopen`
- `GET /api/v1/admin/complaints/reports/sla`

## 2.6 Email Campaign to All Members (UNDEV)
- `POST /api/v1/admin/campaigns/email`
- `GET /api/v1/admin/campaigns/email`
- `GET /api/v1/admin/campaigns/email/{campaignId}`
- `POST /api/v1/admin/campaigns/email/{campaignId}/schedule`
- `POST /api/v1/admin/campaigns/email/{campaignId}/send-now`
- `POST /api/v1/admin/campaigns/email/{campaignId}/cancel`
- `GET /api/v1/admin/campaigns/email/{campaignId}/delivery-stats`
- `GET /api/v1/admin/campaigns/email/{campaignId}/audience`

## 2.7 Super Admin Global Control (UNDEV)
- `GET /api/v1/super-admin/modules`
- `PUT /api/v1/super-admin/modules/{moduleKey}/status`
- `GET /api/v1/super-admin/system/settings`
- `PUT /api/v1/super-admin/system/settings`
- `POST /api/v1/super-admin/approvals/override`
- `GET /api/v1/super-admin/rbac/matrix`
- `PUT /api/v1/super-admin/rbac/matrix`
- `POST /api/v1/super-admin/elections/control-lock`

---

## 3) Deduplication Rule

- A route is unique by the pair: **`METHOD + PATH`**.
- If two modules need similar behavior, keep one canonical endpoint and use query/filter/body fields for scope.
- This file intentionally avoids repeating any `METHOD + PATH` entry.

---

## 4) Implementation Order (Recommended)

1. Renewal & Re-verification
2. Integration Hub (connectors + logs + retry)
3. Email Campaign to All Members
4. Complaint Tribunal + Escalation
5. Fundraising & Donation Tracking
6. Training & Cadre Development

---

## 5) Notes

- Keep endpoint namespace stable under `/api/v1`.
- Add role middleware per module (`super-admin`, `admin`, `active.member`, tribunal-specific permissions).
- Enforce Super Admin override only with high-risk action logging and reason capture.
- Add request validation + audit logging for all state-changing endpoints.
- Add idempotency handling for payment verification, retries, and campaign send jobs.
