import React from 'react';

const PRESETS = {
  light: {
    success: 'bg-green-50 text-green-700 border border-green-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
  },
  dark: {
    success: 'bg-primary/10 text-primary border-primary/20 ring-1 ring-primary/10',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20 ring-1 ring-rose-500/10',
  },
};

const AdminToast = ({ message, type = 'success', mode = 'light', className = '' }) => {
  const tone = PRESETS[mode]?.[type] || PRESETS.light.success;

  return (
    <div className={`px-4 py-3 rounded-lg text-sm font-medium ${tone} ${className}`}>
      {message}
    </div>
  );
};

export default AdminToast;