# NDM Master Task Tracker

This is the single consolidated task file for all project phases.

Status logic for **Overall Status**:
- **Completed** = Dev `Done` + Test `Passed` + Upload `Uploaded`
- **In Progress** = any status contains `In Progress`
- **Pending** = everything else

## Summary

- Total Tasks: 144
- Completed: 0
- In Progress: 0
- Pending: 144

## Task 01 — Setup Foundation

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Audit monorepo structure | Review `docs`, `ndm-api`, and `viva-react` folders and confirm the implementation baseline for planning and delivery. | Pending | Pending | Pending | Pending |
| 2 | Standardize local setup guide | Update the root setup instructions for PHP, Composer, Node, npm, database, and environment bootstrapping. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 3 | Validate backend environment template | Review `ndm-api/.env.example` and document required variables for JWT, DB, mail, queue, and storage. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 4 | Validate frontend environment template | Review `viva-react/.env.local` usage and define required `VITE_*` variables for API and public services. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 5 | Normalize package scripts | Review Composer and npm scripts for setup, dev, build, and test consistency across backend and frontend. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 6 | Define coding standards | Establish backend Pint rules, frontend linting expectations, naming conventions, and folder ownership guidelines. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 7 | Document architecture decisions | Capture backend/frontend boundaries, auth model, storage strategy, and deployment assumptions in docs. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 8 | Review dependency health | Audit Laravel, JWT, DomPDF, QR code, React, Axios, Framer Motion, and Router dependencies for compatibility and upgrade risk. | Pending | Pending | Pending | Pending |
| 9 | Define branching and release workflow | Create a project workflow for feature branches, reviews, staging, production, and rollback handling. | Pending | Pending | Pending | Pending |
| 10 | Set up issue-to-task mapping | Align implementation modules with task files so dev, QA, and PM tracking remain synchronized. | Pending | Pending | Pending | Pending |
| 11 | Establish artifact storage policy | Define where generated PDFs, uploads, exports, and release artifacts are stored across environments. | Pending | Pending | Pending | Pending |
| 12 | Create project execution checklist | Build a reusable checklist for environment boot, migration, seeding, build, test, and smoke verification. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |

## Task 02 — Database And Backend Core

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 13 | Review database schema completeness | Validate all migrations for users, members, units, roles, positions, permissions, tasks, audit logs, and document fields. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 14 | Validate enum usage | Ensure `Gender`, `MemberStatus`, and `UnitType` enums are applied consistently in models, validation, and business rules. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 15 | Harden member table constraints | Review indexes, uniqueness, nullable fields, and foreign keys for member lifecycle and reporting requirements. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 16 | Harden organizational unit hierarchy | Verify recursive unit relationships, parent-child integrity, activation rules, and reporting support. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 17 | Harden role and permission pivots | Review `roles`, `permissions`, and `role_permissions` schema and prevent duplicate or invalid assignments. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 18 | Harden member role schema | Verify `member_roles` supports promotion, auditability, and active role resolution for authorization. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 19 | Harden task and assignment schema | Review task lifecycle, due date handling, parent tasks, assignment uniqueness, and completion fields. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 20 | Review model relationships | Verify all Laravel model relations, casts, scopes, and helper methods across user, member, unit, role, task, and audit domains. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 21 | Refine resource/response layer | Add or improve API resources for public member views, private member views, admin lists, tasks, roles, and units. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 22 | Review seeder sequencing | Confirm `DatabaseSeeder`, admin, unit, role, and permission seeders run in a safe and deterministic order. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 23 | Add factory coverage for domain models | Create or expand factories for members, units, roles, positions, tasks, and assignments to support testing and seeding. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 24 | Document schema-to-feature mapping | Produce a table that maps each database table to business features, controllers, and tests. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |

