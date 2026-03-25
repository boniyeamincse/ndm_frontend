import React, { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

// ── Public pages ─────────────────────────────────────────────────────────────
const Home          = lazy(() => import('../pages/Home'));
const About         = lazy(() => import('../pages/About'));
const News          = lazy(() => import('../pages/News'));
const Gallery       = lazy(() => import('../pages/Gallery'));
const Leadership    = lazy(() => import('../pages/Leadership'));
const Activities    = lazy(() => import('../pages/Activities'));
const Contact       = lazy(() => import('../pages/Contact'));
const Register      = lazy(() => import('../pages/Register'));
const Login         = lazy(() => import('../pages/auth/Login'));
const NotFound      = lazy(() => import('../pages/NotFound'));
const MemberProfile = lazy(() => import('../pages/MemberProfile'));
const Directory     = lazy(() => import('../pages/Directory'));

// ── Admin pages ───────────────────────────────────────────────────────────────
const AdminDashboard     = lazy(() => import('../pages/dashboard/admin/AdminDashboard'));
const PendingApprovals   = lazy(() => import('../pages/dashboard/admin/PendingApprovals'));
const AllMembers         = lazy(() => import('../pages/dashboard/admin/AllMembers'));
const MemberDetail       = lazy(() => import('../pages/dashboard/admin/MemberDetail'));
const RoleManagement     = lazy(() => import('../pages/dashboard/admin/RoleManagement'));
const UnitManagement     = lazy(() => import('../pages/dashboard/admin/UnitManagement'));
const PositionManagement = lazy(() => import('../pages/dashboard/admin/PositionManagement'));
const PositionHistory    = lazy(() => import('../pages/dashboard/admin/PositionHistory'));

// ── Member pages ──────────────────────────────────────────────────────────────
const MemberDashboard   = lazy(() => import('../pages/dashboard/member/MemberDashboard'));
const MemberProfilePage = lazy(() => import('../pages/dashboard/member/MemberProfilePage'));
const MemberPositions   = lazy(() => import('../pages/dashboard/member/MemberPositions'));
const MemberSettings    = lazy(() => import('../pages/dashboard/member/MemberSettings'));

// ── Route guards ──────────────────────────────────────────────────────────────
const RequireAuth = ({ role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (role === 'admin' && user.user_type !== 'admin') return <Navigate to="/dashboard/member" replace />;
  return <Outlet />;
};

export const router = createBrowserRouter([
  // ── Public layout ────────────────────────────────────────────────
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,                element: <Home /> },
      { path: 'about',              element: <About /> },
      { path: 'news',               element: <News /> },
      { path: 'gallery',            element: <Gallery /> },
      { path: 'join',               element: <Navigate to="/register" replace /> },
      { path: 'leadership',         element: <Leadership /> },
      { path: 'activities',         element: <Activities /> },
      { path: 'contact',            element: <Contact /> },
      { path: 'register',           element: <Register /> },
      { path: 'login',              element: <Login /> },
      { path: 'directory',          element: <Directory /> },
      { path: 'members/:memberId',  element: <MemberProfile /> },
    ],
  },
  // ── Member dashboard ─────────────────────────────────────────────
  {
    path: '/dashboard/member',
    element: <RequireAuth />,
    children: [
      { index: true,       element: <MemberDashboard /> },
      { path: 'profile',   element: <MemberProfilePage /> },
      { path: 'positions', element: <MemberPositions /> },
      { path: 'settings',  element: <MemberSettings /> },
    ],
  },
  // ── Admin dashboard ──────────────────────────────────────────────
  {
    path: '/dashboard/admin',
    element: <RequireAuth role="admin" />,
    children: [
      { index: true,                element: <AdminDashboard /> },
      { path: 'members',            element: <AllMembers /> },
      { path: 'members/pending',    element: <PendingApprovals /> },
      { path: 'members/:id',        element: <MemberDetail /> },
      { path: 'roles',              element: <RoleManagement /> },
      { path: 'units',              element: <UnitManagement /> },
      { path: 'positions',          element: <PositionManagement /> },
      { path: 'positions/history',  element: <PositionHistory /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
