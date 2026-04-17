import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    accent: "bg-blue-50 text-blue-700 border border-blue-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    error: "bg-red-50 text-red-700 border border-red-100",
    tally: "bg-purple-50 text-purple-700 border border-purple-100",
    archived: "bg-slate-900 text-white",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide inline-flex items-center uppercase ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
