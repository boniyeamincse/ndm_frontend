import React from 'react';
import { motion } from 'framer-motion';

const baseStyles = 'rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden';

export const Base = ({ children, className = '', hover = false, as: Component = 'div', ...props }) => {
  const elementProps = {
    className: `${baseStyles} ${className}`.trim(),
    ...props,
  };

  if (hover) {
    return (
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} {...elementProps}>
        {children}
      </motion.div>
    );
  }

  return <Component {...elementProps}>{children}</Component>;
};

export const News = ({ image, tag, title, excerpt, date, className = '' }) => (
  <Base hover className={className}>
    {image && <img src={image} alt={title} className="h-48 w-full object-cover" />}
    <div className="p-5 space-y-3">
      {tag && <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{tag}</span>}
      <div>
        <h3 className="text-lg font-bold text-slate-900 leading-tight">{title}</h3>
        {date && <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{date}</p>}
      </div>
      {excerpt && <p className="text-sm leading-6 text-slate-600">{excerpt}</p>}
    </div>
  </Base>
);

export const Leader = ({ photo, name, role, bio, className = '' }) => (
  <Base hover className={`p-5 ${className}`}>
    <div className="flex items-start gap-4">
      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 flex-shrink-0">
        {photo ? <img src={photo} alt={name} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-slate-900 truncate">{name}</h3>
        <p className="mt-1 text-sm font-medium text-emerald-700">{role}</p>
        {bio && <p className="mt-2 text-sm leading-6 text-slate-600">{bio}</p>}
      </div>
    </div>
  </Base>
);

export const Stat = ({ label, value, icon, tone = 'emerald', className = '' }) => {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    rose: 'bg-rose-50 text-rose-700',
  };

  return (
    <Base hover className={`p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</p>
        </div>
        {icon ? <div className={`rounded-2xl px-3 py-2 text-lg ${tones[tone] ?? tones.emerald}`}>{icon}</div> : null}
      </div>
    </Base>
  );
};

const Card = Object.assign(Base, { Base, News, Leader, Stat });

export default Card;