## Task 03 — Auth And Member Admission

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 25 | Review JWT authentication flow | Verify register, login, logout, refresh, and current-user flows against the intended member/admin experience. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 26 | Refine registration request validation | Reconcile the current `RegisterRequest` with product rules for files, mobile, identity, and organizational fields. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 27 | Normalize registration payload mapping | Ensure backend maps all frontend fields correctly into user, member, role, and document records. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 28 | Complete admission form backend handling | Finalize all controller and service logic for full multi-step student admission with uploads and pending status. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 29 | Enforce NID encryption policy | Verify identity data is encrypted at rest, decrypted safely in application code, and never leaked in public/admin outputs. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 30 | Validate member ID generation format | Confirm `NDM-SW-YYYY-XXXX` generation works transactionally and cannot collide under load. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 31 | Review document upload service | Validate MIME filtering, file size limits, private/public disks, naming strategy, and orphan cleanup behavior. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 32 | Complete profile API contract | Finalize member `GET /profile`, `PUT /profile`, and photo upload request/response contracts. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 33 | Add login error normalization | Standardize failed login, pending member, suspended member, and token failure responses for frontend consumption. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 34 | Define approval-state UX contract | Document how pending, active, suspended, and expelled states are surfaced to frontend users. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 35 | Add admission notification design | Specify email, SMS, or in-app notifications for registration receipt, approval, rejection, suspension, and expulsion. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 36 | Add audit events for auth lifecycle | Ensure critical auth and admission actions are logged with actor, target, and state transitions. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |

## Task 04 — Admin Member Operations

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 37 | Review admin dashboard API | Validate stats, recent activity, and KPI aggregation endpoints for completeness and performance. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 38 | Complete admin member list filters | Finalize status, unit, search, sort, and pagination behavior for admin member management. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 39 | Complete pending approval queue | Ensure pending-member retrieval, sorting, preview data, and bulk review requirements are supported. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 40 | Finalize member approval action | Review approval business rules, default role assignment, approver metadata, and audit output. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 41 | Finalize member rejection action | Review rejection workflow, cleanup behavior, document deletion, and communication expectations. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 42 | Finalize member suspension action | Validate suspension effect on login, active positions, tasks, and downstream admin visibility. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 43 | Finalize member expulsion action | Validate expulsion rules, record retention strategy, and recovery/appeal requirements. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 44 | Finalize admin member update flow | Ensure admin edits respect validation, immutable fields, and audit logging. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 45 | Finalize member deletion policy | Decide where hard delete is allowed versus archival or soft-delete patterns for compliance and recovery. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 46 | Expose admin document review flow | Build secure access patterns for reviewing member photo, identity, and student documents. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 47 | Add bulk admin operations plan | Define bulk approve, reject, suspend, export, and notify workflows for larger membership volumes. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 48 | Add admin reporting backlog | Define reports for pending counts, status changes, approvals by period, and unit-level membership metrics. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |

## Task 05 — Roles, Positions, And Units

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 49 | Review RBAC domain model | Verify separation between organizational roles, application permissions, and member role elevation logic. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 50 | Complete role CRUD policy | Finalize create, update, delete, activate, and deactivate rules for roles. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 51 | Complete permission sync workflow | Ensure permission assignment is safe, idempotent, auditable, and protected against privilege escalation. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 52 | Define default permission matrix | Establish final admin, organizer, and general-member permission sets by module. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 53 | Implement position management APIs | Add promote, relieve, transfer, history, and member-history endpoints for organizational positions. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 54 | Build position service layer | Centralize position assignment, transfer, history logging, and validation rules in backend services. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 55 | Create position request validators | Add dedicated form requests for promote, relieve, and transfer operations. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 56 | Complete unit management APIs | Add unit tree listing, by-type lookup, create, update, archive, and delete behavior. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 57 | Harden hierarchical unit rules | Prevent illegal parent-child relationships and invalid unit-type transitions. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 58 | Add unit code and naming policy | Standardize organization codes, slug strategy, naming uniqueness, and display labels. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 59 | Add role-position-unit integration tests | Validate that role eligibility and unit hierarchy rules hold across transfers and promotions. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 60 | Document org-structure governance | Write operational guidance for how admins should manage units, positions, and promotions in production. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |

