import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NDM_LOGO_URL } from '../../constants/branding';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    About: [
      { name: 'Our Mission', path: '/about' },
      { name: 'Leadership', path: '/leadership' },
      { name: 'History', path: '/history' },
      { name: 'Awards', path: '/awards' },
    ],
    Movement: [
      { name: 'Join Us', path: '/join' },
      { name: 'Activities', path: '/activities' },
      { name: 'Campuses', path: '/campuses' },
      { name: 'Volunteer', path: '/volunteer' },
    ],
    Resources: [
      { name: 'News & Blog', path: '/news' },
      { name: 'Downloads', path: '/downloads' },
      { name: 'Media Kit', path: '/media' },
      { name: 'FAQ', path: '/faq' },
    ],
  };

  const socials = [
    { icon: 'fb', url: '#', label: 'Facebook' },
    { icon: 'tw', url: '#', label: 'Twitter' },
    { icon: 'yt', url: '#', label: 'YouTube' },
    { icon: 'li', url: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 text-3xl font-display font-bold text-gold">
              <img src={NDM_LOGO_URL} alt="NDM logo" className="h-10 w-auto rounded-md border border-white/20" loading="lazy" />
              <span>Student Movement - NDM</span>
            </Link>
            <p className="text-gray-300 max-w-sm leading-relaxed">
              Empowering the next generation of leaders through democratic values, integrity, and proactive student movement. Shaping the future of Bangladesh, one student at a time.
            </p>
            <div className="flex space-x-4">
              {socials.map((soc) => (
                <a 
                  key={soc.label} 
                  href={soc.url} 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-primary-dark transition-all"
                  aria-label={soc.label}
                >
                  <span className="text-lg font-bold">{soc.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-lg font-bold mb-6 text-gold">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-400">
          <p>© {currentYear} Student Movement - NDM. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
