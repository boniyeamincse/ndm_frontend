import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiChevronDown, 
  FiChevronRight, 
  FiLayers, 
  FiShield,
  FiCalendar,
  FiActivity,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const MenuItem = ({ item, active, isOpen, onToggle }) => {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isExpanded = isOpen === item.id;

  return (
    <div className="mb-1">
      <Link
        to={hasSubmenu ? '#' : item.path}
        onClick={(e) => {
          if (hasSubmenu) {
            e.preventDefault();
            onToggle(item.id);
          }
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          active ? 'bg-gold text-primary-dark font-semibold shadow-gold/20 shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        <span className={`text-lg ${active ? 'text-primary-dark' : 'text-gold'}`}>
          {item.icon}
        </span>
        <span className="flex-1 text-sm">{item.label}</span>
        {hasSubmenu && (
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-white/40 group-hover:text-white"
          >
            <FiChevronDown size={14} />
          </motion.span>
        )}
      </Link>

      <AnimatePresence>
        {hasSubmenu && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden ml-9 mt-1 space-y-1"
          >
            {item.submenu.map((sub) => (
              <Link
                key={sub.path}
                to={sub.path}
                className="block py-2 px-3 text-xs text-white/50 hover:text-gold transition-colors"
              >
                • {sub.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const menuItems = [
    { id: 'dash', label: 'Dashboard', icon: <FiHome />, path: '/dashboard/admin' },
    { 
      id: 'members', 
      label: 'Members', 
      icon: <FiUsers />, 
      submenu: [
        { label: 'All Members', path: '/dashboard/admin/members' },
        { label: 'Pending Approvals', path: '/dashboard/admin/members/pending' },
        { label: 'Search/Filter', path: '/dashboard/admin/members/search' }
      ]
    },
    { 
      id: 'org', 
      label: 'Organization', 
      icon: <FiLayers />, 
      submenu: [
        { label: 'Political Committees', path: '/dashboard/admin/committees' },
        { label: 'Campus Units', path: '/dashboard/admin/units' },
        { label: 'Position Management', path: '/dashboard/admin/positions' },
        { label: 'Position History', path: '/dashboard/admin/positions/history' }
      ]
    },
    { id: 'tasks', label: 'Tasks & Projects', icon: <FiCalendar />, path: '/dashboard/admin/tasks' },
    { 
      id: 'system', 
      label: 'System', 
      icon: <FiShield />, 
      submenu: [
        { label: 'Role Definitions', path: '/dashboard/admin/roles' },
        { label: 'Audit Logs', path: '/dashboard/admin/activity' },
        { label: 'Security Settings', path: '/dashboard/admin/settings' }
      ]
    }
  ];

  const handleToggle = (id) => {
    setOpenSubmenu(openSubmenu === id ? null : id);
  };

  return (
    <div className="w-64 bg-primary-dark min-h-screen flex flex-col border-r border-white/5 shadow-2xl z-50">
      {/* Brand */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
            <span className="text-primary-dark font-black text-xl">N</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">NDM Wing</h1>
            <p className="text-gold text-[10px] font-medium tracking-[0.2em] uppercase mt-1">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            active={location.pathname === item.path}
            isOpen={openSubmenu}
            onToggle={handleToggle}
          />
        ))}
      </nav>

      {/* Footer / User */}
      <div className="p-4 bg-black/20 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 mb-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold text-xs">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">Super Admin</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all text-sm font-medium"
        >
          <FiLogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
