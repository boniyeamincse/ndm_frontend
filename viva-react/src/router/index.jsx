import React, { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';

// ── Public pages ─────────────────────────────────────────────────────────────
const Home          = lazy(() => import('../pages/Home'));
const About         = lazy(() => import('../pages/About'));
const Constitution  = lazy(() => import('../pages/Constitution'));
const News          = lazy(() => import('../pages/News'));
const Gallery       = lazy(() => import('../pages/Gallery'));
const Leadership    = lazy(() => import('../pages/Leadership'));
const Activities    = lazy(() => import('../pages/Activities'));
const Campuses      = lazy(() => import('../pages/Campuses'));
const Contact       = lazy(() => import('../pages/Contact'));
const Volunteer     = lazy(() => import('../pages/Volunteer'));
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
const AdminSettings      = lazy(() => import('../pages/dashboard/admin/AdminSettings'));
const MemberReports      = lazy(() => import('../pages/dashboard/admin/MemberReports'));
const CommitteeManagement= lazy(() => import('../pages/dashboard/admin/CommitteeManagement'));
const MemberSearch       = lazy(() => import('../pages/dashboard/admin/MemberSearch'));
const BlogManagement     = lazy(() => import('../pages/dashboard/admin/BlogManagement'));
const CommitteeDetail    = lazy(() => import('../pages/dashboard/admin/CommitteeDetail'));
const SystemMonitoring   = lazy(() => import('../pages/dashboard/admin/SystemMonitoring'));
const CommunicationCenter= lazy(() => import('../pages/dashboard/admin/CommunicationCenter'));
const BulkOperations     = lazy(() => import('../pages/dashboard/admin/BulkOperations'));
const FileManagement     = lazy(() => import('../pages/dashboard/admin/FileManagement'));
const ElectionOperationsDashboard = lazy(() => import('../pages/dashboard/admin/ElectionOperationsDashboard'));
const EventCampaignOperationsDashboard = lazy(() => import('../pages/dashboard/admin/EventCampaignOperationsDashboard'));
const TrainingCadreOperationsDashboard = lazy(() => import('../pages/dashboard/admin/TrainingCadreOperationsDashboard'));
const IntegrationHubOperationsDashboard = lazy(() => import('../pages/dashboard/admin/IntegrationHubOperationsDashboard'));
const FundraisingDashboard = lazy(() => import('../pages/dashboard/admin/Fundraising/FundraisingDashboard'));
const DonationCampaigns   = lazy(() => import('../pages/dashboard/admin/Fundraising/DonationCampaigns'));
const DonationRegistry    = lazy(() => import('../pages/dashboard/admin/Fundraising/DonationRegistry'));
const FundraisingReports   = lazy(() => import('../pages/dashboard/admin/Fundraising/FundraisingReports'));

// ── Organizer pages ──────────────────────────────────────────────────────────
const OrganizerDashboard = lazy(() => import('../pages/dashboard/organizer/OrganizerDashboard'));

// ── Member pages ──────────────────────────────────────────────────────────────
const MemberDashboard   = lazy(() => import('../pages/dashboard/member/MemberDashboard'));
const MemberProfilePage = lazy(() => import('../pages/dashboard/member/MemberProfilePage'));
const MemberPositions   = lazy(() => import('../pages/dashboard/member/MemberPositions'));
const MemberSettings    = lazy(() => import('../pages/dashboard/member/MemberSettings'));

// ── Route guards ──────────────────────────────────────────────────────────────
const resolveRole = (user) => {
  if (!user) return 'guest';
  if (user.user_type === 'admin') return 'admin';
  if (user?.member?.member_role?.role === 'organizer') return 'organizer';
  return 'member';
};

const RequireAuth = ({ role }) => {
  const { user, loading } = useAuth();
  const resolvedRole = resolveRole(user);

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (role === 'admin' && resolvedRole !== 'admin') return <Navigate to={resolvedRole === 'organizer' ? '/dashboard/organizer' : '/dashboard/member'} replace />;
  if (role === 'organizer' && !['organizer', 'admin'].includes(resolvedRole)) return <Navigate to="/dashboard/member" replace />;
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
      { path: 'constitution',       element: <Constitution /> },
      { path: 'news',               element: <News /> },
      { path: 'gallery',            element: <Gallery /> },
      { path: 'join',               element: <Navigate to="/register" replace /> },
      { path: 'leadership',         element: <Leadership /> },
      { path: 'activities',         element: <Activities /> },
      { path: 'campuses',           element: <Campuses /> },
      { path: 'contact',            element: <Contact /> },
      { path: 'volunteer',          element: <Volunteer /> },
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
      {
        element: <DashboardLayout />,
        children: [
          { index: true,       element: <MemberDashboard /> },
          { path: 'profile',   element: <MemberProfilePage /> },
          { path: 'positions', element: <MemberPositions /> },
          { path: 'settings',  element: <MemberSettings /> },
        ]
      }
    ],
  },
  // ── Admin dashboard ──────────────────────────────────────────────
  {
    path: '/dashboard/admin',
    element: <RequireAuth role="admin" />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true,                element: <AdminDashboard /> },
          { path: 'members',            element: <AllMembers /> },
          { path: 'members/pending',    element: <PendingApprovals /> },
          { path: 'members/search',     element: <MemberSearch /> },
          { path: 'members/reports',    element: <MemberReports /> },
          { path: 'members/:id',        element: <MemberDetail /> },
          { path: 'roles',              element: <RoleManagement /> },
          { path: 'units',              element: <UnitManagement /> },
          { path: 'committees',         element: <CommitteeManagement /> },
          { path: 'blog',               element: <BlogManagement /> },
          { path: 'profile',            element: <MemberProfilePage /> },
          { path: 'settings/committees/:id', element: <CommitteeDetail /> },
          { path: 'positions',          element: <PositionManagement /> },
          { path: 'positions/history',  element: <PositionHistory /> },
          { path: 'settings',           element: <AdminSettings /> },
          { path: 'system-monitoring',  element: <SystemMonitoring /> },
          { path: 'communications',     element: <CommunicationCenter /> },
          { path: 'bulk-operations',    element: <BulkOperations /> },
          { path: 'files',              element: <FileManagement /> },
           { path: 'elections',          element: <ElectionOperationsDashboard /> },
          { path: 'events-campaigns',   element: <EventCampaignOperationsDashboard /> },
          { path: 'training-cadre',     element: <TrainingCadreOperationsDashboard /> },
          { path: 'integration-hub',    element: <IntegrationHubOperationsDashboard /> },
          { path: 'fundraising',        element: <FundraisingDashboard /> },
          { path: 'fundraising/campaigns', element: <DonationCampaigns /> },
          { path: 'fundraising/donations', element: <DonationRegistry /> },
          { path: 'fundraising/reports',   element: <FundraisingReports /> },
        ]
      }
    ],
  },
  // ── Organizer dashboard ──────────────────────────────────────────
  {
    path: '/dashboard/organizer',
    element: <RequireAuth role="organizer" />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true,       element: <OrganizerDashboard /> },
          { path: 'profile',   element: <MemberProfilePage /> },
          { path: 'positions', element: <MemberPositions /> },
          { path: 'settings',  element: <MemberSettings /> },
        ]
      }
    ],
  },
  { path: '*', element: <NotFound /> },
]);
