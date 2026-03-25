import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { NDM_LOGO_URL, NDSM_SHORT_NAME } from '../../constants/branding';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    {
      name: 'About',
      path: '/about',
      children: [
        { name: 'About Us', path: '/about' },
        { name: 'Mission & Vision', path: '/about#mission-vision' },
      ],
    },
    {
      name: 'Organization',
      path: '/leadership',
      children: [
        { name: 'Leadership', path: '/leadership' },
        { name: 'Constitution', path: '/constitution' },
        { name: 'Activities', path: '/activities' },
        { name: 'Programs', path: '/activities#programs' },
        { name: 'Campaigns', path: '/activities#campaigns' },
        { name: 'Gallery', path: '/gallery' },
      ],
    },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setDesktopMenuOpen(null);
    setMobileMenuOpen(null);
  }, [location]);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg py-2' 
          : 'bg-slate-900/55 backdrop-blur-sm py-4 text-white'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className={`flex items-center gap-2 text-2xl font-display font-bold tracking-tight transition-colors ${
            scrolled ? 'text-primary' : 'text-white'
          }`}
        >
          <img src={NDM_LOGO_URL} alt="NDSM logo" className="h-8 w-auto rounded-sm border border-black/10" loading="lazy" />
          <span>{NDSM_SHORT_NAME}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;

            if (!link.children) {
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-body font-medium transition-all hover:text-gold ${
                    isActive ? 'text-gold' : scrolled ? 'text-slate-700' : 'text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            }

            const hasActiveChild = link.children.some((child) => location.pathname === child.path.split('#')[0]);

            return (
              <div
                key={link.path}
                className="relative"
                onMouseEnter={() => setDesktopMenuOpen(link.name)}
                onMouseLeave={() => setDesktopMenuOpen(null)}
              >
                <Link
                  to={link.path}
                  className={`inline-flex items-center gap-1 text-sm font-body font-medium transition-all hover:text-gold ${
                    isActive || hasActiveChild ? 'text-gold' : scrolled ? 'text-slate-700' : 'text-white'
                  }`}
                >
                  {link.name}
                  <span className="text-xs">▾</span>
                </Link>

                <AnimatePresence>
                  {desktopMenuOpen === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <Link to="/join">
            <Button variant="accent" size="sm">Join Movement</Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={`lg:hidden p-2 rounded-md ${scrolled ? 'text-primary' : 'text-white'}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => {
                if (!link.children) {
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-lg font-medium ${
                        location.pathname === link.path ? 'text-primary' : 'text-gray-600'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                }

                const hasActiveChild = link.children.some((child) => location.pathname === child.path.split('#')[0]);

                return (
                  <div key={link.path} className="rounded-lg border border-gray-100">
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen((prev) => (prev === link.name ? null : link.name))}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-lg font-medium ${
                        location.pathname === link.path || hasActiveChild ? 'text-primary' : 'text-gray-700'
                      }`}
                    >
                      <span>{link.name}</span>
                      <span className="text-sm">{mobileMenuOpen === link.name ? '▴' : '▾'}</span>
                    </button>

                    <AnimatePresence>
                      {mobileMenuOpen === link.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden border-t border-gray-100"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              <Link to="/join" className="w-full">
                <Button variant="primary" className="w-full">Join Movement</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
