# NDM Master Task Tracker

This is the single consolidated task file for all project phases.

## Project Scope

**Project Name:** Nationalist Democratic Student Movement (NDSM) Student Wing Party Management System

**Purpose:** A secure digital platform to organize, track, and manage members, activities, roles, units, tasks, documents, and communication for the student affiliate of NDM.

**Organization Identity:**
- Full Name: Nationalist Democratic Student Movement - NDSM
- Parent Organization: NDM
- Motto: `শিক্ষা শৃঙ্খলা প্রযুক্তি সমৃদ্ধি`
- Core Principle: `ছাত্র আন্দোলন এর মূলনীতি`

**Business Goals:**
- Replace paper-based membership and approval workflows
- Provide secure member records and role history tracking
- Manage organizational units, positions, committees, and assignments
- Support student activities, communication, and public outreach
- Improve operational reporting, accountability, and auditability

Status logic for **Overall Status**:
- **Completed** = Dev `Done` + Test `Passed` + Upload `Uploaded`
- **In Progress** = any status contains `In Progress`
- **Pending** = everything else

## Summary

- Total Tasks: 201
- Completed: 17
- In Progress: 123
- Pending: 61

## Development Phase Kickoff (2026-03-25)

- Phase switched from planning/documentation to implementation.
- Current implementation focus: **Task 05 (RBAC)**.
- Immediate backend execution item: make `PermissionsSeeder` idempotent and include it in `DatabaseSeeder` flow.
- Validation target for this step: permission records seed cleanly and remain duplicate-safe on re-run.
- Next sequential item after seeding baseline: enforce permission checks in admin role workflows and related middleware/tests.

## Project-Wise Module Map

- **Foundation And Delivery Setup**: Tasks `1-12`
- **Core Database And Backend Domain**: Tasks `13-24`
- **Authentication, Admission, And Member Lifecycle**: Tasks `25-48`
- **Roles, Governance, Units, And Positions**: Tasks `49-60`
- **Tasks, Audit, ID Cards, And Operational Control**: Tasks `61-72`
- **Public Website, Public Profiles, And Outreach Pages**: Tasks `73-84`
- **Member Dashboard And Self-Service Experience**: Tasks `85-96`
- **Admin Dashboard And Management Experience**: Tasks `97-108`
- **Quality, Security, Testing, Deployment, And Operations**: Tasks `109-144`
- **Communication, Activities, And NDSM Identity**: Tasks `145-156`
- **Admin Panel Governance And System Control**: Tasks `157-160`
- **Complaint And Feedback System**: Tasks `161-164`
- **Election And Voting System**: Tasks `165-169`
- **Event And Campaign Management**: Tasks `170-174`
- **Fundraising And Donation Tracking**: Tasks `175-179`
- **Membership Renewal And Re-Verification**: Tasks `180-184`
- **Training And Cadre Development**: Tasks `185-189`
- **Integration Hub And Mass Outreach Campaigns**: Tasks `190-194`
- **Role-based Dashboard Design UI**: Tasks `195-201`

