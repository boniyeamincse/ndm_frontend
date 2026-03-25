import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { NDM_LOGO_URL } from '../../constants/branding';

/* ─── Inline SVG icons (no external packages required) ──────────────────── */
const P = {
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  members:   'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  structure: 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z',
  roles:     'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z',
  community: 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6z',
  blog:      'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
  reports:   'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2 2H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
  settings:  'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  bell:      'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
  plus:      'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  logout:    'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
  user:      'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  menu:      'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  chevron:   'M7 10l5 5 5-5z',
  external:  'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
  profile:   'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  lock:      'M12 17a2 2 0 100-4 2 2 0 000 4zm6-6h-1V9a5 5 0 00-10 0v2H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-2a3 3 0 016 0v2h-6V9z',
  key:       'M7 14a5 5 0 110-10 5 5 0 010 10zm13-2h-4l-1 1v2h-2v2h-2v-3.17L13.17 12H20z',
  api:       'M3 5h18v2H3V5zm0 6h12v2H3v-2zm0 6h18v2H3v-2zm14-7h4v2h-4v-2z',
  alert:     'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
};

const Ic = ({ n, s = 18 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" style={{ flexShrink: 0 }} aria-hidden="true">
    {P[n] && <path d={P[n]} />}
  </svg>
);

/* ─── Navigation data ────────────────────────────────────────────────────── */
const ADMIN_SECTIONS = [
  {
    label: null,
    items: [
      { to: '/dashboard/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
    ],
  },
  {
    label: 'People',
    items: [
      {
        id: 'members', label: 'Members', icon: 'members',
        matchPrefix: '/dashboard/admin/members',
        children: [
          { to: '/dashboard/admin/members',                    label: 'All Members' },
          { to: '/dashboard/admin/members/pending',            label: 'Pending Approvals' },
          { to: '/dashboard/admin/members?status=active',      label: 'Active Members' },
          { to: '/dashboard/admin/members?status=suspended',   label: 'Suspended' },
          { to: '/dashboard/admin/members?status=expelled',    label: 'Expelled' },
          { to: '/dashboard/admin/members/search',             label: 'Search Members' },
        ],
      },
    ],
  },
  {
    label: 'Organisation',
    items: [
      {
        id: 'structure', label: 'Structure', icon: 'structure',
        matchPrefix: '/dashboard/admin/units',
        children: [
          { to: '/dashboard/admin/units?type=central',  label: 'Central Committee' },
          { to: '/dashboard/admin/units?type=division', label: 'Divisions' },
          { to: '/dashboard/admin/units?type=district', label: 'Districts' },
          { to: '/dashboard/admin/units?type=upazila',  label: 'Upazilas' },
          { to: '/dashboard/admin/units?type=union',    label: 'Unions' },
          { to: '/dashboard/admin/units?type=ward',     label: 'Wards' },
          { to: '/dashboard/admin/units?type=campus',   label: 'Campuses' },
        ],
      },
      {
        id: 'roles-pos', label: 'Roles & Positions', icon: 'roles',
        matchPrefixes: ['/dashboard/admin/roles', '/dashboard/admin/positions'],
        children: [
          { to: '/dashboard/admin/roles',             label: 'Roles' },
          { to: '/dashboard/admin/positions',         label: 'Active Positions' },
          { to: '/dashboard/admin/positions/history', label: 'Position History' },
        ],
      },
    ],
  },
  {
    label: 'Community',
    items: [
      {
        id: 'community', label: 'Community', icon: 'community',
        matchPrefix: '/dashboard/admin/committees',
        children: [
          { to: '/dashboard/admin/committees', label: 'Committees' },
        ],
      },
      { to: '/dashboard/admin/blog', label: 'Blog', icon: 'blog' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/dashboard/admin/members/reports', label: 'Reports',  icon: 'reports'  },
      {
        id: 'settings', label: 'Settings', icon: 'settings',
        matchPrefix: '/dashboard/admin/settings',
        children: [
          { heading: 'System Settings' },
          { to: '/dashboard/admin/settings?section=general',        label: 'General Settings' },
          { to: '/dashboard/admin/settings?section=organization',   label: 'Organization Configuration' },
          { heading: 'Access Control' },
          { to: '/dashboard/admin/members',                         label: 'Users' },
          { to: '/dashboard/admin/roles',                           label: 'Roles & Permissions' },
          { heading: 'Advanced' },
          { to: '/dashboard/admin/settings?section=audit-logs',     label: 'Audit Logs' },
          { to: '/dashboard/admin/settings?section=api-settings',   label: 'API Settings' },
        ],
      },
    ],
  },
];

const MEMBER_SECTIONS = [
  {
    label: null,
    items: [
      { to: '/dashboard/member',           label: 'Dashboard', icon: 'dashboard', exact: true },
      { to: '/dashboard/member/profile',   label: 'Profile',   icon: 'user'      },
      { to: '/dashboard/member/positions', label: 'Positions', icon: 'roles'     },
      { to: '/dashboard/member/settings',  label: 'Settings',  icon: 'settings'  },
    ],
  },
];

const QUICK_ACTIONS = [
  { label: 'Pending Approvals', to: '/dashboard/admin/members/pending', icon: 'members'   },
  { label: 'Assign Position',   to: '/dashboard/admin/positions',       icon: 'roles'     },
  { label: 'Create Unit',       to: '/dashboard/admin/units',           icon: 'structure' },
  { label: 'New Blog Post',     to: '/dashboard/admin/blog',            icon: 'blog'      },
];

const PAGE_TITLES = {
  '/dashboard/admin':                   'Dashboard',
  '/dashboard/admin/members':           'All Members',
  '/dashboard/admin/members/pending':   'Pending Approvals',
  '/dashboard/admin/members/search':    'Member Search',
  '/dashboard/admin/roles':             'Roles',
  '/dashboard/admin/units':             'Structure',
  '/dashboard/admin/positions':         'Positions',
  '/dashboard/admin/positions/history': 'Position History',
  '/dashboard/admin/committees':        'Community',
  '/dashboard/admin/blog':              'Blog',
  '/dashboard/admin/profile':           'My Profile',
  '/dashboard/admin/settings':          'Settings',
  '/dashboard/admin/members/reports':   'Reports',
  '/dashboard/member':                  'Dashboard',
  '/dashboard/member/profile':          'My Profile',
  '/dashboard/member/positions':        'My Positions',
  '/dashboard/member/settings':         'Settings',
};

const buildNotifications = (pendingCount) => {
  const all = [
    {
      id: 'pending-approvals',
      title: `${pendingCount} Pending Approval${pendingCount !== 1 ? 's' : ''}`,
      desc: 'Member registrations awaiting review',
      to: '/dashboard/admin/members/pending',
      unread: pendingCount > 0,
      type: 'unread',
      icon: 'members',
    },
    {
      id: 'system-alert',
      title: 'System Alert: Review API Access Tokens',
      desc: 'Periodic token rotation is recommended this week.',
      to: '/dashboard/admin/settings?section=api-settings',
      unread: true,
      type: 'system',
      icon: 'alert',
    },
    {
      id: 'audit-reminder',
      title: 'Reminder: Check Audit Logs',
      desc: 'Verify recent admin actions and security events.',
      to: '/dashboard/admin/settings?section=audit-logs',
      unread: false,
      type: 'system',
      icon: 'reports',
    },
  ];
  return all.filter(item => item.id !== 'pending-approvals' || pendingCount > 0);
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function useOutsideClick(ref, cb) {
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [ref, cb]);
}

/* ─── Topbar: Quick Actions ──────────────────────────────────────────────── */
const QuickActions = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClick(ref, close);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Quick Actions"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        <Ic n="plus" s={16} />
        <span className="hidden sm:inline">New</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 py-1.5 z-50 overflow-hidden"
          >
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400/80">Quick Actions</p>
            {QUICK_ACTIONS.map(a => (
              <Link key={a.to} to={a.to} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-900/5 transition-colors">
                <span className="text-slate-400 group-hover:text-primary"><Ic n={a.icon} s={16} /></span>
                {a.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Topbar: Notifications ──────────────────────────────────────────────── */
const NotificationBell = ({ count }) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClick(ref, close);

  const allNotifications = buildNotifications(count);
  const unreadCount = allNotifications.filter(item => item.unread).length;
  const systemCount = allNotifications.filter(item => item.type === 'system').length;

  const visibleNotifications = allNotifications.filter(item => {
    if (filter === 'unread') return item.unread;
    if (filter === 'system') return item.type === 'system';
    return true;
  });

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        className="relative p-2 rounded-lg text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
      >
        <Ic n="bell" s={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{unreadCount} new</span>
              )}
            </div>
            <div className="px-2.5 py-2 border-b border-slate-100 flex items-center gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${filter === 'unread' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('system')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${filter === 'system' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                System Alerts
              </button>
            </div>
            {visibleNotifications.length > 0 ? (
              <>
                <div className="max-h-72 overflow-y-auto">
                  {visibleNotifications.map((item) => (
                    <Link
                      key={item.id}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50/50 transition-colors border-b border-slate-50/50"
                    >
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.unread ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Ic n={item.icon} s={17} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 leading-tight">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                      {item.unread && <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />}
                    </Link>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-50 text-center">
                  <Link to={filter === 'system' ? '/dashboard/admin/settings?section=audit-logs' : '/dashboard/admin/members/pending'} onClick={() => setOpen(false)} className="text-xs text-primary font-semibold hover:underline">
                    View full history →
                  </Link>
                </div>
              </>
            ) : (
              <div className="px-4 py-10 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-sm font-semibold text-slate-900">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No pending notifications</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Topbar: Profile Menu ───────────────────────────────────────────────── */
const ProfileMenu = ({ user, onSignOut, isAdmin }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClick(ref, close);

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';
  const displayName = user?.name || user?.email || 'User';
  const settingsPath = isAdmin ? '/dashboard/admin/settings?section=account' : '/dashboard/member/settings';
  const profilePath = isAdmin ? '/dashboard/admin/profile' : '/dashboard/member/profile';
  const passwordPath = isAdmin ? '/dashboard/admin/profile?tab=password' : '/dashboard/member/profile?tab=password';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
      >
        <span className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
          {initials}
        </span>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-slate-100 leading-tight max-w-[120px] truncate">{displayName}</p>
          <p className="text-[10px] text-slate-300 capitalize">{user?.user_type ?? 'member'}</p>
        </div>
        <span className="text-slate-300 hidden sm:block"><Ic n="chevron" s={18} /></span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 py-1 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
            </div>
            <Link to={profilePath} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-950/5 transition-colors">
              <span className="text-slate-400 group-hover:text-amber-500"><Ic n="profile" s={16} /></span> My Profile
            </Link>
            <Link to={settingsPath} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-950/5 transition-colors">
              <span className="text-slate-400 group-hover:text-indigo-500"><Ic n="settings" s={16} /></span> Account Settings
            </Link>
            <Link to={passwordPath} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-950/5 transition-colors">
              <span className="text-slate-400 group-hover:text-rose-500"><Ic n="key" s={16} /></span> Change Password
            </Link>
            <div className="border-t border-slate-100 mt-1">
              <button onClick={() => { setOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left">
                <Ic n="logout" s={16} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Sidebar content (shared between desktop + mobile drawer) ───────────── */
const SidebarContent = ({ sections, location, currentFull, openMenus, toggleMenu }) => (
  <nav className="flex-1 px-2.5 py-4 overflow-y-auto">
    {sections.map((section, si) => (
      <div key={si} className={si > 0 ? 'mt-5' : ''}>
        {section.label && (
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500/90">
            {section.label}
          </p>
        )}
        <div className="space-y-0.5">
          {section.items.map(item => {
            /* ── Group with children ── */
            if (item.children) {
              const isGroupActive = item.matchPrefixes
                ? item.matchPrefixes.some(p => location.pathname.startsWith(p))
                : location.pathname.startsWith(item.matchPrefix);
              const isOpen = openMenus.has(item.id);
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      isGroupActive
                        ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                        : 'text-slate-300/90 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className={isGroupActive ? 'text-amber-300' : 'text-slate-500'}>
                      <Ic n={item.icon} s={17} />
                    </span>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    <span className={`text-slate-500 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}>
                      <Ic n="chevron" s={16} />
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`mt-1 mx-1.5 rounded-xl overflow-hidden ${item.id === 'settings' ? 'bg-white/[0.04] border border-white/5 shadow-inner' : 'bg-white/[0.02]'}`}
                      >
                        {item.children.map((child, idx) => {
                          if (child.heading) {
                            return (
                              <div key={`${item.id}-heading-${idx}`} className="px-3 pt-3 pb-1.5 first:pt-2.5">
                                <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500/80">
                                  {child.heading}
                                </p>
                              </div>
                            );
                          }
                          const childActive = currentFull === child.to
                            || (child.to === '/dashboard/admin/members'
                              && location.pathname === '/dashboard/admin/members'
                              && !location.search);
                          return (
                            <Link key={child.to} to={child.to}
                              className={`mx-2 mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-all ${
                                childActive
                                  ? 'text-amber-300 font-semibold bg-white/10 ring-1 ring-white/5'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${childActive ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                              {child.label}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            /* ── Single link ── */
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  active
                    ? 'bg-white/10 text-white border-l-[3px] border-amber-300 pl-[calc(0.75rem-3px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-slate-300/90 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={active ? 'text-amber-300' : 'text-slate-500'}>
                  <Ic n={item.icon} s={17} />
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    ))}
  </nav>
);

/* ─── Main layout ────────────────────────────────────────────────────────── */
const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin  = location.pathname.startsWith('/dashboard/admin');
  const sections = isAdmin ? ADMIN_SECTIONS : MEMBER_SECTIONS;

  const allItems    = sections.flatMap(s => s.items);
  const defaultOpen = allItems
    .filter(item => {
      if (!item.children) return false;
      if (item.matchPrefixes) return item.matchPrefixes.some(p => location.pathname.startsWith(p));
      return item.matchPrefix && location.pathname.startsWith(item.matchPrefix);
    })
    .map(item => item.id);

  const [openMenus,   setOpenMenus]   = useState(new Set(defaultOpen));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount,  setNotifCount]  = useState(0);

  const currentFull = location.pathname + location.search;

  const toggleMenu = useCallback((id) => {
    setOpenMenus(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    api.get('/admin/dashboard/stats')
      .then(res => setNotifCount(res.data?.data?.statistics?.pending_approvals ?? 0))
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const pageTitle = PAGE_TITLES[location.pathname]
    || location.pathname.split('/').filter(Boolean).slice(-1)[0]
      ?.replace(/-/g, ' ')
      ?.replace(/\b\w/g, c => c.toUpperCase())
    || 'Dashboard';

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] flex">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed top-0 left-0 h-full w-72 text-slate-200 flex flex-col z-40 overflow-hidden
          lg:static lg:translate-x-0 lg:z-auto lg:shrink-0
        `}
      >
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" />
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.1),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.1),transparent_40%)]" />
        <div className="absolute inset-y-0 right-0 w-px bg-white/5" />

        {/* Brand */}
        <div className="relative px-4 py-4 border-b border-white/10 flex-shrink-0 bg-white/[0.03] backdrop-blur-sm">
          <Link to="/" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 bg-white/[0.04] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <img src={NDM_LOGO_URL} alt="NDSM logo" className="w-10 h-10 object-cover rounded-2xl border border-white/10 shadow-lg shadow-amber-500/20 flex-shrink-0" loading="lazy" />
            <div>
              <p className="text-white font-bold text-sm leading-tight tracking-[0.01em]">NDSM</p>
              <p className="text-slate-400 text-[10px] uppercase tracking-[0.18em] mt-0.5">
                {isAdmin ? 'Admin Panel' : 'Member Panel'}
              </p>
            </div>
          </Link>
        </div>

        <div className="relative flex-1 min-h-0">
          <SidebarContent
            sections={sections}
            location={location}
            currentFull={currentFull}
            openMenus={openMenus}
            toggleMenu={toggleMenu}
          />
        </div>

        {/* User footer */}
        <div className="relative p-3 border-t border-white/10 flex-shrink-0 bg-white/[0.03] backdrop-blur-sm">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/[0.06] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-300 to-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow shadow-amber-500/20">
              {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || user?.email || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize tracking-[0.12em]">{user?.user_type ?? 'member'}</p>
            </div>
            <button onClick={signOut} title="Sign out" className="text-slate-400 hover:text-red-300 transition-colors flex-shrink-0">
              <Ic n="logout" s={16} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="h-16 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-b border-slate-700/80 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 flex-shrink-0 shadow-[0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Ic n="menu" s={20} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-500 font-light text-lg hidden sm:block">/</span>
              <h2 className="text-sm lg:text-base font-semibold text-slate-100 truncate">{pageTitle}</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isAdmin && <QuickActions />}
            {isAdmin && <NotificationBell count={notifCount} />}
            <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block" />
            <ProfileMenu user={user} onSignOut={signOut} isAdmin={isAdmin} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#f8fafc]/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
