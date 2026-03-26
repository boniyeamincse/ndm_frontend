import React from 'react';

const MemberInfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm py-2.5 border-b border-slate-50/50 last:border-0 group transition-colors hover:bg-slate-50/30 px-2 rounded-lg">
    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] w-32 shrink-0">{label}</span>
    <span className="text-slate-900 font-black text-right truncate ml-4">{value ?? '—'}</span>
  </div>
);

export default MemberInfoRow;