## Task 01 — Setup Foundation

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Audit monorepo structure | Review `docs`, `ndm-api`, and `viva-react` folders and confirm the implementation baseline for planning and delivery. | Done | Pending | Uploaded | Pending |
| 2 | Standardize local setup guide | Update the root setup instructions for PHP, Composer, Node, npm, database, and environment bootstrapping. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 3 | Validate backend environment template | Review `ndm-api/.env.example` and document required variables for JWT, DB, mail, queue, and storage. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 4 | Validate frontend environment template | Review `viva-react/.env.local` usage and define required `VITE_*` variables for API and public services. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 5 | Normalize package scripts | Review Composer and npm scripts for setup, dev, build, and test consistency across backend and frontend. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 6 | Define coding standards | Establish backend Pint rules, frontend linting expectations, naming conventions, and folder ownership guidelines. This task can be implemented using AI-assisted development. | Done | Pending | Pending | Pending |
| 7 | Document architecture decisions | Capture backend/frontend boundaries, auth model, storage strategy, and deployment assumptions in docs. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 8 | Review dependency health | Audit Laravel, JWT, DomPDF, QR code, React, Axios, Framer Motion, and Router dependencies for compatibility and upgrade risk. | Done | Pending | Pending | Pending |
| 9 | Define branching and release workflow | Create a project workflow for feature branches, reviews, staging, production, and rollback handling. | Done | Pending | Pending | Pending |
| 10 | Set up issue-to-task mapping | Align implementation modules with task files so dev, QA, and PM tracking remain synchronized. | Done | Pending | Uploaded | Pending |
| 11 | Establish artifact storage policy | Define where generated PDFs, uploads, exports, and release artifacts are stored across environments. | Done | Pending | In Progress | In Progress |
| 12 | Create project execution checklist | Build a reusable checklist for environment boot, migration, seeding, build, test, and smoke verification. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
## Task 02 — Database And Backend Core

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 13 | Review database schema completeness | Validate all migrations for users, members, units, roles, positions, permissions, tasks, audit logs, and document fields. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 14 | Validate enum usage | Ensure `Gender`, `MemberStatus`, and `UnitType` enums are applied consistently in models, validation, and business rules. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 15 | Harden member table constraints | Review indexes, uniqueness, nullable fields, and foreign keys for member lifecycle and reporting requirements. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 16 | Harden organizational unit hierarchy | Verify recursive unit relationships, parent-child integrity, activation rules, and reporting support. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 17 | Harden role and permission pivots | Review `roles`, `permissions`, and `role_permissions` schema and prevent duplicate or invalid assignments. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 18 | Harden member role schema | Verify `member_roles` supports promotion, auditability, and active role resolution for authorization. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 19 | Harden task and assignment schema | Review task lifecycle, due date handling, parent tasks, assignment uniqueness, and completion fields. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 20 | Review model relationships | Verify all Laravel model relations, casts, scopes, and helper methods across user, member, unit, role, task, and audit domains. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 21 | Refine resource/response layer | Add or improve API resources for public member views, private member views, admin lists, tasks, roles, and units. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 22 | Review seeder sequencing | Confirm `DatabaseSeeder`, admin, unit, role, and permission seeders run in a safe and deterministic order. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 23 | Add factory coverage for domain models | Create or expand factories for members, units, roles, positions, tasks, and assignments to support testing and seeding. This task can be implemented using AI-assisted development. | Done | Pending | Pending | Pending |
| 24 | Document schema-to-feature mapping | Produce a table that maps each database table to business features, controllers, and tests. This task can be implemented using AI-assisted development. | Done | Pending | Pending | Pending |
## Task 03 — Auth And Member Admission

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 25 | Review JWT authentication flow | Verify register, login, logout, refresh, and current-user flows against the intended member/admin experience. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 26 | Refine registration request validation | Reconcile the current `RegisterRequest` with product rules for files, mobile, identity, and organizational fields. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 27 | Normalize registration payload mapping | Ensure backend maps all frontend fields correctly into user, member, role, and document records. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 28 | Complete admission form backend handling | Finalize all controller and service logic for full multi-step student admission with uploads and pending status. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 29 | Enforce NID encryption policy | Verify identity data is encrypted at rest, decrypted safely in application code, and never leaked in public/admin outputs. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 30 | Validate member ID generation format | Confirm `NDM-SW-YYYY-XXXX` generation works transactionally and cannot collide under load. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 31 | Review document upload service | Validate MIME filtering, file size limits, private/public disks, naming strategy, and orphan cleanup behavior. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 32 | Complete profile API contract | Finalize member `GET /profile`, `PUT /profile`, and photo upload request/response contracts. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 33 | Add login error normalization | Standardize failed login, pending member, suspended member, and token failure responses for frontend consumption. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 34 | Define approval-state UX contract | Document how pending, active, suspended, and expelled states are surfaced to frontend users. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 35 | Add admission notification design | Specify email, SMS, or in-app notifications for registration receipt, approval, rejection, suspension, and expulsion. This task can be implemented using AI-assisted development. | Done | Pending | Pending | Pending |
| 36 | Add audit events for auth lifecycle | Ensure critical auth and admission actions are logged with actor, target, and state transitions. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
## Task 04 — Admin Member Operations

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 37 | Review admin dashboard API | Validate stats, recent activity, and KPI aggregation endpoints for completeness and performance. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 38 | Complete admin member list filters | Finalize status, unit, search, sort, and pagination behavior for admin member management. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 39 | Complete pending approval queue | Ensure pending-member retrieval, sorting, preview data, and bulk review requirements are supported. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 40 | Finalize member approval action | Review approval business rules, default role assignment, approver metadata, and audit output. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 41 | Finalize member rejection action | Review rejection workflow, cleanup behavior, document deletion, and communication expectations. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 42 | Finalize member suspension action | Validate suspension effect on login, active positions, tasks, and downstream admin visibility. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 43 | Finalize member expulsion action | Validate expulsion rules, record retention strategy, and recovery/appeal requirements. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 44 | Finalize admin member update flow | Ensure admin edits respect validation, immutable fields, and audit logging. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 45 | Finalize member deletion policy | Decide where hard delete is allowed versus archival or soft-delete patterns for compliance and recovery. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 46 | Expose admin document review flow | Build secure access patterns for reviewing member photo, identity, and student documents. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 47 | Add bulk admin operations plan | Define bulk approve, reject, suspend, export, and notify workflows for larger membership volumes. This task can be implemented using AI-assisted development. | Done | Pending | Pending | Pending |
| 48 | Add admin reporting backlog | Define reports for pending counts, status changes, approvals by period, and unit-level membership metrics. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
## Task 05 — Roles, Positions, And Units

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 49 | Review RBAC domain model | Verify separation between organizational roles, application permissions, and member role elevation logic. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 50 | Complete role CRUD policy | Finalize create, update, delete, activate, and deactivate rules for roles. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 51 | Complete permission sync workflow | Ensure permission assignment is safe, idempotent, auditable, and protected against privilege escalation. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 52 | Define default permission matrix | Establish final admin, organizer, and general-member permission sets by module, aligned with `docs/04-API/RBAC_ACCESS_MATRIX_NDSM.md` and backend seeder policy. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 53 | Implement position management APIs | Add promote, relieve, transfer, history, and member-history endpoints for organizational positions. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 54 | Build position service layer | Centralize position assignment, transfer, history logging, and validation rules in a backend service class. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 55 | Create position request validators | Add dedicated form requests for promote, relieve, and transfer operations. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 56 | Complete unit management APIs | Add unit tree listing, by-type lookup, create, update, archive, and delete behavior. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 57 | Harden hierarchical unit rules | Prevent illegal parent-child relationships and invalid unit-type transitions. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 58 | Add unit code and naming policy | Standardize organization codes, slug strategy, naming uniqueness, and display labels. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 59 | Add role-position-unit integration tests | Validate that role eligibility and unit hierarchy rules hold across transfers and promotions. This task can be implemented using AI-assisted development. | Done | Passed | In Progress | In Progress |
| 60 | Document org-structure governance | Write operational guidance for how admins should manage units, positions, and promotions in production. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
## Task 06 — Tasks, Audit, And ID Cards

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 61 | Review task management requirements | Validate task statuses, priorities, assignment rules, due dates, and subtask behavior against product needs. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 62 | Complete task CRUD workflows | Finalize admin create, update, view, and delete flows for member tasks. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 63 | Complete assignment workflow | Ensure tasks can be assigned to one or multiple members and updated safely. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 64 | Finalize member task progress updates | Review progress-note rules, completion timestamps, and audit expectations for member-submitted updates. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 65 | Add task summary reporting | Define open, overdue, completed, and per-unit task reporting for admin dashboards. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 66 | Review audit middleware coverage | Validate what actions are logged automatically and where explicit service-level logging is still required. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 67 | Harden audit retention strategy | Define audit storage duration, archival, redaction, and access-control policies. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
| 68 | Complete security-header strategy | Review response headers, frame policy, referrer policy, and fingerprint reduction for production. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 69 | Finalize ID card data contract | Confirm card fields, branding, QR contents, and verification link behavior. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 70 | Finalize ID card PDF generation | Validate PDF layout, image handling, QR rendering, and filename conventions for browser and download use cases. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 71 | Add ID verification endpoint design | Define the public/private verification workflow behind QR scans on printed or digital cards. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | In Progress |
| 72 | Add async processing backlog | Identify where queues should be used for card generation, notifications, exports, and heavy audit/reporting jobs. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
## Task 07 — Frontend Public Pages

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 73 | Review frontend route map | Validate all public routes against current pages, lazy loading, layout use, and navigation expectations. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 74 | Finalize global layout shell | Review header, footer, navigation, mobile menu, and shared layout responsiveness. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 75 | Refine homepage content architecture | Finalize hero, stats, mission, programs, countdown, testimonials, and CTA sections. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 76 | Complete About page content | Add mission, vision, ideology, movement history, and leadership context with final copy. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 77 | Complete Leadership page | Replace placeholders with real leadership data, profile images, role details, and unit associations. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 78 | Complete Activities page | Connect activity data to reusable cards, filters, and media-ready layouts. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 79 | Complete News page | Define article source, listing layout, detail routing, and featured-story handling. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 80 | Complete Gallery page | Define image/video data source, lazy loading, modal previews, and optimization strategy. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 81 | Complete Contact page | Add validated contact form, office details, map embed policy, and fallback communication channels. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 82 | Complete public directory page | Implement search, filters, pagination, and public-safe member card display logic. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 83 | Complete public member profile page | Render approved public profile data, positions, unit details, and privacy-safe fields. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 84 | Finalize public content asset plan | Organize logos, imagery, placeholders, and media optimization for pages currently relying on sparse assets. This task can be implemented using AI-assisted development. | Done | Pending | In Progress | In Progress |
## Task 08 — Frontend Auth And Member Dashboard

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 85 | Finalize auth context behavior | Review token bootstrapping, current-user hydration, logout cleanup, and redirect rules. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 86 | Finalize login UX | Improve login validation, error display, pending/suspended messaging, and dashboard redirection. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 87 | Finalize registration stepper UX | Review step-by-step validation, file upload feedback, summaries, and success messaging. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 88 | Add registration draft persistence | Preserve unfinished admission form progress in local storage or session storage. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | In Progress |
| 89 | Complete member dashboard summary | Refine profile summary cards, active positions, task snapshots, and ID card access states. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 90 | Complete member profile page | Build editable member profile UI for personal details, education, addresses, and emergency contacts. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 91 | Complete member positions page | Display role/position history, current assignments, and unit hierarchy in a readable layout. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 92 | Complete member settings page | Add password, session, notification, and account-level settings appropriate for the current auth model. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 93 | Add member task management UI | Provide task list filters, progress updates, due-date cues, and completion confirmation UX. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | In Progress |
| 94 | Add ID card preview/download UX | Improve PDF preview, download states, failure handling, and mobile compatibility. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | In Progress |
| 95 | Standardize frontend API state handling | Unify loading, empty, error, retry, and toast patterns across auth and member pages. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 96 | Extract reusable member components | Move dashboard-specific UI from pages into `components/member` for maintainability and reuse. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | In Progress |
## Task 09 — Frontend Admin Dashboard

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 97 | Finalize admin route protection | Ensure admin-only routes are guarded correctly in router and UI navigation. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 98 | Refine admin dashboard KPIs | Align frontend cards and charts with backend stats payloads and business priorities. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 99 | Refine recent activity feed | Improve audit-feed formatting, timestamps, empty states, and deep links into admin modules. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 100 | Complete pending approvals screen | Finalize document review, member preview, approve/reject confirmations, and reason capture. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 101 | Complete all members screen | Finalize member filters, status actions, pagination, badges, bulk actions, and detail linking. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 102 | Complete member detail screen | Build full admin member detail view with tabs for profile, documents, positions, and audit history. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 103 | Complete role management UI | Build role list, create/edit forms, permission matrix, and deletion safeguards. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 104 | Complete unit management UI | Build hierarchy tree, add/edit dialogs, activation states, and safe deletion warnings. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 105 | Complete position management UI | Build promote, relieve, and transfer workflows with search and validation support. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 106 | Complete position history UI | Provide timeline and filterable history views for units and members. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 107 | Add admin task management UI | Build admin-side task list, create/edit flows, assignee picker, and status reporting. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 108 | Extract reusable admin components | Move table, filter, modal, and summary patterns into `components/admin` for reuse. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | In Progress |
## Task 10 — Backend Testing

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 109 | Clean placeholder test files | Replace example tests with domain-relevant backend feature and unit tests. This task can be implemented using AI-assisted development. | Done | In Progress | Uploaded | In Progress |
| 110 | Expand auth feature tests | Cover invalid login, token refresh, logout failures, suspended users, and admin login flows. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 111 | Expand registration feature tests | Cover all validation rules, file uploads, encryption, unit assignment, and duplicate-mobile scenarios. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 112 | Add profile API feature tests | Verify authenticated profile read, update, photo upload, and authorization failures. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 113 | Add admin member operation tests | Cover approve, reject, suspend, expel, update, delete, and document-review endpoints. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 114 | Add RBAC feature tests | Verify role CRUD, permission sync, admin middleware, and privilege-escalation prevention. This task can be implemented using AI-assisted development. | In Progress | Pending | In Progress | In Progress |
| 115 | Add task management feature tests | Cover task CRUD, assignment creation, member progress updates, and status transitions. This task can be implemented using AI-assisted development. | In Progress | Pending | In Progress | In Progress |
| 116 | Add ID card feature tests | Verify access rules, PDF response headers, and generation failures for active/inactive members. This task can be implemented using AI-assisted development. | Done | Passed | In Progress | In Progress |
| 117 | Add middleware tests | Validate `AdminMiddleware`, `ActiveMemberMiddleware`, `AuditMiddleware`, and `SecurityHeadersMiddleware`. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 118 | Add service unit tests | Unit-test member ID generation, upload service behavior, audit logging, and ID card composition logic. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 119 | Add seeder and migration smoke tests | Verify schema can migrate and seed cleanly in CI and test environments. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
| 120 | Add API contract regression suite | Build repeatable endpoint contract tests for payload structure, error shape, and pagination metadata. This task can be implemented using AI-assisted development. | Done | Passed | Uploaded | Completed |
## Task 11 — Frontend Testing, Security, And Quality

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 121 | Set up frontend test framework | Add Vitest or Jest, React Testing Library, coverage reporting, and test scripts. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | In Progress |
| 122 | Add router and auth tests | Validate guarded routes, redirects, login state restoration, and logout behavior. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 123 | Add registration form tests | Cover step transitions, field validation, file upload state, and submission error handling. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 124 | Add member dashboard tests | Test profile rendering, task widgets, ID card download triggers, and empty states. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 125 | Add admin dashboard tests | Test KPI rendering, pending list behavior, member actions, and list filtering. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 126 | Add service-layer frontend tests | Mock Axios requests and verify auth, member, and admin services handle success and failure cases correctly. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 127 | Add component visual regression backlog | Define snapshots or Storybook-based regression checks for critical UI components. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 128 | Run frontend accessibility audit | Review keyboard flow, semantic markup, color contrast, focus states, and ARIA labeling. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 129 | Run frontend performance audit | Measure bundle size, lazy-loading behavior, large image handling, and dashboard rendering cost. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 130 | Review client-side security posture | Validate token storage risks, unsafe HTML usage, route guarding assumptions, and API error exposure. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 131 | Perform API security review | Review rate limits, auth boundaries, file upload attack surface, CORS policy, and privilege enforcement. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 132 | Plan VAPT execution | Define scope, tools, checklist, remediation logging, and retest criteria for vulnerability assessment and penetration testing. | Pending | Pending | Pending | Pending |
## Task 12 — Deployment, Documentation, And Operations

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 133 | Define deployment topology | Choose target hosting for Laravel API, database, storage, and React frontend delivery. | Done | Pending | Uploaded | Pending |
| 134 | Create Dockerization backlog | Design Dockerfiles, compose stack, and local container workflow for backend, frontend, and database. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 135 | Design CI pipeline | Add automated install, lint, migrate, test, and build stages for pull requests and mainline deployments. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 136 | Design CD pipeline | Define staging and production release flow, artifact promotion, secret injection, and rollback procedure. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 137 | Define secret-management policy | Move environment secrets, JWT keys, DB credentials, and third-party tokens into a secure secret workflow. | In Progress | Pending | In Progress | In Progress |
| 138 | Define backup and restore plan | Create backup cadence and restoration procedures for database, uploads, and audit records. | In Progress | Pending | In Progress | In Progress |
| 139 | Define logging and monitoring plan | Add application logs, queue logs, audit dashboards, uptime checks, and alerting strategy. This task can be implemented using AI-assisted development. | In Progress | Pending | In Progress | In Progress |
| 140 | Define caching and scaling plan | Plan Redis or alternative cache strategy, queue workers, and future horizontal scaling needs. This task can be implemented using AI-assisted development. | In Progress | Pending | In Progress | In Progress |
| 141 | Produce API documentation package | Convert blueprint-level API docs into developer-ready endpoint documentation or OpenAPI output. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 142 | Produce frontend handoff guide | Document route map, service contracts, component ownership, and environment setup for frontend contributors. This task can be implemented using AI-assisted development. | Done | Pending | Uploaded | Pending |
| 143 | Produce operations runbook | Write procedures for incident response, deployment checks, storage linking, seeding, and smoke tests. This task can be implemented using AI-assisted development. | In Progress | Pending | In Progress | In Progress |
| 144 | Plan go-live checklist | Create final readiness gates covering dev complete, test complete, security sign-off, content sign-off, and deployment approval. | Done | Pending | Uploaded | Pending |

