import React from 'react';

const Input = ({ label, helperText, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${className}`}
        {...props}
      />
      {helperText && (
        <p className="text-[10px] text-slate-500 ml-1">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
