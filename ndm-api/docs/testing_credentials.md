# NDM Student Wing Management System - Testing Guide

This document contains the standard credentials and data for testing the NDM Student Wing System.

## 🔐 Administrative Access
Use these credentials to access the Admin Dashboard at `http://localhost:5174/login`.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@ndm.org.bd` | `password` |

---

## 📝 Sample Registration Data (Step-by-Step)
Use this data to test the multi-step registration form at `http://localhost:5174/register`.

### Step 1: Account
- **Email**: `test_student@example.com`
- **Password**: `Student@123`

### Step 2: Personal
- **Full Name**: `Boni Yeamin`
- **Mobile**: `01711112222`
- **NID/BC**: `1234567890`
- **Blood Group**: `O+`

### Step 3: Academic
- **Campus**: Select any or choose `Other (Type below)`
- **Institution**: (if other) `Government Titumir College`
- **Department**: `Political Science`
- **Session**: `2022-23`

### Step 4: Documents
- **Profile Photo**: Any valid JPG/PNG (max 2MB)
- **NID Scan**: Any valid PDF/JPG (max 5MB)

---

## 🌐 Environment URLs
| Component | Local URL |
| :--- | :--- |
| **Frontend (React)** | `http://localhost:5174` |
| **Backend API (Laravel)** | `http://localhost:8000` |
| **API Docs (L5-Swagger)** | `http://localhost:8000/api/documentation` |

---
> [!IMPORTANT]
> To reset the database to this state, run:
> `php artisan migrate:fresh --seed` from the `ndm-api` directory.
