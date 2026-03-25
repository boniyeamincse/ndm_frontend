# NDM Student Wing — Complete Software Blueprint
## Full Structure · All Pages · All Dashboards · All Tasks

> **Nationalist Democratic Movement (NDM) Bangladesh — Student Wing**
> Laravel 11 REST API + React 19 Frontend
> Last Updated: March 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack Summary](#2-tech-stack-summary)
3. [Database Schema Map](#3-database-schema-map)
4. [API — Complete File & Folder Structure](#4-api--complete-file--folder-structure)
5. [API — All Endpoints Reference](#5-api--all-endpoints-reference)
6. [Frontend — Complete File & Folder Structure](#6-frontend--complete-file--folder-structure)
7. [Public Website Pages (8 Pages)](#7-public-website-pages-8-pages)
8. [Member Dashboard (After Login)](#8-member-dashboard-after-login)
9. [Admin Dashboard (After Admin Login)](#9-admin-dashboard-after-admin-login)
10. [All Routes Map (Frontend)](#10-all-routes-map-frontend)
11. [Design System Reference](#11-design-system-reference)
12. [Task Progress Tracker](#12-task-progress-tracker)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────┐
│         NDM Student Wing Platform                │
│                                                 │
│  ┌──────────────┐      ┌─────────────────────┐  │
│  │  React App   │ ───► │  Laravel 11 API     │  │
│  │  (viva-react)│  JWT │  (ndm-api)          │  │
│  │  Port: 5173  │      │  Port: 8000         │  │
│  └──────────────┘      └──────────┬──────────┘  │
│                                   │             │
│                        ┌──────────▼──────────┐  │
│                        │   MySQL 8 Database  │  │
│                        │  ndm_student_wing   │  │
│                        └─────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 1.1 Who Uses This System?

| User Type     | Access Level      | What They Can Do                                           |
|---------------|-------------------|------------------------------------------------------------|
| **Public**    | No login          | Browse website, view directory, search members             |
| **Member**    | JWT Login required| View & edit own profile, upload photo, view positions      |
| **Admin**     | Admin JWT required| Approve members, assign roles/positions, manage all data   |

### 1.2 Organizational Hierarchy

```
Central Committee (National)
  └── Division Committee        (8 divisions of Bangladesh)
        └── District Committee  (64 districts)
              └── Upazila Committee
                    └── Union Committee
                          └── Ward Committee
                                └── Campus / Institution Committee
```

### 1.3 Member Lifecycle

```
Register (pending) ──► Admin Approves ──► Active ──► Assigned Position
                   └── Admin Rejects ──► Deleted

Active ──► Admin Suspends ──► Suspended (positions removed, login blocked)
      └──► Admin Expels  ──► Expelled  (positions removed, login blocked)
```

---

## 2. Tech Stack Summary

### Backend (ndm-api)
| Component     | Technology           | Notes                          |
|---------------|----------------------|--------------------------------|
| Framework     | Laravel 11           | API mode, no Blade             |
| Language      | PHP 8.2+             | Strict typing, enums           |
| Database      | MySQL 8.0            | InnoDB, utf8mb4                |
| Auth          | tymon/jwt-auth v2    | Stateless JWT tokens           |
| File Storage  | Laravel Storage      | Public disk for photos         |
| Validation    | Form Requests        | One class per action           |
| API Output    | API Resources        | Consistent JSON format         |
| Testing       | PHPUnit / Pest       | Feature + unit tests           |

### Frontend (viva-react)
| Component     | Technology           | Notes                          |
|---------------|----------------------|--------------------------------|
| Framework     | React 19 + Vite      | Fast HMR build                 |
| Styling       | Tailwind CSS v3      | Brand design system            |
| Animation     | Framer Motion        | Page transitions, hover fx     |
| Routing       | React Router v6      | `createBrowserRouter`          |
| API Client    | Axios                | JWT interceptor built-in       |
| State         | Context API + Hooks  | No external state library      |
| Forms         | react-hook-form      | (Planned)                      |

---

## 3. Database Schema Map

### Tables & Relationships

```
users
  id, email, password, user_type(admin|member), is_active
    │
    └── members (1:1 via user_id)
          id, user_id, member_id, full_name, father_name, mother_name
          date_of_birth, gender, nid_or_bc, blood_group, phone, email
          present_address, permanent_address, institution, department
          session, photo_path, status(pending|active|suspended|expelled)
          approved_by → users(id), approved_at, join_year
          organizational_unit_id → organizational_units(id)
                │
                ├── member_positions (1:many via member_id)
                │     id, member_id, role_id, unit_id,
                │     assigned_by, assigned_at, relieved_at, is_active, notes
                │
                └── position_history (audit log)
                      id, member_id, role_id, unit_id
                      action(assigned|relieved|transferred)
                      performed_by, performed_at, remarks

organizational_units
  id, name, type(central|division|district|upazila|union|ward|campus)
  parent_id (self-reference), code, description, is_active
  → Tree hierarchy: Central → Division → District → ... → Campus

roles
  id, title, unit_type(enum), rank_order, description
  is_active, created_by → users(id)

member_id_sequences
  year (PK), last_seq → used for atomic ID generation: 20261, 20262...
```

---

## 4. API — Complete File & Folder Structure

### Current State + Complete Planned Structure

```
ndm-api/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       └── GenerateMemberIdCommand.php          [PLANNED]
│   │
│   ├── Enums/
│   │   ├── Gender.php                               [DONE ✅]
│   │   ├── MemberStatus.php                         [DONE ✅]
│   │   ├── UnitType.php                             [DONE ✅]
│   │   └── PositionAction.php                       [PLANNED]
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── API/
│   │   │       ├── AuthController.php               [DONE ✅]
│   │   │       │     register(), login(), logout()
│   │   │       │     refresh(), me()
│   │   │       │
│   │   │       ├── MemberController.php             [DONE ✅]
│   │   │       │     publicProfile(), search()
│   │   │       │
│   │   │       ├── ProfileController.php            [PLANNED - Task 21]
│   │   │       │     me(), update(), uploadPhoto()
│   │   │       │
│   │   │       ├── Admin/
│   │   │       │   ├── AdminMemberController.php    [PLANNED - Task 28]
│   │   │       │   │     index(), pending(), show()
│   │   │       │   │     approve(), reject()
│   │   │       │   │     suspend(), expel()
│   │   │       │   │     update(), destroy()
│   │   │       │   │
│   │   │       │   ├── RoleController.php           [PLANNED - Task 38]
│   │   │       │   │     index(), store(), update(), destroy()
│   │   │       │   │
│   │   │       │   ├── PositionController.php       [PLANNED - Task 48]
│   │   │       │   │     promote(), relieve(), transfer()
│   │   │       │   │     index(), history(), memberHistory()
│   │   │       │   │
│   │   │       │   └── OrganizationalUnitController.php [PLANNED - Task 58]
│   │   │       │         index(), byType(), store()
│   │   │       │         update(), destroy()
│   │   │       │
│   │   │       └── Public/
│   │   │           └── DirectoryController.php      [PLANNED - Task 64]
│   │   │                 index(), central(), byUnit()
│   │   │
│   │   ├── Middleware/
│   │   │   ├── AdminMiddleware.php                  [DONE ✅]
│   │   │   └── ActiveMemberMiddleware.php           [PLANNED]
│   │   │
│   │   └── Requests/
│   │       ├── RegisterRequest.php                  [DONE ✅]
│   │       ├── LoginRequest.php                     [PLANNED]
│   │       ├── UpdateProfileRequest.php             [PLANNED - Task 22]
│   │       ├── CreateRoleRequest.php                [PLANNED - Task 39]
│   │       ├── UpdateRoleRequest.php                [PLANNED - Task 40]
│   │       ├── PromotePositionRequest.php           [PLANNED - Task 48]
│   │       ├── RelievePositionRequest.php           [PLANNED - Task 49]
│   │       ├── TransferPositionRequest.php          [PLANNED - Task 50]
│   │       └── CreateUnitRequest.php                [PLANNED - Task 60]
│   │
│   ├── Models/
│   │   ├── User.php                                 [DONE ✅]
│   │   ├── Member.php                               [DONE ✅]
│   │   ├── Role.php                                 [DONE ✅]
│   │   ├── OrganizationalUnit.php                   [DONE ✅]
│   │   ├── MemberPosition.php                       [DONE ✅]
│   │   └── PositionHistory.php                      [DONE ✅]
│   │
│   ├── Resources/
│   │   ├── MemberPublicResource.php                 [DONE ✅]
│   │   ├── MemberResource.php                       [PLANNED - Task 20]
│   │   ├── MemberListResource.php                   [PLANNED]
│   │   ├── PositionResource.php                     [PLANNED - Task 55]
│   │   ├── RoleResource.php                         [PLANNED - Task 43]
│   │   └── UnitResource.php                         [PLANNED - Task 56]
│   │
│   ├── Services/
│   │   ├── MemberIdService.php                      [DONE ✅]
│   │   ├── PhotoService.php                         [PLANNED - Task 23]
│   │   ├── MemberService.php                        [PLANNED]
│   │   └── PositionService.php                      [PLANNED - Task 46]
│   │
│   └── Providers/
│       └── AppServiceProvider.php                   [DONE ✅]
│
├── bootstrap/
│   ├── app.php                                      [DONE ✅ - admin alias registered]
│   └── providers.php
│
├── config/
│   ├── app.php, auth.php, database.php
│   ├── jwt.php                                      [DONE ✅]
│   └── cors.php                                     [DONE ✅]
│
├── database/
│   ├── migrations/
│   │   ├── create_users_table.php                   [DONE ✅]
│   │   ├── create_member_id_sequences_table.php     [DONE ✅]
│   │   ├── create_organizational_units_table.php    [DONE ✅]
│   │   ├── create_roles_table.php                   [DONE ✅]
│   │   ├── create_members_table.php                 [DONE ✅]
│   │   ├── create_member_positions_table.php        [DONE ✅]
│   │   └── create_position_history_table.php        [DONE ✅]
│   │
│   ├── seeders/
│   │   ├── DatabaseSeeder.php                       [DONE ✅]
│   │   ├── AdminSeeder.php                          [DONE ✅]
│   │   ├── RoleSeeder.php                           [DONE ✅]
│   │   └── OrganizationalUnitSeeder.php             [DONE ✅]
│   │
│   └── factories/
│       └── UserFactory.php                          [DONE ✅]
│
├── routes/
│   ├── api.php                                      [DONE ✅ - auth + member routes]
│   ├── console.php
│   └── web.php
│
├── storage/
│   └── app/public/photos/                           [Storage for uploaded photos]
│
├── tests/
│   ├── Feature/
│   │   ├── AuthTest.php                             [DONE ✅]
│   │   ├── MemberPublicProfileTest.php              [DONE ✅]
│   │   ├── MemberTest.php                           [PLANNED - Task 27]
│   │   ├── AdminMemberTest.php                      [PLANNED - Task 37]
│   │   ├── RoleTest.php                             [PLANNED - Task 45]
│   │   ├── PositionTest.php                         [PLANNED - Task 57]
│   │   ├── DirectoryTest.php                        [PLANNED - Task 69]
│   │   └── UnitTest.php                             [PLANNED - Task 63]
│   └── Unit/
│       ├── MemberIdServiceTest.php                  [PLANNED]
│       └── PositionServiceTest.php                  [PLANNED]
│
├── .env                                             [DONE ✅]
├── .env.example
├── composer.json
├── phpunit.xml                                      [DONE ✅ - JWT_SECRET added]
└── README.md
```

---

## 5. API — All Endpoints Reference

### Authentication (Public)
| Method | URL                    | Auth  | Description                              |
|--------|------------------------|-------|------------------------------------------|
| POST   | /api/auth/register     | None  | Register new member (status = pending)   |
| POST   | /api/auth/login        | None  | Login, returns JWT token                 |
| POST   | /api/auth/logout       | JWT   | Invalidate current token                 |
| POST   | /api/auth/refresh      | JWT   | Refresh JWT token                        |
| GET    | /api/auth/me           | JWT   | Get currently authenticated user         |

### Member Profile (Own)
| Method | URL                    | Auth     | Description                              |
|--------|------------------------|----------|------------------------------------------|
| GET    | /api/members/me        | JWT      | Get own full profile                     |
| PUT    | /api/members/me        | JWT      | Update own profile fields                |
| POST   | /api/members/me/photo  | JWT      | Upload profile photo                     |

### Member Public
| Method | URL                                | Auth  | Description                              |
|--------|------------------------------------|-------|------------------------------------------|
| GET    | /api/members/{member_id}           | None  | Public profile by member ID              |
| GET    | /api/members/search?q=&unit_id=    | None  | Search active members                    |

### Admin — Members
| Method | URL                                | Auth  | Description                              |
|--------|------------------------------------|-------|------------------------------------------|
| GET    | /api/admin/members                 | Admin | List all members (filtered, paginated)   |
| GET    | /api/admin/members/pending         | Admin | Pending approval queue                   |
| GET    | /api/admin/members/{id}            | Admin | View single member detail                |
| POST   | /api/admin/members/{id}/approve    | Admin | Approve pending member                   |
| POST   | /api/admin/members/{id}/reject     | Admin | Reject & delete registration             |
| POST   | /api/admin/members/{id}/suspend    | Admin | Suspend active member                    |
| POST   | /api/admin/members/{id}/expel      | Admin | Expel member permanently                 |
| PUT    | /api/admin/members/{id}            | Admin | Edit member data                         |
| DELETE | /api/admin/members/{id}            | Admin | Hard delete member                       |

### Admin — Roles
| Method | URL                    | Auth  | Description                         |
|--------|------------------------|-------|-------------------------------------|
| GET    | /api/admin/roles       | Admin | List all roles by unit type         |
| POST   | /api/admin/roles       | Admin | Create new role                     |
| PUT    | /api/admin/roles/{id}  | Admin | Update role title/rank              |
| DELETE | /api/admin/roles/{id}  | Admin | Soft-deactivate role                |

### Admin — Positions
| Method | URL                                      | Auth  | Description                    |
|--------|------------------------------------------|-------|--------------------------------|
| GET    | /api/admin/positions                     | Admin | All active positions           |
| GET    | /api/admin/positions/history             | Admin | Full audit trail               |
| GET    | /api/admin/positions/{member_id}         | Admin | History for one member         |
| POST   | /api/admin/positions/promote             | Admin | Promote member to role/unit    |
| POST   | /api/admin/positions/{id}/relieve        | Admin | Remove from position           |
| POST   | /api/admin/positions/{id}/transfer       | Admin | Transfer to different unit     |

### Admin — Organizational Units
| Method | URL                    | Auth  | Description                         |
|--------|------------------------|-------|-------------------------------------|
| GET    | /api/admin/units       | Admin | All units (admin view)              |
| POST   | /api/admin/units       | Admin | Create new unit                     |
| PUT    | /api/admin/units/{id}  | Admin | Update unit                         |
| DELETE | /api/admin/units/{id}  | Admin | Deactivate unit                     |

### Public Directory
| Method | URL                           | Auth  | Description                         |
|--------|-------------------------------|-------|-------------------------------------|
| GET    | /api/directory                | None  | All units with member counts        |
| GET    | /api/directory/central        | None  | Central committee listing           |
| GET    | /api/directory/{unit_id}      | None  | Committee for any unit              |
| GET    | /api/units                    | None  | Full unit tree                      |
| GET    | /api/units/{type}             | None  | Units filtered by type              |

---

## 6. Frontend — Complete File & Folder Structure

### Current State + Complete Planned Structure

```
viva-react/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
│
└── src/
    ├── main.jsx                      [DONE ✅] - ReactDOM root + providers
    ├── App.jsx                       [DONE ✅] - RouterProvider wrapper
    ├── index.css                     [DONE ✅] - Tailwind directives
    │
    ├── assets/                       [DONE ✅]
    │   └── logo, images, icons
    │
    ├── config/
    │   ├── env.js                    [PLANNED] - ENV variable validation
    │   └── animations.js             [PLANNED] - Framer Motion variants
    │
    ├── constants/
    │   ├── theme.js                  [DONE ✅] - Colors, fonts, breakpoints
    │   └── icons.js                  [PLANNED] - Icon name→component map
    │
    ├── context/
    │   ├── AppContext.jsx             [DONE ✅] - darkMode, mobileMenu, loading
    │   ├── AuthContext.jsx            [PLANNED] - user, token, login, logout
    │   └── ToastContext.jsx           [PLANNED] - Toast notification system
    │
    ├── data/
    │   └── index.js                  [DONE ✅] - navLinks, stats, leaders, news, activities
    │
    ├── hooks/
    │   ├── index.js                  [DONE ✅] - useScrollY, useInView, useCounter, useDebounce
    │   ├── useAuth.js                [PLANNED] - useContext(AuthContext)
    │   ├── useApi.js                 [PLANNED] - data fetching with loading/error
    │   └── useModal.js               [PLANNED] - Modal open/close state
    │
    ├── services/
    │   ├── api.js                    [DONE ✅] - Axios instance + JWT interceptor
    │   ├── authService.js            [PLANNED] - login, register, logout, me APIs
    │   ├── memberService.js          [PLANNED] - profile, search, photo APIs
    │   └── adminService.js           [PLANNED] - admin CRUD APIs
    │
    ├── styles/
    │   └── globals.css               [DONE ✅] - CSS variables + reset
    │
    ├── utils/
    │   ├── formatters.js             [PLANNED] - date, name, status formatters
    │   └── validators.js             [PLANNED] - phone, NID, email validators
    │
    ├── router/
    │   └── index.jsx                 [DONE ✅] - createBrowserRouter all routes
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx            [DONE ✅] - Navbar + Footer wrapper
    │   │   ├── Navbar.jsx            [DONE ✅] - Sticky nav with mobile menu
    │   │   └── Footer.jsx            [DONE ✅] - Multi-column footer
    │   │
    │   ├── ui/
    │   │   ├── Button.jsx            [DONE ✅] - primary, danger, outline, gold
    │   │   ├── Card.jsx              [PLANNED] - News, Leader, Stat cards
    │   │   ├── Badge.jsx             [PLANNED] - Status badges (active, pending...)
    │   │   ├── Modal.jsx             [PLANNED] - Reusable modal system
    │   │   ├── Loading.jsx           [PLANNED] - Skeleton + spinner + page loader
    │   │   ├── Toast.jsx             [PLANNED] - Toast notification UI
    │   │   ├── Pagination.jsx        [PLANNED] - Page navigator
    │   │   ├── Dropdown.jsx          [PLANNED] - Accessible dropdown menu
    │   │   ├── Input.jsx             [PLANNED] - Styled form input
    │   │   ├── Select.jsx            [PLANNED] - Styled select
    │   │   ├── Textarea.jsx          [PLANNED] - Styled textarea
    │   │   └── Table.jsx             [PLANNED] - Admin data table component
    │   │
    │   ├── common/
    │   │   ├── SectionHeader.jsx     [PLANNED] - Reusable section title block
    │   │   ├── EmptyState.jsx        [PLANNED] - No data placeholder
    │   │   ├── ErrorBoundary.jsx     [PLANNED] - React error boundary
    │   │   └── ProtectedRoute.jsx    [PLANNED] - Auth guard for private routes
    │   │
    │   ├── home/
    │   │   ├── Hero.jsx              [DONE ✅] - Full-screen hero section
    │   │   ├── StatsCounter.jsx      [PLANNED] - Animated stat numbers
    │   │   ├── NewsPreview.jsx       [PLANNED] - Latest news preview
    │   │   ├── ProgramsGrid.jsx      [PLANNED] - Programs/activities cards
    │   │   ├── MissionBanner.jsx     [PLANNED] - Brand quote banner
    │   │   ├── Testimonials.jsx      [PLANNED] - Member voice carousel
    │   │   ├── JoinCTA.jsx           [PLANNED] - Call to action + quick form
    │   │   ├── ImpactTimeline.jsx    [PLANNED] - Milestone timeline
    │   │   ├── DistrictMap.jsx       [PLANNED] - Bangladesh district filter
    │   │   └── EventCountdown.jsx    [PLANNED] - Countdown to next event
    │   │
    │   ├── member/                   [ALL PLANNED]
    │   │   ├── ProfileCard.jsx       - Member info card with photo
    │   │   ├── PositionBadge.jsx     - Role + unit badge
    │   │   ├── ProfileForm.jsx       - Edit profile fields
    │   │   └── PhotoUpload.jsx       - Drag-and-drop photo upload
    │   │
    │   └── admin/                    [ALL PLANNED]
    │       ├── MemberTable.jsx       - Paginated member data table
    │       ├── MemberActions.jsx     - Approve/reject/suspend buttons
    │       ├── RoleTable.jsx         - Role management table
    │       ├── PositionTable.jsx     - Active positions overview
    │       ├── UnitTree.jsx          - Hierarchical unit browser
    │       ├── StatCard.jsx          - Dashboard stat KPI card
    │       └── ActivityFeed.jsx      - Recent actions log
    │
    └── pages/
        │
        ├── ── PUBLIC WEBSITE ──
        │
        ├── Home.jsx                  [DONE ✅]
        ├── About.jsx                 [DONE ✅]
        ├── News.jsx                  [DONE ✅]
        ├── Activities.jsx            [DONE ✅]
        ├── Leadership.jsx            [DONE ✅]
        ├── Gallery.jsx               [DONE ✅]
        ├── Contact.jsx               [DONE ✅]
        ├── JoinUs.jsx                [DONE ✅]
        │
        ├── Register.jsx              [PLANNED] - Full registration form
        ├── MemberProfile.jsx         [PLANNED] - Public member profile page
        │                                         (uses GET /api/members/{id})
        ├── Directory.jsx             [PLANNED] - Public member directory
        ├── NotFound.jsx              [PLANNED] - 404 page
        │
        ├── auth/
        │   └── Login.jsx             [DONE ✅]
        │
        ├── ── MEMBER DASHBOARD ──
        │
        └── dashboard/
            ├── member/
            │   ├── MemberDashboard.jsx      [PLANNED] - Member home
            │   ├── MemberProfilePage.jsx    [PLANNED] - View/edit own profile
            │   ├── MemberPositions.jsx      [PLANNED] - My positions history
            │   └── MemberSettings.jsx       [PLANNED] - Password change
            │
            └── admin/
                ├── AdminDashboard.jsx       [PLANNED] - Admin home + KPIs
                ├── PendingApprovals.jsx     [PLANNED] - Approval queue
                ├── AllMembers.jsx           [PLANNED] - Full member table
                ├── MemberDetail.jsx         [PLANNED] - View/edit one member
                ├── RoleManagement.jsx       [PLANNED] - Create/edit roles
                ├── PositionManagement.jsx   [PLANNED] - Promote/relieve/transfer
                ├── UnitManagement.jsx       [PLANNED] - Org unit tree editor
                └── PositionHistory.jsx      [PLANNED] - Audit log
```

---

## 7. Public Website Pages (8 Pages)

### Page 1: Home (`/`)
**Status:** DONE ✅

**Sections:**
- Hero — full viewport, background image, animated headline + CTA buttons
- Stats Counter — 4 animated KPI numbers (members, districts, years, units)
- About Teaser — 2-column: text + image
- Programs Grid — 6 activity cards
- News Preview — featured news + 3 side cards
- Mission Banner — deep green, Playfair quote, Vision/Mission columns
- Testimonials — auto-rotating member quotes carousel
- Join CTA — split layout: benefits left, quick form right
- Partners Strip — scrolling logo marquee

---

### Page 2: About (`/about`)
**Status:** DONE ✅

**Sections:**
- Hero header (green gradient)
- Who We Are — mission statement
- History Timeline — organization milestones
- Vision & Mission — two-column cards
- Core Values — icon grid
- Leadership preview teaser

---

### Page 3: News (`/news`)
**Status:** DONE ✅

**Sections:**
- Hero header
- Featured News Article (large)
- News Grid (3 columns, paginated)
- Category filter pills (All, Events, Achievements, Announcements)
- Newsletter signup strip

---

### Page 4: Activities (`/activities`)
**Status:** DONE ✅

**Sections:**
- Hero header
- Programs overview cards
- Upcoming Events list
- Past Programs gallery strip
- Impact statistics

---

### Page 5: Leadership (`/leadership`)
**Status:** DONE ✅

**Sections:**
- Hero header
- Central Committee cards (president, VP, secretary...)
- Division leaders accordion/grid
- Contact leadership form

---

### Page 6: Gallery (`/gallery`)
**Status:** DONE ✅

**Sections:**
- Hero header
- Filter tabs (All, Events, Rallies, Programs)
- Masonry photo grid
- Lightbox modal on click

---

### Page 7: Contact (`/contact`)
**Status:** DONE ✅

**Sections:**
- Hero header
- Contact form (name, email, subject, message)
- Office addresses cards (central + divisions)
- Social media links strip
- Map embed (central office)

---

### Page 8: Join Us (`/join`)
**Status:** DONE ✅

**Sections:**
- Hero header
- Why Join NDM — benefits grid
- Requirements checklist
- Registration link button → /register
- FAQ accordion

---

### Page 9: Register (`/register`)
**Status:** PLANNED

**Form Fields:**
- Full Name (required)
- Email Address (required, unique)
- Password + Confirm Password (min 8)
- Phone Number
- Date of Birth
- Gender select
- NID / Birth Certificate number
- Institution name
- Department
- Academic Session
- Organizational Unit (searchable select — loads from `/api/units/campus`)
- Present Address
- Submit → POST /api/auth/register

**UX:**
- Multi-step form wizard (Step 1: Account, Step 2: Personal, Step 3: Academic)
- Progress bar
- Success state: "Your application has been submitted! ID: 20261. Pending admin approval."

---

### Page 10: Member Directory (`/directory`)
**Status:** PLANNED

**Sections:**
- Search bar (name, member_id, institution)
- Division filter tabs
- Member cards grid (photo, name, role badge, unit)
- Pagination
- Click → /members/{member_id} public profile page

---

### Page 11: Public Member Profile (`/members/:member_id`)
**Status:** PLANNED

**Sections:**
- Profile card (photo, name, member_id, join year)
- Current position badge (role title + unit name)
- Institution & department
- Position history timeline

---

## 8. Member Dashboard (After Login)

**Route prefix:** `/dashboard/member`
**Auth guard:** `ProtectedRoute` checks `localStorage.token` + not admin

### Page: Member Dashboard Home (`/dashboard/member`)
```
┌─────────────────────────────────────────────────────────────┐
│  👤 Welcome back, Ahmad Al-Rashid                           │
│  Member ID: 20261  |  Status: Active  |  Unit: Dhaka Campus │
├──────────────────────┬──────────────────────────────────────┤
│  MY PROFILE          │  MY POSITIONS                        │
│  ─────────────────── │  ─────────────────────────────────── │
│  📷 Profile Photo    │  🏅 Campus President                 │
│     [Change Photo]   │     Dhaka University Campus Unit     │
│                      │     Assigned: Jan 15, 2026           │
│  Full Name           │                                      │
│  Ahmad Al-Rashid     │  ─────────────────────────────────── │
│                      │  📜 Position History                 │
│  Institution         │  • Asst. Secretary — Dec 2024        │
│  Dhaka University    │  • Volunteer — Jun 2024              │
│                      │                                      │
│  [Edit Profile]      │                                      │
├──────────────────────┴──────────────────────────────────────┤
│  ⚙️ ACCOUNT                                                  │
│  [Change Password]  [Notifications]                         │
└─────────────────────────────────────────────────────────────┘
```

**Pages:**
| Route                            | Component              | Description              |
|----------------------------------|------------------------|--------------------------|
| /dashboard/member                | MemberDashboard.jsx    | Home + quick summary     |
| /dashboard/member/profile        | MemberProfilePage.jsx  | View + edit full profile |
| /dashboard/member/positions      | MemberPositions.jsx    | Position history list    |
| /dashboard/member/settings       | MemberSettings.jsx     | Password change          |

---

## 9. Admin Dashboard (After Admin Login)

**Route prefix:** `/dashboard/admin`
**Auth guard:** `ProtectedRoute` checks `user_type === 'admin'`

### Page: Admin Dashboard Home (`/dashboard/admin`)

```
┌─────────────────────────────────────────────────────────────┐
│  🏛️ NDM Admin Dashboard              [Admin: SuperAdmin]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  12,450  │  │    47    │  │   284    │  │   8 Div  │   │
│  │  Members │  │ Pending  │  │ Positions│  │  Units   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                  ⚠️ Needs Review                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  QUICK ACTIONS                                               │
│  [👤 Pending Approvals (47)]  [➕ Assign Position]           │
│  [📋 All Members]             [⚙️ Manage Roles]              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  RECENT ACTIVITY FEED                                        │
│  ─────────────────────────────────────────────              │
│  ✅ Admin approved "Fatema Begum" (20262) — 2 min ago        │
│  🏅 Assigned "Campus VP" to Ahmad (20261) — 1 hr ago        │
│  🚫 Rejected registration "Unknown User" — 3 hr ago         │
│  ✅ Admin approved "Karim Uddin" (20260) — 5 hr ago          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### All Admin Dashboard Pages

| Route                               | Component              | API Calls                              |
|-------------------------------------|------------------------|----------------------------------------|
| /dashboard/admin                    | AdminDashboard.jsx     | Stats, recent activity                 |
| /dashboard/admin/pending            | PendingApprovals.jsx   | GET /api/admin/members/pending         |
| /dashboard/admin/members            | AllMembers.jsx         | GET /api/admin/members                 |
| /dashboard/admin/members/:id        | MemberDetail.jsx       | GET /api/admin/members/:id             |
| /dashboard/admin/roles              | RoleManagement.jsx     | GET/POST /api/admin/roles              |
| /dashboard/admin/positions          | PositionManagement.jsx | GET /api/admin/positions               |
| /dashboard/admin/positions/promote  | PromoteMember.jsx      | POST /api/admin/positions/promote      |
| /dashboard/admin/positions/history  | PositionHistory.jsx    | GET /api/admin/positions/history       |
| /dashboard/admin/units              | UnitManagement.jsx     | GET/POST /api/admin/units              |

---

### Admin Dashboard — Page Designs

#### Pending Approvals (`/dashboard/admin/pending`)
```
┌───────────────────────────────────────────────────────────┐
│  ⏳ Pending Member Approvals (47)                          │
├───────────────────────────────────────────────────────────┤
│  Search: [_______________] Filter: [All Units ▼]          │
├──────┬────────────────┬──────────────┬────────────────────┤
│  #   │ Name           │ Institution  │ Actions            │
├──────┼────────────────┼──────────────┼────────────────────┤
│  1   │ Ahmad Al-Rashid│ DU / CSE     │ [✅ Approve] [❌ Reject] [👁 View] │
│  2   │ Fatema Begum   │ BUET / EEE   │ [✅ Approve] [❌ Reject] [👁 View] │
│  ... │ ...            │ ...          │ ...                │
├──────┴────────────────┴──────────────┴────────────────────┤
│  Showing 20/47   [← Prev]  [1] [2] [3]  [Next →]         │
└───────────────────────────────────────────────────────────┘
```

#### All Members (`/dashboard/admin/members`)
```
┌───────────────────────────────────────────────────────────┐
│  👥 All Members                                    [Export]│
├───────────────────────────────────────────────────────────┤
│  Search: [_____] Status: [All ▼] Unit: [All ▼] Year: [▼] │
├──────┬────────────┬─────────┬──────────┬──────────────────┤
│  ID  │ Name       │ Status  │ Unit     │ Actions           │
├──────┼────────────┼─────────┼──────────┼──────────────────┤
│20261 │ Ahmad      │ 🟢Active│ DU Campus│ [Edit] [Suspend]  │
│20262 │ Fatema     │ 🟡Pend. │ BUET Camp│ [Approve][Reject] │
│20263 │ Karim      │ 🔴Susp. │ CU Campus│ [View] [Expel]    │
│  ... │ ...        │ ...     │ ...      │ ...               │
└───────────────────────────────────────────────────────────┘
```

#### Role Management (`/dashboard/admin/roles`)
```
┌───────────────────────────────────────────────────────────┐
│  🎖️ Role Management                         [+ Add Role]  │
├──────────────────┬───────────────────────────────────────┤
│  CAMPUS ROLES    │  DISTRICT ROLES                       │
│  ─────────────── │  ───────────────────────────────────  │
│  [1] President   │  [1] District President               │
│  [2] VP          │  [2] General Secy                     │
│  [3] Secretary   │  [3] Finance Secy                     │
│  [4] Asst. Secy  │  ...                                  │
│  [Edit] [Delete] │  [Edit] [Delete]                      │
└──────────────────┴───────────────────────────────────────┘
```

#### Position Promotion (`/dashboard/admin/positions/promote`)
```
┌───────────────────────────────────────────────────────────┐
│  🏅 Assign Position to Member                             │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  1. Search Member:  [Ahmad Al-Rashid ▼]  ID: 20261       │
│     Status: 🟢 Active                                     │
│                                                           │
│  2. Select Role:    [Campus President ▼]                  │
│     Unit Type: campus                                     │
│                                                           │
│  3. Select Unit:    [Dhaka University Campus Unit ▼]      │
│     Type: campus ✅ (matches role)                        │
│                                                           │
│  ⚠️ This will auto-relieve the current holder if any.     │
│                                                           │
│  [Cancel]                         [🏅 Assign Now]         │
└───────────────────────────────────────────────────────────┘
```

---

## 10. All Routes Map (Frontend)

```
/ ─────────────────────────── Home (public)
/about ──────────────────────── About (public)
/news ───────────────────────── News (public)
/activities ─────────────────── Activities (public)
/leadership ─────────────────── Leadership (public)
/gallery ────────────────────── Gallery (public)
/contact ────────────────────── Contact (public)
/join ───────────────────────── Join Us (public)
/register ───────────────────── Registration form (public)
/members ────────────────────── Public directory (public)
/members/:member_id ─────────── Public member profile (public)
/login ──────────────────────── Login (guest only)
/dashboard/member ───────────── Member home (auth: member)
/dashboard/member/profile ───── Edit profile (auth: member)
/dashboard/member/positions ─── Position history (auth: member)
/dashboard/member/settings ──── Settings (auth: member)
/dashboard/admin ────────────── Admin home (auth: admin)
/dashboard/admin/pending ─────── Approval queue (auth: admin)
/dashboard/admin/members ────── All members (auth: admin)
/dashboard/admin/members/:id ─── Member detail (auth: admin)
/dashboard/admin/roles ──────── Role management (auth: admin)
/dashboard/admin/positions ───── Active positions (auth: admin)
/dashboard/admin/positions/promote ── Promote form (auth: admin)
/dashboard/admin/positions/history ── Audit log (auth: admin)
/dashboard/admin/units ──────── Unit management (auth: admin)
* ──────────────────────────── 404 Not Found
```

---

## 11. Design System Reference

### Brand Colors
| Token       | Value     | Usage                              |
|-------------|-----------|-------------------------------------|
| Primary     | `#006A4E` | Buttons, headers, brand elements   |
| Accent Red  | `#DC143C` | Alerts, badges, CTAs               |
| Gold        | `#F0C040` | Highlights, decorative accents     |
| Dark BG     | `#0F1A14` | Dark mode background               |
| Light BG    | `#F8FAF9` | Light mode background              |

### Typography
| Font              | Role         | Weights       |
|-------------------|--------------|---------------|
| Playfair Display  | Display/h1-h3| 700, 800, 900 |
| DM Sans           | Body/UI      | 400, 500, 600 |

### Spacing Scale
Uses Tailwind 4-unit spacing (4px base). Common use: `p-6` (24px), `gap-8` (32px), `px-4 md:px-8 lg:px-16` for containers.

### Component States
| State      | Visual                          |
|------------|---------------------------------|
| Active     | Green bg + white text           |
| Pending    | Yellow bg + dark text           |
| Suspended  | Orange bg + white text          |
| Expelled   | Red bg + white text             |
| Hover      | scale(1.02) + shadow increase   |
| Disabled   | opacity-50 + cursor-not-allowed |

---

## 12. Task Progress Tracker

### Phase 1 — Project Setup
| # | Task                          | Status |
|---|-------------------------------|--------|
| 1 | Create Laravel Project        | ✅ Done |
| 2 | Configure .env                | ✅ Done |
| 3 | Install JWT Auth              | ✅ Done |
| 4 | Configure CORS                | ✅ Done |
| 5 | Create All Enums              | ✅ Done |
| 6 | Create All Migrations         | ✅ Done |
| 7 | Create All Models             | ✅ Done |
| 8 | Admin Seeder                  | ✅ Done |
| 9 | OrganizationalUnit Seeder     | ✅ Done |
| 10| Role Seeder                   | ✅ Done |

### Phase 2 — Authentication
| # | Task                          | Status |
|---|-------------------------------|--------|
| 11| User Model JWT Interface      | ✅ Done |
| 12| RegisterRequest Validation    | ✅ Done |
| 13| MemberIdService               | ✅ Done |
| 14| AuthController::register()    | ✅ Done |
| 15| AuthController::login()       | ✅ Done |
| 16| AdminMiddleware               | ✅ Done |
| 17| logout() + refresh()          | ✅ Done |
| 18| Auth Feature Tests            | ✅ Done |

### Phase 3 — Member Profile
| # | Task                          | Status |
|---|-------------------------------|--------|
| 19| MemberPublicResource          | ✅ Done |
| 20| MemberResource (Private)      | ⏳ Next |
| 21| ProfileController::me()       | ⏳ Todo |
| 22| ProfileController::update()   | ⏳ Todo |
| 23| PhotoService                  | ⏳ Todo |
| 24| Photo Upload Endpoint         | ⏳ Todo |
| 25| MemberController::publicProfile| ✅ Done |
| 26| Member Search                 | ⏳ Todo |
| 27| Member Feature Tests          | ⏳ Todo |

### Phase 4 — Admin Member Management
| # | Task                          | Status |
|---|-------------------------------|--------|
| 28| AdminMemberController::index()| ⏳ Todo |
| 29| pending()                     | ⏳ Todo |
| 30| approve()                     | ⏳ Todo |
| 31| reject()                      | ⏳ Todo |
| 32| suspend()                     | ⏳ Todo |
| 33| expel()                       | ⏳ Todo |
| 34| deactivateAllPositions()      | ⏳ Todo |
| 35| AdminMember update()          | ⏳ Todo |
| 36| AdminMember destroy()         | ⏳ Todo |
| 37| Admin Member Tests            | ⏳ Todo |

### Phase 5 — Role Management
| # | Task                          | Status |
|---|-------------------------------|--------|
| 38| RoleController::index()       | ⏳ Todo |
| 39| RoleController::store()       | ⏳ Todo |
| 40| RoleController::update()      | ⏳ Todo |
| 41| RoleController::destroy()     | ⏳ Todo |
| 42| Role/Unit Type Validation     | ⏳ Todo |
| 43| RoleResource                  | ⏳ Todo |
| 44| Seed All Roles (35+)          | ⏳ Todo |
| 45| Role Feature Tests            | ⏳ Todo |

### Phase 6 — Position & Promotion
| # | Task                          | Status |
|---|-------------------------------|--------|
| 46| PositionService               | ⏳ Todo |
| 47| PositionService::promote()    | ⏳ Todo |
| 48| PositionController::promote() | ⏳ Todo |
| 49| PositionService::relieve()    | ⏳ Todo |
| 50| PositionService::transfer()   | ⏳ Todo |
| 51| PositionController::index()   | ⏳ Todo |
| 52| PositionController::history() | ⏳ Todo |
| 53| memberHistory()               | ⏳ Todo |
| 54| Auto-revoke on suspend/expel  | ⏳ Todo |
| 55| PositionResource              | ⏳ Todo |
| 56| UnitResource                  | ⏳ Todo |
| 57| Position Feature Tests        | ⏳ Todo |

### Phase 7 — Organizational Units
| # | Task                          | Status |
|---|-------------------------------|--------|
| 58| UnitController::index() tree  | ⏳ Todo |
| 59| UnitController::byType()      | ⏳ Todo |
| 60| UnitController::store()       | ⏳ Todo |
| 61| Unit update + deactivate      | ⏳ Todo |
| 62| Parent type compatibility     | ⏳ Todo |
| 63| Unit Feature Tests            | ⏳ Todo |

### Phase 8 — Public Directory
| # | Task                          | Status |
|---|-------------------------------|--------|
| 64| DirectoryController::central()| ⏳ Todo |
| 65| DirectoryController::byUnit() | ⏳ Todo |
| 66| DirectoryController::index()  | ⏳ Todo |
| 67| Directory sorting by rank     | ⏳ Todo |
| 68| MemberListResource            | ⏳ Todo |
| 69| Directory Feature Tests       | ⏳ Todo |

### Frontend Progress
| Area              | Status    | Notes                                  |
|-------------------|-----------|----------------------------------------|
| Vite + React setup| ✅ Done   | Build passes ✅                        |
| Tailwind config   | ✅ Done   | Brand colors configured                |
| React Router      | ✅ Done   | 8 public routes active                 |
| Layout (Nav+Footer)| ✅ Done  | Responsive, mobile menu               |
| Home Page         | ✅ Done   | Hero section + full content            |
| About Page        | ✅ Done   | Full content                           |
| News Page         | ✅ Done   | Full content                           |
| Activities Page   | ✅ Done   | Full content                           |
| Leadership Page   | ✅ Done   | Full content                           |
| Gallery Page      | ✅ Done   | Full content                           |
| Contact Page      | ✅ Done   | Full content                           |
| Join Us Page      | ✅ Done   | Full content                           |
| Login Page        | ✅ Done   | Form connected to API                  |
| Register Page     | ⏳ Todo   | Multi-step form needed                 |
| Member Dashboard  | ⏳ Todo   | Auth context + protected routes needed |
| Admin Dashboard   | ⏳ Todo   | Full admin UI needed                   |
| AuthContext       | ⏳ Todo   | JWT storage + auto-attach              |
| API Services      | ⏳ Todo   | authService, memberService, adminService|

---

## Summary of Next Implementation Steps

### Immediate Next (Backend)
1. **Task 20** — `MemberResource.php` (private, all fields)
2. **Task 21** — `ProfileController::me()` → `GET /api/members/me`
3. **Task 22** — `ProfileController::update()` + `UpdateProfileRequest`
4. **Task 23** — `PhotoService` (upload/validate/delete)
5. **Task 24** — `POST /api/members/me/photo` endpoint
6. **Task 26** — Member search endpoint

### Immediate Next (Frontend)
1. **AuthContext.jsx** — JWT token management, user state, login/logout actions
2. **ProtectedRoute.jsx** — Guard for member and admin routes
3. **Register.jsx** — Multi-step registration form → `POST /api/auth/register`
4. **MemberDashboard.jsx** — Member home (profile card + positions)
5. **AdminDashboard.jsx** — Admin home (KPI cards + activity feed)
6. **PendingApprovals.jsx** — Approval queue table
