import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '../common/ScrollToTop';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow pt-20">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-primary font-display text-xl animate-pulse">Loading NDM...</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