## Task 13 — Communication, Activities, And NDSM Identity

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 145 | Define internal communication module | Define how circulars, internal notices, targeted announcements, and member communication will work across central, district, campus, and committee levels. This task should align with the NDSM operating model and approval chain. | Done | Pending | In Progress | In Progress |
| 146 | Build announcement and broadcast APIs | Add backend APIs for creating, scheduling, publishing, and withdrawing announcements for selected units, roles, or all members. Include audit logging and publish-state rules. | Pending | Pending | Pending | Pending |
| 147 | Build communication inbox UI | Create frontend member/admin inbox views for notices, organization messages, announcements, and unread/read state handling. | Pending | Pending | Pending | Pending |
| 148 | Add notification delivery orchestration | Design and implement email, SMS, and in-app notification workflows for approvals, task assignments, events, notices, and emergency communications. | Pending | Pending | Pending | Pending |
| 149 | Define activities and programs domain model | Add project-level support for party student activities, campaigns, seminars, workshops, rallies, meetings, and campus programs with lifecycle states and ownership rules. | Done | Pending | In Progress | In Progress |
| 150 | Build activity and event management module | Create backend and admin frontend workflows for creating, editing, approving, publishing, and archiving student movement activities and events. | Pending | Pending | Pending | Pending |
| 151 | Add event participation and attendance tracking | Track registrations, participation lists, attendance confirmation, attendance proof, and unit-wise reporting for events and organizational programs. | Pending | Pending | Pending | Pending |
| 152 | Add meeting minutes and resolutions archive | Add secure storage and retrieval for meeting minutes, decisions, resolutions, circulars, and follow-up tasks at organization and committee level. | Pending | Pending | Pending | Pending |
| 153 | Add multilingual content strategy | Define and implement Bangla-first and English-support content handling for public pages, labels, notices, official statements, and dashboards where required. | Done | Pending | In Progress | In Progress |
| 154 | Apply NDSM branding and motto consistently | Ensure the system uses the correct name `Nationalist Democratic Student Movement - NDSM`, NDM student wing identity, logo usage, color rules, and motto `শিক্ষা শৃঙ্খলা প্রযুক্তি সমৃদ্ধি` across public and private interfaces. | Done | Pending | In Progress | In Progress |
| 155 | Add communication privacy and consent controls | Define who can contact whom, what communication preferences members can manage, and how to protect private contact information and sensitive communication records. | Done | Pending | In Progress | In Progress |
| 156 | Add communication and activity analytics | Build dashboards and reporting for announcement reach, notification delivery, engagement, event participation, attendance, and unit-level activity performance. | Pending | Pending | Pending | Pending |

