import React from 'react';

const AdminEmptyState = ({ title, subtitle, icon, className = '' }) => {
  return (
    <div className={`text-center ${className}`}>
      {icon ? <div className="text-5xl mb-6 opacity-30">{icon}</div> : null}
      <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
      {subtitle ? <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-widest leading-relaxed">{subtitle}</p> : null}
    </div>
  );
};

export default AdminEmptyState;