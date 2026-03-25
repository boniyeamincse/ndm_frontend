import React from 'react';

const tagVariants = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  achievement: 'bg-yellow-50 text-yellow-800 border-yellow-200',
};

const Tag = ({ children, variant = 'neutral', onClose, className = '' }) => (
  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${tagVariants[variant] ?? tagVariants.neutral} ${className}`.trim()}>
    {children}
    {onClose ? (
      <button onClick={onClose} className="rounded-full px-1 text-[11px] font-bold opacity-70 hover:opacity-100" aria-label="Remove tag">
        x
      </button>
    ) : null}
  </span>
);

export default Tag;