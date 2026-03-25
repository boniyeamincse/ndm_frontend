import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'News', path: '/news' },
    { name: 'Activities', path: '/activities' },
    { name: 'Leadership', path: '/leadership' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [location]);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4 text-white'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className={`text-2xl font-display font-bold tracking-tight transition-colors ${
            scrolled ? 'text-primary' : 'text-white'
          }`}
        >
          NDM<span className="text-gold italic">STUDENT</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-body font-medium transition-all hover:text-gold ${
                location.pathname === link.path 
                  ? 'text-gold' 
                  : scrolled ? 'text-text-main' : 'text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
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
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-lg font-medium ${
                    location.pathname === link.path ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/join" className="w-full">
                <Button variant="primary" className="w-full">Join Now</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
