# NDM Student Movement — Frontend Blueprint 🌐

This document provides a technical overview of the NDM Student Movement frontend application (`viva-react`). It is designed to act as a "source of truth" for both human developers and AI coding agents.

## 🚀 Tech Stack

- **Core**: React 18+ (Vite)
- **Styling**: Tailwind CSS v3 (Custom Design System)
- **Animations**: Framer Motion
- **Navigation**: React Router v6
- **API Client**: Axios (Centralized in `src/services/api.js`)
- **State**: React Hooks (useState/useEffect) + localStorage for JWT.

---

## 🎨 Design System (Tailwind Configuration)

### Colors
- **Primary**: `#006A4E` (NDM Green) - Used for brand identity and primary buttons.
- **Accent**: `#DC143C` (Crimson Red) - Used for alerts and critical actions.
- **Gold**: `#F0C040` (Golden Yellow) - Used for decorative elements and highlights.
- **Dark Mode**: Configured using standard Tailwind `dark:` prefix.

### Typography
- **Display**: `Playfair Display` (Serif) - Used for headings and formal text.
- **Body**: `DM Sans` (Sans-serif) - Used for UI elements and general content.

---

## 📂 Project Structure

- `src/components/ui`: Universal, logic-less UI components (e.g., `Button.jsx`).
- `src/components/layout`: Structural components (e.g., `Navbar.jsx`, `Footer.jsx`, `Layout.jsx`).
- `src/pages`: Top-level page components (e.g., `Home.jsx`, `Login.jsx`).
- `src/services`: API interaction layer (e.g., `api.js`).
- `src/styles`: Global CSS and Tailwind entry point (`globals.css`).

---

## 🔒 Authentication Flow

1. **Login**: `authService.login(credentials)` hits `POST /api/auth/login`.
2. **Token Storage**: JWT is stored in `localStorage.setItem('token', ...)`.
3. **API Interceptor**: `src/services/api.js` automatically attaches the `Authorization: Bearer <token>` header to every outgoing request if a token is present.
4. **Current User**: `authService.me()` fetches the authenticated user profile.

---

## 🗺️ Route Map

- `/`: Home Page (Hero, Features, Stats).
- `/login`: Admin/Member login test page.
- `/register`: (Planned) Public registration form.

---

## 🤖 AI Onboarding Guide

When working on this codebase:
1. **Always use CSS Variables or Tailwind classes**: Ad-hoc inline styles are discouraged.
2. **Glassmorphism**: When designing new sections, aim for a premium "glass" look using translucent backgrounds and subtle blurs.
3. **Animations**: Use `framer-motion` for transitions. Wrap main sections in `motion.div` for entry fades.
4. **API Handling**: Always use the `authService` in `src/services/api.js` rather than raw Axios calls to ensure consistent token handling.