## Task 06 — Tasks, Audit, And ID Cards

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 61 | Review task management requirements | Validate task statuses, priorities, assignment rules, due dates, and subtask behavior against product needs. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 62 | Complete task CRUD workflows | Finalize admin create, update, view, and delete flows for member tasks. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 63 | Complete assignment workflow | Ensure tasks can be assigned to one or multiple members and updated safely. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 64 | Finalize member task progress updates | Review progress-note rules, completion timestamps, and audit expectations for member-submitted updates. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 65 | Add task summary reporting | Define open, overdue, completed, and per-unit task reporting for admin dashboards. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 66 | Review audit middleware coverage | Validate what actions are logged automatically and where explicit service-level logging is still required. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 67 | Harden audit retention strategy | Define audit storage duration, archival, redaction, and access-control policies. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 68 | Complete security-header strategy | Review response headers, frame policy, referrer policy, and fingerprint reduction for production. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 69 | Finalize ID card data contract | Confirm card fields, branding, QR contents, and verification link behavior. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 70 | Finalize ID card PDF generation | Validate PDF layout, image handling, QR rendering, and filename conventions for browser and download use cases. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 71 | Add ID verification endpoint design | Define the public/private verification workflow behind QR scans on printed or digital cards. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 72 | Add async processing backlog | Identify where queues should be used for card generation, notifications, exports, and heavy audit/reporting jobs. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |

## Task 07 — Frontend Public Pages

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 73 | Review frontend route map | Validate all public routes against current pages, lazy loading, layout use, and navigation expectations. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 74 | Finalize global layout shell | Review header, footer, navigation, mobile menu, and shared layout responsiveness. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 75 | Refine homepage content architecture | Finalize hero, stats, mission, programs, countdown, testimonials, and CTA sections. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 76 | Complete About page content | Add mission, vision, ideology, movement history, and leadership context with final copy. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 77 | Complete Leadership page | Replace placeholders with real leadership data, profile images, role details, and unit associations. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 78 | Complete Activities page | Connect activity data to reusable cards, filters, and media-ready layouts. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 79 | Complete News page | Define article source, listing layout, detail routing, and featured-story handling. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 80 | Complete Gallery page | Define image/video data source, lazy loading, modal previews, and optimization strategy. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 81 | Complete Contact page | Add validated contact form, office details, map embed policy, and fallback communication channels. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 82 | Complete public directory page | Implement search, filters, pagination, and public-safe member card display logic. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 83 | Complete public member profile page | Render approved public profile data, positions, unit details, and privacy-safe fields. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 84 | Finalize public content asset plan | Organize logos, imagery, placeholders, and media optimization for pages currently relying on sparse assets. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |

## Task 08 — Frontend Auth And Member Dashboard

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 85 | Finalize auth context behavior | Review token bootstrapping, current-user hydration, logout cleanup, and redirect rules. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 86 | Finalize login UX | Improve login validation, error display, pending/suspended messaging, and dashboard redirection. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 87 | Finalize registration stepper UX | Review step-by-step validation, file upload feedback, summaries, and success messaging. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 88 | Add registration draft persistence | Preserve unfinished admission form progress in local storage or session storage. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 89 | Complete member dashboard summary | Refine profile summary cards, active positions, task snapshots, and ID card access states. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 90 | Complete member profile page | Build editable member profile UI for personal details, education, addresses, and emergency contacts. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 91 | Complete member positions page | Display role/position history, current assignments, and unit hierarchy in a readable layout. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 92 | Complete member settings page | Add password, session, notification, and account-level settings appropriate for the current auth model. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 93 | Add member task management UI | Provide task list filters, progress updates, due-date cues, and completion confirmation UX. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 94 | Add ID card preview/download UX | Improve PDF preview, download states, failure handling, and mobile compatibility. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 95 | Standardize frontend API state handling | Unify loading, empty, error, retry, and toast patterns across auth and member pages. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 96 | Extract reusable member components | Move dashboard-specific UI from pages into `components/member` for maintainability and reuse. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |

