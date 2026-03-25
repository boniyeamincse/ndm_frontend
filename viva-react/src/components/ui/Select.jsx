import React from 'react';

const Select = ({ label, options, error, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-3 rounded-lg border bg-white/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none appearance-none
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-primary'}`}
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
      >
        <option value="">Select option</option>
        {options?.map((opt) => (
          <option key={opt.id || opt.value} value={opt.id || opt.value}>
            {opt.name || opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
