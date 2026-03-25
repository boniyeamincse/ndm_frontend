import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navByMode = {
  admin: [
    { to: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
    {
      id: 'members',
      label: 'Members',
      icon: '👥',
      matchPrefix: '/dashboard/admin/members',
      children: [
        { to: '/dashboard/admin/members',                    label: 'All Members' },
        { to: '/dashboard/admin/members/pending',            label: 'Pending Approvals' },
        { to: '/dashboard/admin/members?status=active',      label: 'Active Members' },
        { to: '/dashboard/admin/members?status=suspended',   label: 'Suspended Members' },
        { to: '/dashboard/admin/members?status=expelled',    label: 'Expelled Members' },
        { to: '/dashboard/admin/members/reports',            label: '📥 Reports (PDF / Excel)' },
      ],
    },
    { to: '/dashboard/admin/roles',     label: 'Roles',      icon: '🔐' },
    {
      id: 'units',
      label: 'Organizational Units',
      icon: '🏛',
      matchPrefix: '/dashboard/admin/units',
      children: [
        { to: '/dashboard/admin/units?type=central',   label: 'Central Committee' },
        { to: '/dashboard/admin/units?type=division',  label: 'Division Committees' },
        { to: '/dashboard/admin/units?type=district',  label: 'District Committees' },
        { to: '/dashboard/admin/units?type=upazila',   label: 'Upazila Committees' },
        { to: '/dashboard/admin/units?type=union',     label: 'Union Committees' },
        { to: '/dashboard/admin/units?type=ward',      label: 'Ward Committees' },
        { to: '/dashboard/admin/units?type=campus',    label: 'Campus / Institutions' },
      ],
    },
    { to: '/dashboard/admin/positions', label: 'Positions',  icon: '📌' },
    { to: '/dashboard/admin/settings',  label: 'Settings',   icon: '⚙️' },
  ],
  member: [
    { to: '/dashboard/member',           label: 'Dashboard', icon: '🏠' },
    { to: '/dashboard/member/profile',   label: 'Profile',   icon: '🪪' },
    { to: '/dashboard/member/positions', label: 'Positions', icon: '🎖' },
    { to: '/dashboard/member/settings',  label: 'Settings',  icon: '⚙️' },
  ],
};

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin = location.pathname.startsWith('/dashboard/admin');
  const mode = isAdmin ? 'admin' : 'member';
  const navItems = navByMode[mode];

  // Auto-open submenu if current path matches its prefix
  const defaultOpen = navItems
    .filter(item => item.matchPrefix && location.pathname.startsWith(item.matchPrefix))
    .map(item => item.id);
  const [openMenus, setOpenMenus] = useState(new Set(defaultOpen));

  const toggleMenu = (id) => {
    setOpenMenus(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const pageTitle = location.pathname
    .split('/')
    .filter(Boolean)
    .slice(-1)[0]
    ?.replace(/-/g, ' ')
    ?.replace(/\b\w/g, (char) => char.toUpperCase()) || 'Dashboard';

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const currentFull = location.pathname + location.search;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex lg:w-64 bg-slate-900 text-slate-200 flex-col">
          <div className="px-5 py-5 border-b border-slate-800">
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">NDM Student Wing</p>
            <h1 className="text-lg font-semibold text-white mt-1">
              {isAdmin ? 'Admin Dashboard' : 'Member Dashboard'}
            </h1>
          </div>

          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              if (item.children) {
                const isGroupActive = location.pathname.startsWith(item.matchPrefix);
                const isOpen = openMenus.has(item.id);
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isGroupActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      <span className="text-slate-500 text-xs">{isOpen ? '▾' : '▸'}</span>
                    </button>

                    {isOpen && (
                      <div className="mt-1 ml-4 border-l border-slate-700 pl-2 space-y-0.5">
                        {item.children.map((child) => {
                          const childActive = currentFull === child.to
                            || (child.to === '/dashboard/admin/members' && location.pathname === '/dashboard/admin/members' && !location.search);
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                childActive
                                  ? 'bg-slate-700 text-amber-400 font-medium'
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <span className="text-slate-600">─</span>
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-slate-800 text-white border-l-2 border-amber-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={signOut}
              className="w-full py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">{isAdmin ? 'Admin' : 'Member'}</span>
              <span className="text-slate-300">/</span>
              <h2 className="text-sm lg:text-base font-semibold text-slate-800">{pageTitle}</h2>
            </div>
            <div className="text-xs lg:text-sm text-slate-500">
              {user?.email || 'Signed in'}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
