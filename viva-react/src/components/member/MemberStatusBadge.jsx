import React from 'react';

const STYLES = {
  member: {
    active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-700/10',
    pending: 'bg-amber-100 text-amber-700 ring-1 ring-amber-700/10',
    suspended: 'bg-orange-100 text-orange-700 ring-1 ring-orange-700/10',
    expelled: 'bg-red-100 text-red-700 ring-1 ring-red-700/10',
  },
  task: {
    pending: 'bg-amber-100 text-amber-700 ring-1 ring-amber-700/10',
    in_progress: 'bg-blue-100 text-blue-700 ring-1 ring-blue-700/10',
    done: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-700/10',
  },
  position: {
    active: 'bg-green-50 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
  },
};

const MemberStatusBadge = ({ status, variant = 'member', className = '', label }) => {
  const key = String(status || '').toLowerCase();
  const cls = STYLES[variant]?.[key] || 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  const text = label || key.replace('_', ' ') || 'unknown';

  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${cls} ${className}`}>
      {text}
    </span>
  );
};

export default MemberStatusBadge;