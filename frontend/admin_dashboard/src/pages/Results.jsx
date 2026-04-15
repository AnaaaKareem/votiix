import React from 'react';
import { 
  BarChart3, 
  RotateCcw, 
  ShieldCheck, 
  Download,
  Activity,
  CheckCircle2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const resultsData = [
  { contest: 'Presidential', candidate: 'John Doe', votes: '12,450', weightedVotes: '12,450', percent: 45, color: 'bg-slate-600' },
  { contest: 'Presidential', candidate: 'Jane Smith', votes: '10,200', weightedVotes: '10,200', percent: 37, color: 'bg-slate-400' },
  { contest: 'Gubernatorial', candidate: 'Alice Brown', votes: '8,900', weightedVotes: '17,800', percent: 52, color: 'bg-slate-900' },
  { contest: 'Gubernatorial', candidate: 'Bob Wilson', votes: '7,100', weightedVotes: '14,200', percent: 41, color: 'bg-slate-300' },
];

const Results = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Election Results Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time monitoring and certification of election tallies.</p>
        </div>
        <Button variant="secondary" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Trigger Tally
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <BarChart3 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-900">Stations Reporting</p>
                <p className="text-xs text-slate-500">245 / 300 stations completed</p>
            </div>
        </div>
        <div className="flex-1 max-w-md px-12">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[81.6%]" />
            </div>
        </div>
        <div className="text-right">
            <p className="text-2xl font-black text-slate-900">81.6%</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center justify-between shadow-sm shadow-blue-100/50">
        <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <p className="font-bold text-blue-900">All contests counted. Ready to certify.</p>
                <p className="text-sm text-blue-600 font-medium">Audit trail verified for 100% of incoming data packets.</p>
            </div>
        </div>
        <Button className="bg-slate-900 hover:bg-black px-8 py-2.5 shadow-xl shadow-slate-200">
            Certify Results
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900">Live Tally Summary</h2>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Live Update</span>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contest</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Candidate</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Votes</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Weighted Votes</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right w-32">%</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {resultsData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 text-sm font-bold text-slate-900">{row.contest}</td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${row.color}`} />
                                    <span className="text-sm font-semibold text-slate-700">{row.candidate}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-sm font-mono text-slate-600 text-right">{row.votes}</td>
                            <td className="px-6 py-5 text-sm font-mono text-slate-600 text-right">{row.weightedVotes}</td>
                            <td className="px-6 py-5 text-right">
                                <div className="inline-flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-lg">
                                    <span className="text-xs font-black text-slate-900">{row.percent}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors uppercase tracking-widest">
            Download Detailed Report <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Results;
