import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-bold mb-4">NDM Student Movement</h3>
          <p className="text-sm">Empowering the youth for a better, democratic Bangladesh. Join our movement today.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-gold">Our Story</a></li>
            <li><a href="/activities" className="hover:text-gold">What We Do</a></li>
            <li><a href="/leadership" className="hover:text-gold">Leadership</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Community</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/news" className="hover:text-gold">Latest News</a></li>
            <li><a href="/gallery" className="hover:text-gold">Gallery</a></li>
            <li><a href="/join" className="hover:text-gold">Join Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Connect</h4>
          <p className="text-sm">Email: info@ndmstudent.org</p>
          <div className="flex space-x-4 mt-4">
            {/* Social Icons Placeholder */}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} NDM Student Movement. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
