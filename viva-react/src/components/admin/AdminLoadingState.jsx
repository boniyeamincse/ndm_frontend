import React from 'react';

const AdminLoadingState = ({ text = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{text}</p>
    </div>
  );
};

export default AdminLoadingState;