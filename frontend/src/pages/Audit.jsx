import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  Database,
  Lock,
  Download
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const auditLogs = [
  {
    timestamp: 'Oct 24, 2023 14:32:11 UTC',
    actor: 'Admin (A. Rivera)',
    actorRole: 'Admin',
    action: 'Security Policy',
    actionType: 'MODIFY',
    details: 'Updated MFA requirements for regional officers.',
    status: 'Success',
    statusColor: 'text-emerald-500',
    icon: Lock,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    timestamp: 'Oct 24, 2023 12:15:04 UTC',
    actor: 'Officer (J. Doe)',
    actorRole: 'Officer',
    action: 'New Voter Registration',
    actionType: 'CREATE',
    details: 'Registered ID: VT-9982-A (District 4)',
    status: 'Success',
    statusColor: 'text-emerald-500',
    icon: User,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600'
  },
  {
    timestamp: 'Oct 24, 2023 11:02:45 UTC',
    actor: 'System',
    actorRole: 'System',
    action: 'Database Optimization',
    actionType: 'SYNC',
    details: 'Automated cleanup of temporary audit cache.',
    status: 'Success',
    statusColor: 'text-emerald-500',
    icon: Database,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    timestamp: 'Oct 24, 2023 09:44:12 UTC',
    actor: 'System',
    actorRole: 'System',
    action: 'Failed Login Attempt',
    actionType: 'SECURITY',
    details: 'IP: 192.168.1.45 (Invalid Credentials)',
    status: 'Blocked',
    statusColor: 'text-red-500',
    icon: Lock,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600'
  },
  {
    timestamp: 'Oct 23, 2023 22:30:10 UTC',
    actor: 'Admin (S. Chen)',
    actorRole: 'Admin',
    action: 'Voter Roll Export',
    actionType: 'EXPORT',
    details: 'Generated encrypted CSV for Election Board review.',
    status: 'Success',
    statusColor: 'text-emerald-500',
    icon: Download,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
];

const getActionVariant = (type) => {
  switch (type) {
    case 'MODIFY': return 'accent';
    case 'CREATE': return 'accent';
    case 'SYNC': return 'neutral';
    case 'SECURITY': return 'error';
    case 'EXPORT': return 'warning';
    default: return 'neutral';
  }
};

const Audit = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Audit Trail</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date Range</label>
                <div className="relative">
                    <input 
                        type="text" 
                        defaultValue="Oct 01, 2023 - Oct 31, 2023"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
            </div>
            <Select 
                label="Actor" 
                options={[{ value: 'all', label: 'All Actors' }]} 
                className="bg-slate-50"
            />
            <Select 
                label="Action Type" 
                options={[{ value: 'all', label: 'All Actions' }]} 
                className="bg-slate-50"
            />
            <div className="flex gap-2">
                <Button className="flex-1 bg-primary">Apply Filters</Button>
                <Button variant="secondary" className="px-3">Reset</Button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actor</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Details/Metadata</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5 text-xs font-medium text-slate-500 leading-relaxed">
                                {log.timestamp.split(' ').slice(0, 3).join(' ')}<br/>
                                <span className="text-slate-400">{log.timestamp.split(' ').slice(3).join(' ')}</span>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${log.iconBg} flex items-center justify-center`}>
                                        <log.icon className={`w-4 h-4 ${log.iconColor}`} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{log.actor}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="space-y-2">
                                    <Badge variant={getActionVariant(log.actionType)}>{log.actionType}</Badge>
                                    <p className="text-sm font-semibold text-slate-700">{log.action}</p>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-sm text-slate-500 font-medium max-w-xs">
                                {log.details}
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${log.statusColor === 'text-emerald-500' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className={`text-xs font-bold ${log.statusColor}`}>{log.status}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">Showing 1 to 5 of 1,248 results</p>
            <div className="flex items-center gap-1">
                <button className="p-2 text-slate-400 hover:text-slate-900">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1 px-2">
                    {[1, 2, 3, '...', 250].map((page, i) => (
                        <button 
                            key={i}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                page === 1 
                                    ? 'bg-primary text-white' 
                                    : 'text-slate-500 hover:bg-white hover:text-slate-900'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-900">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Audit;
