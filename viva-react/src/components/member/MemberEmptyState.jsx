import React from 'react';

const MemberEmptyState = ({ text, className = '' }) => {
  return (
    <div className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center text-slate-500 ${className}`}>
      {text}
    </div>
  );
};

export default MemberEmptyState;