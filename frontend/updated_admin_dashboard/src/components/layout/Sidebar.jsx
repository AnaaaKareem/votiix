import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Layers, 
  Database, 
  BarChart3, 
  ShieldCheck, 
  Trash2, 
  Fingerprint,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';

const navItems = [
  { name: 'Elections', path: '/', icon: Layers },
  { name: 'Assets', path: '/assets', icon: Database },
  { name: 'Results', path: '/results', icon: BarChart3 },
  { name: 'Audit', path: '/audit', icon: ShieldCheck },
  { name: 'Data Wipe', path: '/security', icon: Trash2 },
  { name: 'Live Election view', path: '/live-admin', icon: LayoutGrid },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-slate-900 p-1.5 rounded-lg">
          <Fingerprint className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">Votiix</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
              alt="Alex Thompson"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">Alex Thompson</p>
            <p className="text-xs text-slate-500 truncate">System Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
