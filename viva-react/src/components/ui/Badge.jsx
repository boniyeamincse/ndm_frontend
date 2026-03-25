import React from 'react';

const badgeVariants = {
	neutral: 'bg-slate-100 text-slate-700 border-slate-200',
	success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
	danger: 'bg-rose-50 text-rose-700 border-rose-200',
	warning: 'bg-amber-50 text-amber-700 border-amber-200',
	achievement: 'bg-yellow-50 text-yellow-800 border-yellow-200',
	info: 'bg-blue-50 text-blue-700 border-blue-200',
};

const Badge = ({ children, variant = 'neutral', pulse = false, className = '' }) => (
	<span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeVariants[variant] ?? badgeVariants.neutral} ${className}`.trim()}>
		{pulse ? <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" /><span className="relative inline-flex h-2 w-2 rounded-full bg-current" /></span> : null}
		{children}
	</span>
);

export default Badge;
