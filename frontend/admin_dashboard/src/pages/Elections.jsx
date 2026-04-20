import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Pencil, 
  BarChart2, 
  Settings, 
  MoreVertical, 
  Filter, 
  Download,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const stats = [
  { label: 'ACTIVE', count: '12', variant: 'success' },
  { label: 'REGISTRATION', count: '08', variant: 'accent' },
  { label: 'TALLYING', count: '03', variant: 'tally' },
  { label: 'TOTAL', count: '142', variant: 'neutral' },
];

const electionsData = [
  { 
    id: 'ELEC-9942', 
    title: '2024 National General Assembly', 
    startDate: 'Oct 12, 2024', 
    endDate: 'Oct 15, 2024', 
    status: 'Active', 
    icon: Eye,
    dotColor: 'bg-emerald-500'
  },
  { 
    id: 'ELEC-8210', 
    title: 'Student Council Executive Board', 
    startDate: 'Nov 01, 2024', 
    endDate: 'Nov 03, 2024', 
    status: 'Registration', 
    icon: Pencil,
    dotColor: 'bg-blue-500'
  },
  { 
    id: 'ELEC-7731', 
    title: 'Annual Union Labor Vote', 
    startDate: 'Aug 15, 2024', 
    endDate: 'Aug 17, 2024', 
    status: 'Tallying', 
    icon: BarChart2,
    dotColor: 'bg-purple-500'
  },
  { 
    id: 'ELEC-0104', 
    title: 'Tech Innovation Award 2025', 
    startDate: 'Dec 05, 2024', 
    endDate: 'Dec 10, 2024', 
    status: 'Draft', 
    icon: Settings,
    dotColor: 'bg-slate-300'
  },
  { 
    id: 'ELEC-4521', 
    title: 'BOD Selection Q3', 
    startDate: 'Sep 20, 2024', 
    endDate: 'Sep 22, 2024', 
    status: 'Closed', 
    icon: BarChart2,
    dotColor: 'bg-amber-500'
  },
  { 
    id: 'ELEC-0012', 
    title: 'Referendum 2023', 
    startDate: 'Jan 10, 2023', 
    endDate: 'Jan 12, 2023', 
    status: 'Archived', 
    icon: Download,
    dotColor: 'bg-slate-900'
  },
];

const getBadgeVariant = (status) => {
  switch (status.toLowerCase()) {
    case 'active': return 'success';
    case 'registration': return 'accent';
    case 'tallying': return 'tally';
    case 'draft': return 'neutral';
    case 'closed': return 'warning';
    case 'archived': return 'archived';
    default: return 'neutral';
  }
};

const Elections = () => {
  const [activeTab, setActiveTab] = useState('All Elections');
  const tabs = ['All Elections', 'Draft', 'Active', 'Closed', 'Archived'];
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Elections Lifecycle Manager</h1>
          <p className="text-slate-500 mt-1">Monitor and manage institutional voting processes across all stages.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                <button className="px-4 py-1.5 text-sm font-medium bg-slate-50 text-slate-900 rounded-md shadow-sm">Table</button>
                <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">Calendar</button>
            </div>
            <Button className="gap-2" onClick={() => navigate('/create-election')}>
                <span className="text-xl leading-none">+</span> Create New Election
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
            <Badge variant={stat.variant} className="mb-4">{stat.label}</Badge>
            <p className="text-4xl font-bold text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform">{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-semibold transition-colors relative ${
                            activeTab === tab ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                        )}
                    </button>
                ))}
            </div>
            <div className="pb-4 flex items-center gap-2">
                <Button variant="secondary" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" /> Filter
                </Button>
                <Button variant="secondary" size="sm" className="gap-2">
                    <Download className="w-4 h-4" /> Export
                </Button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Title</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Date</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">End Date</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {electionsData.map((election) => (
                        <tr key={election.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${election.dotColor}`} />
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm leading-tight">{election.title}</p>
                                        <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">ID: {election.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-sm text-slate-600 font-medium">{election.startDate}</td>
                            <td className="px-6 py-5 text-sm text-slate-600 font-medium">{election.endDate}</td>
                            <td className="px-6 py-5">
                                <Badge variant={getBadgeVariant(election.status)}>{election.status}</Badge>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                        <election.icon className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">Showing 6 of 142 elections</p>
            <div className="flex items-center gap-1">
                <button className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-30" disabled>
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1 px-2">
                    {[1, 2, 3, '...', 24].map((page, i) => (
                        <button 
                            key={i}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                page === 1 
                                    ? 'bg-primary text-white shadow-sm shadow-slate-200' 
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

export default Elections;