## Task 14 — Admin Panel Governance And System Control

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 157 | Build full admin control center | Design and implement a high-level admin control panel for centralized system supervision, including dashboard-level access to members, units, tasks, content, communication, audit, settings, and operational tools. | In Progress | Pending | In Progress | In Progress |
| 158 | Build user permission management module | Create a complete permission-management workflow for admins to assign, update, revoke, and review user permissions and role-based access across all enabled modules. Include audit logging and privilege-escalation safeguards. | Pending | Pending | Pending | Pending |
| 159 | Add module enable and disable controls | Build a module-control system so authorized admins can enable or disable product modules such as news, activities, directory, committees, tasks, blog, notifications, and ID cards without changing code manually. Include safe defaults and environment-aware controls. | In Progress | Pending | In Progress | In Progress |
| 160 | Add system-level admin settings and safeguards | Create system settings for feature flags, maintenance controls, branding settings, communication options, storage controls, and security restrictions. Ensure only the highest authorized admin roles can access destructive or global settings. | In Progress | Pending | In Progress | In Progress |

## Task 15 — Complaint And Feedback System

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 161 | Build member complaints and feedback module | Create a structured complaint and feedback system where members can submit complaints, suggestions, and service issues against modules, workflows, or organizational handling. Support categories, priority, attachments, and visibility rules. | Pending | Pending | Pending | Pending |
| 162 | Add anonymous reporting workflow | Build a secure anonymous reporting option for sensitive issues such as misconduct, abuse, harassment, corruption, or policy violations. Ensure identity protection, abuse controls, and restricted admin access to sensitive reports. | Pending | Pending | Pending | Pending |
| 163 | Add issue tracking lifecycle and SLA workflow | Define and implement complaint states such as submitted, triaged, assigned, investigating, resolved, rejected, and closed. Include assignee tracking, deadlines, internal notes, escalation rules, and audit history. | Pending | Pending | Pending | Pending |
| 164 | Build admin resolution panel | Create an admin resolution dashboard for complaint review, filtering, assignment, evidence review, response drafting, resolution updates, and final closure with member-visible status updates where allowed. | Pending | Pending | Pending | Pending |

