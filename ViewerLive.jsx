import React from 'react';
import { 
  Users, 
  Map, 
  RotateCcw,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import Badge from '../components/ui/Badge';

const candidates = [
  {
    name: 'Julian Sterling',
    party: 'Conservative Alliance',
    percent: '48.2',
    votes: '12,450,231',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    avatar: 'bg-slate-800',
    iconColor: 'bg-slate-900',
    icon: Inbox
  },
  {
    name: 'Elena Rodriguez',
    party: 'Progressive Unity',
    percent: '42.7',
    votes: '11,042,912',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    avatar: 'bg-slate-700',
    iconColor: 'bg-blue-600',
    icon: Users
  },
  {
    name: 'Marcus Thorne',
    party: 'Libertarian Front',
    percent: '6.1',
    votes: '1,562,004',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    avatar: 'bg-slate-200',
    iconColor: 'bg-slate-600',
    icon: Inbox
  }
];

const ViewerLive = () => {
  const ThirdCandidateIcon = candidates[2].icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2 mb-8">
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">National Aggregation</p>
        <h1 className="text-2xl font-bold text-slate-900">General Election 2024</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidates.slice(0, 2).map((c, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden h-56">
                        <Inbox className="w-48 h-48 absolute -top-8 -right-8 text-slate-50 opacity-50" />
                        <div className="relative z-10 space-y-2">
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{c.percent} <span className="text-xl text-slate-400">%</span></p>
                            <p className={`text-sm font-bold tracking-widest uppercase ${c.color}`}>{c.votes} VOTES</p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between mt-auto">
                            <div>
                                <p className="font-bold text-slate-900">{c.name}</p>
                                <p className="text-sm text-slate-500">{c.party}</p>
                            </div>
                            <div className="relative">
                                <div className={`w-16 h-16 rounded-lg ${c.avatar} flex items-center justify-center overflow-hidden`}>
                                    <div className="w-8 h-8 rounded-full bg-slate-400/20 mb-2" />
                                    <div className="w-12 h-6 rounded-t-full bg-slate-400/20 absolute bottom-0" />
                                </div>
                                <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded flex items-center justify-center text-white ${c.iconColor} shadow-sm border-2 border-white`}>
                                    <c.icon className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden h-56">
                    <div className="relative z-10 space-y-2">
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{candidates[2].percent} <span className="text-lg text-slate-400">%</span></p>
                        <p className={`text-xs font-bold tracking-widest uppercase ${candidates[2].color}`}>{candidates[2].votes} VOTES</p>
                    </div>
                    <div className="relative z-10 flex items-center justify-between mt-auto">
                        <div>
                            <p className="font-bold text-slate-900">{candidates[2].name}</p>
                            <p className="text-sm text-slate-500">{candidates[2].party}</p>
                        </div>
                        <div className="relative">
                            <div className={`w-14 h-14 rounded-lg ${candidates[2].avatar} flex items-center justify-center overflow-hidden`}>
                                <div className="w-6 h-6 rounded-full bg-slate-900 mb-2" />
                                <div className="w-10 h-5 rounded-t-full bg-slate-900 absolute bottom-0" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded flex items-center justify-center text-white ${candidates[2].iconColor} shadow-sm border border-white`}>
                                <ThirdCandidateIcon className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-56">
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">Reporting Progress</p>
                        <div>
                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-slate-900 w-[88.4%]" />
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-900">88.4%</span>
                                <span className="text-slate-400">Precincts</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Last Updated</p>
                        <p className="text-sm font-bold text-slate-900">May 14, 11:24 PM EST</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="font-bold text-slate-900">Regional Distribution</h2>
                    <p className="text-sm text-slate-500">Interactive territory breakdown</p>
                </div>
                <Map className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex-1 relative flex items-center justify-center py-12">
                <div className="relative w-64 h-64">
                    <div className="absolute inset-0 bg-slate-200 clip-path-region opacity-50" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />
                    <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 bg-blue-700 flex items-center justify-center shadow-xl clip-path-center" style={{ clipPath: 'polygon(10% 20%, 90% 10%, 100% 90%, 0% 100%)' }}>
                        <span className="text-white text-[10px] font-bold tracking-widest uppercase">Metro</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mt-auto pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-900" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sterling Lead</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rodriguez Lead</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending</span>
                </div>
            </div>
        </div>
      </div>

      <div className="pt-8 mt-12 border-t border-slate-200 flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Registered Voters</p>
                <p className="text-lg font-bold text-slate-900">28,451,120</p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Turnout Rate</p>
                <p className="text-lg font-bold text-blue-600">82.1%</p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Status</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-sm font-bold text-slate-900">Secure Processing</p>
                </div>
            </div>
        </div>
        <button className="bg-slate-900 hover:bg-black text-white p-4 rounded-xl shadow-lg transition-transform hover:scale-105">
            <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ViewerLive;
