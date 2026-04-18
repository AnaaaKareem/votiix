import React from 'react';
import { 
  Download, 
  Map, 
  MoreVertical,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const governorates = [
  { name: 'Cairo', ballots: '1,240,591', turnout: '74.2%', status: 'COMPLETE', statusVariant: 'success' },
  { name: 'Alexandria', ballots: '982,102', turnout: '62.1%', status: 'IN PROGRESS', statusVariant: 'accent' },
  { name: 'Giza', ballots: '1,055,432', turnout: '68.7%', status: 'COMPLETE', statusVariant: 'success' },
];

const LiveElectionAdmin = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-widest uppercase text-slate-900">Live Election View</h1>
        <div className="w-3 h-3 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">Total Ballots Cast</p>
            <div className="flex items-baseline gap-3">
                <p className="text-4xl font-black text-slate-900 tracking-tight">4,829,102</p>
                <span className="text-sm font-bold text-accent">+12.4% vs 2018</span>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">Overall Turnout</p>
            <div className="flex items-center gap-4">
                <p className="text-4xl font-black text-slate-900 tracking-tight">68.4%</p>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[68.4%]" />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">Active Polling Stations</p>
            <div className="flex items-center gap-4">
                <p className="text-4xl font-black text-slate-900 tracking-tight">29,401</p>
                <span className="text-[10px] font-bold tracking-widest bg-tally/10 text-purple-700 px-2 py-0.5 rounded-full uppercase">Live Reporting</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div>
                    <h2 className="font-bold text-slate-900">National Turnout Density</h2>
                    <p className="text-sm text-slate-500">Live geographic distribution of voter participation by governorate</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" className="font-bold text-xs uppercase tracking-widest">Toggle Heatmap</Button>
                    <Button className="bg-slate-900 hover:bg-black font-bold text-xs uppercase tracking-widest gap-2" size="sm">
                        Export GeoJSON
                    </Button>
                </div>
            </div>
            <div className="flex-1 bg-slate-800 relative min-h-[400px] flex items-center justify-center overflow-hidden">
                <Map className="w-32 h-32 text-slate-700 absolute opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-blue-900/20 mix-blend-overlay" />
                
                <div className="absolute top-1/4 left-1/3 flex flex-col items-center">
                    <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded shadow-lg mb-2">
                        Cairo: 74.2% Turnout
                    </div>
                    <div className="w-4 h-4 rounded-full bg-accent border-2 border-white shadow-lg animate-pulse" />
                </div>
                <div className="absolute bottom-1/3 left-1/4 w-3 h-3 rounded-full bg-accent/60 border border-white shadow-lg" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 rounded-full bg-accent/60 border border-white shadow-lg" />

                <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                    <p className="text-[10px] font-bold tracking-widest text-slate-900 uppercase mb-3">Turnout Scale</p>
                    <div className="flex gap-1 mb-1">
                        <div className="w-8 h-3 rounded-sm bg-blue-200" />
                        <div className="w-8 h-3 rounded-sm bg-blue-400" />
                        <div className="w-8 h-3 rounded-sm bg-blue-600" />
                        <div className="w-8 h-3 rounded-sm bg-blue-800" />
                        <div className="w-8 h-3 rounded-sm bg-blue-900" />
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 flex justify-between">
                        <span>20%</span>
                        <span>100%</span>
                    </p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="font-bold text-slate-900">Turnout by Region</h2>
                    <p className="text-sm text-slate-500">Macro-regional distribution</p>
                </div>
                <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 flex items-center justify-center py-8">
                <div className="w-48 h-48 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">Macro</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Analysis</p>
                </div>
            </div>

            <div className="space-y-4 mt-auto">
                {[
                    { label: 'Lower Egypt', val: '42.1%', color: 'bg-blue-600' },
                    { label: 'Upper Egypt', val: '28.4%', color: 'bg-blue-500' },
                    { label: 'Canal Cities', val: '19.5%', color: 'bg-blue-300' },
                    { label: 'Frontier', val: '10.0%', color: 'bg-slate-200' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{item.val}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-bold text-slate-900 tracking-wide uppercase">Governorate Level Breakdown</h2>
            <div className="relative max-w-xs w-full">
                <input 
                    type="text" 
                    placeholder="Search region..." 
                    className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Governorate</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Total Ballots</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Turnout Trend</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Reporting Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Audit State</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {governorates.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 text-sm font-bold text-slate-900">{row.name}</td>
                            <td className="px-6 py-5 text-sm font-mono text-slate-600 text-right">{row.ballots}</td>
                            <td className="px-6 py-5 text-center">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent" style={{ width: row.turnout }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 w-10 text-left">{row.turnout}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <Badge variant={row.statusVariant}>{row.status}</Badge>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <div className="flex justify-end">
                                    {row.status === 'COMPLETE' ? (
                                        <ShieldCheck className="w-5 h-5 text-accent" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default LiveElectionAdmin;