## Task 16 — Election And Voting System

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 165 | Build internal election framework | Design and implement internal election workflows for committee selection across units and organizational levels, including election schedule, election type, and eligible voter/candidate scope rules. | Done | Pending | Uploaded | In Progress |
| 166 | Add candidate nomination workflow | Build candidate nomination, proposer/seconder rules, nomination verification, approval/rejection pipeline, and candidate profile publication controls for internal elections. | Done | Pending | Uploaded | In Progress |
| 167 | Build secure digital voting engine | Implement secure digital voting with one-member-one-vote enforcement, ballot secrecy, anti-duplicate protections, session integrity, and audit-safe vote event logs. | Done | Pending | Uploaded | In Progress |
| 168 | Add automated result generation | Build automated vote counting, tie handling policies, winner declaration logic, result publication controls, and downloadable result reports for authorized roles. | Done | Pending | Uploaded | In Progress |
| 169 | Add election and voting analytics | Create analytics for turnout, unit-wise participation, candidate performance, invalid vote patterns, and election-cycle comparisons for leadership decision support. | Done | Pending | Uploaded | In Progress |

## Task 17 — Event And Campaign Management

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 170 | Build event creation and publishing module | Implement event creation and publishing workflows for seminars, rallies, meetings, and campus programs with scheduling, unit targeting, approval, and visibility controls. | Done | Pending | Uploaded | In Progress |
| 171 | Add RSVP and attendance tracking | Build RSVP workflows, attendance check-in/check-out, attendance validation, and unit-wise participation reports for events and organizational programs. | Done | Pending | Uploaded | In Progress |
| 172 | Build campaign planning workflows | Create campaign planning tools for digital and field campaigns including objectives, timeline, resource planning, messaging tracks, and execution checkpoints. | Done | Pending | Uploaded | In Progress |
| 173 | Add campaign task assignment to members | Integrate campaign operations with member task assignment, ownership tracking, deadlines, completion verification, and escalation for overdue work. | Done | Pending | Uploaded | In Progress |
| 174 | Add event report and media upload workflows | Build post-event reporting with summary, outcomes, attendance insights, budget/effort notes, and media upload management (photos/videos/documents) with moderation controls. | Done | Pending | Uploaded | In Progress |

