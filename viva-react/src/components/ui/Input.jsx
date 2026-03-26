import React from 'react';

const Input = ({ label, error, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 dark:text-slate-500 ml-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-white/5 backdrop-blur-md transition-all outline-none text-sm
          ${error 
            ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' 
            : 'border-gray-200 dark:border-white/10 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 focus:border-primary'}`}
      />
      {error && <p className="mt-1 text-[10px] font-bold text-red-600 dark:text-red-400 ml-1 uppercase tracking-wider">{error}</p>}
    </div>
  );
};

export default Input;
