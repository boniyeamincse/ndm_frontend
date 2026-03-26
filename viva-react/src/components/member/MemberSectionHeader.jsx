import React from 'react';

const MemberSectionHeader = ({ title, accentClass = 'bg-primary', action }) => {
  return (
    <div className="flex justify-between items-center mb-6 px-1">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${accentClass}`} />
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
      </div>
      {action || null}
    </div>
  );
};

export default MemberSectionHeader;