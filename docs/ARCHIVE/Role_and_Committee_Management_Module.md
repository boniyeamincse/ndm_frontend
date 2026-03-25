# NDM Student Wing: Role & Committee Management Module

This document outlines the architecture and requirements for the **Role and Committee Management Module**, specifically designed for a political student wing in Bangladesh.

## 1. Organizational Hierarchy (Committees)
The student wing operates on a strict hierarchical model, descending from the central national level down to the grassroots local level.

1. **Central Committee** (কেন্দ্রীয় বা ন্যাশনাল)
2. **Divisional Committee** (বিভাগীয়)
3. **District Committee** (জেলা / মহানগর)
4. **Upazila / Thana Committee** (উপজেলা / থানা)
5. **Union / Ward / Institutional Committee** (ইউনিয়ন / ওয়ার্ড / শিক্ষাপ্রতিষ্ঠান)

Each of these committees consists of members holding specific designations (roles). 

## 2. Committee Roles & Designations
Within any given committee, members can be assigned one of the following official roles. Note that some roles (like Vice President or Joint General Secretary) can have multiple members, while others (like President) are singular per committee.

### Executive & Administrative Leadership
1. **President** (সভাপতি)
2. **Vice President** (সহ-সভাপতি)
3. **General Secretary** (সাধারণ সম্পাদক)
4. **Joint General Secretary** (যুগ্ম সাধারণ সম্পাদক)
5. **Organizing Secretary** (সাংগঠনিক সম্পাদক)
6. **Office Secretary** (দপ্তর সম্পাদক)
7. **Finance Secretary / Treasurer** (অর্থ সম্পাদক / কোষাধ্যক্ষ)

### Specialized Secretariats
8. **Publicity Secretary** (প্রচার সম্পাদক)
9. **Information & Research Secretary** (তথ্য ও গবেষণা সম্পাদক)
10. **Education Affairs Secretary** (শিক্ষা বিষয়ক সম্পাদক)
11. **Cultural Secretary** (সাংস্কৃতিক সম্পাদক)
12. **Social Welfare Secretary** (সমাজকল্যাণ সম্পাদক)
13. **Sports Secretary** (ক্রীড়া সম্পাদক)
14. **Legal Affairs Secretary** (আইন বিষয়ক সম্পাদক)
15. **International Affairs Secretary** (আন্তর্জাতিক বিষয়ক সম্পাদক)

### General Members
16. **Executive Member** (নির্বাহী সদস্য)
17. **General Member** (সাধারণ সদস্য) - Default role upon joining.

---

## 3. System Architecture & Database Design

### 3.1 `committees` Table
Represents an actual instantiated committee for a given term (e.g., "Dhaka District North Committee 2026").
- `id`
- `name` (e.g., "Dhaka District Central Committee")
- `level` (Enum: `central`, `division`, `district`, `upazila`, `union`)
- `parent_id` (Self-referential, links Upazila to District, etc.)
- `status` (Enum: `active`, `expired`, `dissolved`)
- `established_date`
- `expiry_date`

### 3.2 `committee_roles` Table (Pivot/Assignment)
Assigns a member to a specific designation within a specific committee.
- `id`
- `committee_id` (Foreign Key to committees)
- `member_id` (Foreign Key to members)
- `designation` (String/Enum matching the 17 roles above)
- `assigned_date`
- `status` (Enum: `active`, `resigned`, `removed`)

### 3.3 System Access Roles (RBAC via Spatie Permission)
While committee designations determine political rank, **system roles** determine what actions a user can perform in the software:
- **Super Admin**: Full access to the entire system.
- **Central Moderator**: Can approve/reject members nationally and create district committees.
- **Division/District Moderator**: Can manage members within their specific division/district.
- **Member**: Can log in, update own profile, view ID card, and see public directory.

## 4. API Endpoints Required

### Committee Management
- `GET  /api/committees` - List committees (filterable by level)
- `POST /api/committees` - Create a new committee
- `GET  /api/committees/{id}` - Get committee details and structure
- `PUT  /api/committees/{id}` - Update committee status/details

### Role Assignment
- `POST /api/committees/{id}/members` - Assign a member to a role (e.g., make user President)
- `DELETE /api/committees/{id}/members/{member_id}` - Remove from role
- `PUT /api/committees/{id}/members/{member_id}/promote` - Change designation

## 5. Frontend Requirements
- **Directory/Organizational Chart View**: Visual tree or paginated list showing the hierarchy of leaders.
- **Committee Builder UI**: Drag-and-drop or select interface for an Admin to construct a committee by assigning members to positions.
- **Role Badges**: Display a user's current highest active designation in the TopNav and Profile pages.
