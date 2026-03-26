import React from 'react';

const MemberCard = ({ className = '', children }) => {
  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 ${className}`}>
      {children}
    </div>
  );
};

export default MemberCard;