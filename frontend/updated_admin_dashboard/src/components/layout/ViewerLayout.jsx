import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';

const ViewerLayout = () => {
  const location = useLocation();
  const showLiveBadge = location.pathname.includes('/live/details');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-slate-900" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Votiix</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/public/live"
              className={({ isActive }) =>
                `text-sm font-bold pb-5 pt-6 border-b-2 transition-colors ${
                  isActive || location.pathname.includes('/public/live')
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`
              }
            >
              Live Election
            </NavLink>
            <NavLink
              to="/public/archive"
              className={({ isActive }) =>
                `text-sm font-bold pb-5 pt-6 border-b-2 transition-colors ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`
              }
            >
              Archive
            </NavLink>
          </nav>

          <div className="flex items-center min-w-[120px] justify-end">
            {showLiveBadge && (
              <span className="flex items-center gap-2 bg-tally/20 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                Live Counting
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ViewerLayout;
