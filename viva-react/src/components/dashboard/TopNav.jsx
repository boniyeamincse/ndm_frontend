import React from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiSearch, FiHelpCircle, FiGlobe, FiMenu } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const TopNav = () => {
  const location = useLocation();
  
  // Simple breadcrumb logic
  const pathnames = location.pathname.split('/').filter(x => x);
  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Dashboard';

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-bottom border-gray-200 dark:border-white/5 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
      {/* Search Bar (Glassmorphic) */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search for members, tasks or units..." 
            className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-all relative">
          <FiBell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        
        <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-all">
          <FiGlobe size={20} />
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Admin View</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">Live Mode</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