## Task 09 — Frontend Admin Dashboard

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 97 | Finalize admin route protection | Ensure admin-only routes are guarded correctly in router and UI navigation. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 98 | Refine admin dashboard KPIs | Align frontend cards and charts with backend stats payloads and business priorities. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 99 | Refine recent activity feed | Improve audit-feed formatting, timestamps, empty states, and deep links into admin modules. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 100 | Complete pending approvals screen | Finalize document review, member preview, approve/reject confirmations, and reason capture. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 101 | Complete all members screen | Finalize member filters, status actions, pagination, badges, bulk actions, and detail linking. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 102 | Complete member detail screen | Build full admin member detail view with tabs for profile, documents, positions, and audit history. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 103 | Complete role management UI | Build role list, create/edit forms, permission matrix, and deletion safeguards. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 104 | Complete unit management UI | Build hierarchy tree, add/edit dialogs, activation states, and safe deletion warnings. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 105 | Complete position management UI | Build promote, relieve, and transfer workflows with search and validation support. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 106 | Complete position history UI | Provide timeline and filterable history views for units and members. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 107 | Add admin task management UI | Build admin-side task list, create/edit flows, assignee picker, and status reporting. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 108 | Extract reusable admin components | Move table, filter, modal, and summary patterns into `components/admin` for reuse. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |

## Task 10 — Backend Testing

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 109 | Clean placeholder test files | Replace example tests with domain-relevant backend feature and unit tests. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 110 | Expand auth feature tests | Cover invalid login, token refresh, logout failures, suspended users, and admin login flows. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 111 | Expand registration feature tests | Cover all validation rules, file uploads, encryption, unit assignment, and duplicate-mobile scenarios. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 112 | Add profile API feature tests | Verify authenticated profile read, update, photo upload, and authorization failures. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 113 | Add admin member operation tests | Cover approve, reject, suspend, expel, update, delete, and document-review endpoints. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 114 | Add RBAC feature tests | Verify role CRUD, permission sync, admin middleware, and privilege-escalation prevention. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 115 | Add task management feature tests | Cover task CRUD, assignment creation, member progress updates, and status transitions. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 116 | Add ID card feature tests | Verify access rules, PDF response headers, and generation failures for active/inactive members. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 117 | Add middleware tests | Validate `AdminMiddleware`, `ActiveMemberMiddleware`, `AuditMiddleware`, and `SecurityHeadersMiddleware`. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 118 | Add service unit tests | Unit-test member ID generation, upload service behavior, audit logging, and ID card composition logic. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 119 | Add seeder and migration smoke tests | Verify schema can migrate and seed cleanly in CI and test environments. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 120 | Add API contract regression suite | Build repeatable endpoint contract tests for payload structure, error shape, and pagination metadata. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |

## Task 11 — Frontend Testing, Security, And Quality

| ID | Task Name | Description | Dev Status | Test Status | Upload Status | Overall Status |
| --- | --- | --- | --- | --- | --- | --- |
| 121 | Set up frontend test framework | Add Vitest or Jest, React Testing Library, coverage reporting, and test scripts. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
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
| 133 | Define deployment topology | Choose target hosting for Laravel API, database, storage, and React frontend delivery. | Pending | Pending | Pending | Pending |
| 134 | Create Dockerization backlog | Design Dockerfiles, compose stack, and local container workflow for backend, frontend, and database. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 135 | Design CI pipeline | Add automated install, lint, migrate, test, and build stages for pull requests and mainline deployments. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 136 | Design CD pipeline | Define staging and production release flow, artifact promotion, secret injection, and rollback procedure. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 137 | Define secret-management policy | Move environment secrets, JWT keys, DB credentials, and third-party tokens into a secure secret workflow. | Pending | Pending | Pending | Pending |
| 138 | Define backup and restore plan | Create backup cadence and restoration procedures for database, uploads, and audit records. | Pending | Pending | Pending | Pending |
| 139 | Define logging and monitoring plan | Add application logs, queue logs, audit dashboards, uptime checks, and alerting strategy. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 140 | Define caching and scaling plan | Plan Redis or alternative cache strategy, queue workers, and future horizontal scaling needs. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 141 | Produce API documentation package | Convert blueprint-level API docs into developer-ready endpoint documentation or OpenAPI output. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 142 | Produce frontend handoff guide | Document route map, service contracts, component ownership, and environment setup for frontend contributors. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 143 | Produce operations runbook | Write procedures for incident response, deployment checks, storage linking, seeding, and smoke tests. This task can be implemented using AI-assisted development. | Pending | Pending | Pending | Pending |
| 144 | Plan go-live checklist | Create final readiness gates covering dev complete, test complete, security sign-off, content sign-off, and deployment approval. | Pending | Pending | Pending | Pending |