## Task 18 — Fundraising And Donation Tracking

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 175 | Build fundraising campaign goals module | Implement fundraising campaign setup with target amount, timeline, unit ownership, campaign status, and progress indicators for organizational fundraising drives. | Done | Passed | Uploaded | Completed |
| 176 | Build donor records and contribution ledger | Create donor profile and donation ledger workflows with donation source, amount, date, payment channel, receipt reference, and donor consent metadata. | Done | Passed | Uploaded | Completed |
| 177 | Add donation verification and approval flow | Add admin workflows to verify submitted donations, reconcile payment references, flag suspicious entries, and approve or reject donation records with audit trail. | Done | Passed | Uploaded | Completed |
| 178 | Build fundraising dashboards and reports | Provide campaign-wise and unit-wise fundraising analytics with goal achievement, donor trends, repeat donor rates, and exportable report summaries. | Done | Passed | Uploaded | Completed |
| 179 | Add compliance-ready donation reporting | Build compliance reporting for financial transparency including period statements, category summaries, and immutable audit logs for all donation edits and approvals. | Done | Passed | Uploaded | Completed |

## Task 19 — Membership Renewal And Re-Verification

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 180 | Build yearly renewal workflow | Implement annual membership renewal process with renewal window, eligibility checks, renewal fee/criteria support, and renewal confirmation states. | Done | Pending | Uploaded | In Progress |
| 181 | Add status auto-expiry rules | Add automated membership status expiry logic for members who do not renew within defined deadlines, including grace period and policy-configurable triggers. | Done | Pending | Uploaded | In Progress |
| 182 | Build re-verification process | Create re-verification workflows for member profile updates, document re-check, unit assignment confirmation, and admin approval for continued active status. | Done | Pending | Uploaded | In Progress |
| 183 | Add renewal reminder automation | Implement reminder workflows using in-app, SMS, WhatsApp, and email channels for pre-expiry notices, grace-period notices, and final expiry alerts. | Done | Pending | Uploaded | In Progress |
| 184 | Build renewal compliance and retention reports | Add reports for renewal rate, expired-member count, re-verification completion, and unit-wise retention performance with period comparisons. | Done | Pending | Uploaded | In Progress |

