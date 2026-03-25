import React from 'react';

const Input = ({ label, error, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 rounded-lg border bg-white/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-primary'}`}
      />
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
