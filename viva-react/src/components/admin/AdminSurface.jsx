import React from 'react';

const AdminSurface = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl ${className}`}>
      {children}
    </div>
  );
};

export default AdminSurface;