## Task 20 — Training And Cadre Development

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 185 | Build training course module | Implement training module management for course creation, curriculum structure, unit targeting, trainer assignment, and training schedule planning. | Done | Pending | Uploaded | In Progress |
| 186 | Add enrollment and completion tracking | Build trainee enrollment and completion workflows with attendance, assessment, progress milestones, and completion state tracking per member. | Done | Pending | Uploaded | In Progress |
| 187 | Add certification generation workflow | Create certificate issuance workflows for completed training, including digital certificate templates, verification IDs, and certificate download endpoints. | Done | Pending | Uploaded | In Progress |
| 188 | Build leadership pipeline tracker | Add cadre and leadership pipeline tracking with competency levels, promotion readiness, mentorship paths, and role eligibility recommendations. | Done | Pending | Uploaded | In Progress |
| 189 | Add training analytics and outcome reporting | Provide analytics for course completion rates, unit-wise skill development, trainer performance, and leadership-development outcomes. | Done | Pending | Uploaded | In Progress |

## Task 21 — Integration Hub And Mass Outreach Campaigns

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 190 | Build SMS, WhatsApp, and email connector hub | Implement integration adapters for SMS, WhatsApp, and email providers with credential management, connector health checks, and fallback routing. | Done | Pending | Uploaded | In Progress |
| 191 | Add delivery logs and retry queues | Build centralized delivery logs for all outbound communications with failure reason tracking, retry policies, dead-letter queue handling, and resend tools for admins. | Done | Pending | Uploaded | In Progress |
| 192 | Build audience segmentation and targeting engine | Create targeting rules for all-members, role-based, unit-based, status-based, and custom-segment outreach campaigns with preview and count estimation. | Done | Pending | Uploaded | In Progress |
| 193 | Build email campaign to all members workflow | Implement bulk email campaign workflows with template management, send scheduling, send throttling, unsubscribe handling, and delivery/open/click analytics for all-member campaigns. | Done | Pending | Uploaded | In Progress |
| 194 | Add compliance and communication governance controls | Implement consent checks, unsubscribe enforcement, campaign approval policies, content moderation checks, and communication audit history for all outreach channels. | Done | Pending | Uploaded | In Progress |

