# NDM Student Movement Monorepo

This repository contains the NDM Student Movement platform:
- `viva-react` → Frontend web app (React + Vite + Tailwind)
- `ndm-api` → Backend API (Laravel + JWT auth package)
- `docs` → Product, API, and implementation blueprints

## Project Structure

```text
ndm/
├── docs/
│   ├── NDM-100-AI-Prompts-Blueprint.md
│   └── api/
│       ├── NDM_100_Development_Tasks.md
│       └── NDM_Laravel_API_Blueprint.md
├── ndm-api/      # Laravel backend API
└── viva-react/   # React frontend
```

## Current Status

### Frontend (`viva-react`)
- Core architecture is in place (routing, context state, reusable design foundations).
- Built with React 19, Vite 8, Tailwind CSS 3, and Framer Motion.

### Backend (`ndm-api`)
- Laravel project is set up with JWT package installed (`tymon/jwt-auth`).
- Domain models/migrations exist for the membership system.
- API implementation is guided by the blueprint docs in `docs/api`.

## Requirements

- Node.js 20+
- npm 10+
- PHP 8.3+
- Composer 2+
- SQLite (default) or MySQL/PostgreSQL

## Quick Start

### 1) Run Frontend

```bash
cd viva-react
npm install
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

### 2) Run Backend API

```bash
cd ndm-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
php artisan serve
```

API usually runs on `http://127.0.0.1:8000`.

## Useful Commands

### Frontend
```bash
cd viva-react
npm run dev
npm run build
npm run preview
```

### Backend
```bash
cd ndm-api
php artisan serve
php artisan migrate
php artisan test
composer run dev
```

## Documentation Index

- Product/UI prompt blueprint: `docs/NDM-100-AI-Prompts-Blueprint.md`
- Backend implementation tasks: `docs/api/NDM_100_Development_Tasks.md`
- Backend architecture/API blueprint: `docs/api/NDM_Laravel_API_Blueprint.md`

## Notes

- The backend API blueprint is comprehensive and may describe endpoints/features beyond the currently wired routes. Use it as the implementation target.
- The `ndm-api/README.md` is still the default Laravel template; this root README is the project-level entry point.