## Task 22 — Role-based Dashboard Design UI
<!-- Note: Backend fix for role-based data filtering is now complete, unblocking UI development for role-specific dashboards. -->

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 195 | [UI] Refactor DashboardLayout for Glassmorphism | Implement a premium, translucent theme with blur effects, fixed sidebars, and framer-motion staggered entry animations for dashboard widgets. | Done | In Progress | Uploaded | In Progress |
| 196 | [UI] Unify Sidebar & Permission-Gating | Create a single `RoleSidebar` component that dynamically filters navigation items based on the user's active role and assigned backend permissions. | Done | Pending | Uploaded | In Progress |
| 197 | [UI] Build Premium Admin Metric Widgets | Design high-fidelity statistical cards with mini-charts (sparklines) for membership growth, status distribution, and unit-level heatmaps. | Done | In Progress | Uploaded | In Progress |
| 198 | [UI] Design Organizer-specific Dashboard | Build a tailored view for Unit Organizers that filters stats, tasks, and member lists to their specific assigned organizational unit. | Done | Pending | Uploaded | In Progress |
| 199 | [UI] Enhance Member Dashboard Experience | Build an interactive member "at-a-glance" view with activity feeds, upcoming events, quick-access unit links, and improved ID card presence. | Done | In Progress | Uploaded | In Progress |
| 200 | [UI] Apply Role-specific Theming | Apply role-specific visual cues, theme accents, and branding elements to the dashboard layouts to improve context awareness and user experience. | Done | Pending | Uploaded | In Progress |
| 201 | [UI] Build Menu And Sub-menu Navigation System | Design and implement a structured dashboard navigation model with expandable menu groups, sub-menu states, active-route highlighting, mobile collapse behavior, icon consistency, and permission-aware visibility across admin, organizer, and member roles. | Done | Pending | Uploaded | In Progress |

### UI Execution Breakdown For Better Work Tracking

Use this sequence when implementing dashboard UI so design, permissions, and role-specific pages do not drift.

| Step | Focus Area | Linked Tasks | Expected Output |
| --- | --- | --- | --- |
| 1 | Layout foundation | 195 | Shared dashboard shell with header, content grid, responsive sidebar, motion baseline, and theme tokens |
| 2 | Navigation and access control | 196, 201 | Centralized sidebar config, permission-aware nav rendering, hidden/disabled states, role grouping, nested menu behavior |
| 3 | Shared widget library | 197, 199 | Reusable stat cards, chart blocks, feed panels, quick-action cards, loading and empty states |
| 4 | Admin dashboard composition | 197 | Admin-specific metrics page wired to KPI, chart, and audit summary components |
| 5 | Organizer dashboard composition | 198 | Unit-scoped dashboard with filtered members, tasks, approvals, and alerts |
| 6 | Member dashboard composition | 199 | Personal dashboard with profile summary, tasks, events, notifications, and ID card entry point |
| 7 | Theming and polish | 200 | Role accents, badges, icon language, page transitions, and final responsive refinement |

### UI Delivery Checklist

- Define dashboard design tokens in one place: spacing, radius, shadows, blur, surfaces, accent colors, chart colors.
- Create a single dashboard shell that all roles reuse before building role-specific pages.
- Move sidebar items into config objects with `label`, `icon`, `route`, `roles`, and permission keys.
- Add support for nested navigation objects with parent items, sub-menu items, expand/collapse state, and active trail rules.
- Standardize states for every dashboard card: loading, empty, error, success.
- Reuse one widget API for stats, trends, lists, alerts, and quick actions.
- Implement mobile behavior early: sidebar drawer, sticky page header, 1-column fallback layouts.
- Keep role-specific pages thin by composing shared widgets instead of cloning layouts.
- Validate backend permission-gating and frontend route-gating together before styling polish.
- Add placeholders/skeletons for KPI cards, tables, activity feeds, and chart panels.
- Finish theme accents last so layout and access rules stay stable during implementation.

### Recommended Build Order By File Area

- `layouts/` : dashboard shell, topbar, responsive container
- `components/navigation/` : role sidebar, nav item groups, mobile nav
- `components/navigation/menus/` : menu groups, sub-menu lists, collapse triggers, active state helpers
- `components/dashboard/` : stat cards, chart cards, feed panels, quick actions, section headers
- `pages/admin/` : admin dashboard assembly
- `pages/organizer/` : organizer dashboard assembly
- `pages/member/` : member dashboard assembly
- `theme/` or `styles/` : role accents, tokens, reusable surface classes

### Definition Of Done For UI Tasks 195-201

- Desktop and mobile layouts both work without overflow or broken spacing.
- Role-based navigation only shows allowed destinations.
- Menu and sub-menu states work consistently for expanded, collapsed, mobile, and active-route cases.
- Admin, organizer, and member dashboards each have distinct but consistent information architecture.
- Shared widgets are reused across roles where possible.
- Loading, empty, and error states are present for every async dashboard block.
- Final UI matches NDSM branding direction and role-based context cues.