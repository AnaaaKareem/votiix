import React from 'react';
import { 
  AlertTriangle, 
  Info, 
  Lock, 
  CheckCircle2, 
  Download, 
  History, 
  Settings,
  Trash2,
  XCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Security = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Danger Zone: Data Wipe</h1>
        <p className="text-slate-500 mt-1 font-medium">Manage permanent data destruction and compliance retention cycles.</p>
      </div>

      <div className="flex bg-error rounded-3xl overflow-hidden shadow-2xl shadow-red-200/50">
        <div className="w-1/3 bg-red-600/20 flex items-center justify-center p-12">
            <AlertTriangle className="w-24 h-24 text-white" strokeWidth={1.5} />
        </div>
        <div className="flex-1 p-12 flex flex-col justify-center bg-white border-y border-r border-error/10">
            <span className="text-[10px] font-black text-error uppercase tracking-[0.2em] bg-red-50 px-3 py-1 rounded-full w-fit mb-4">Critical Security Event</span>
            <h2 className="text-4xl font-black text-error tracking-tight">This action is irreversible.</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-slate-900">Retention Policy Details</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Records Targeted</span>
                        <span className="text-sm font-bold text-slate-900 font-mono">14, 209, 112</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Data Range</span>
                        <span className="text-sm font-bold text-slate-900">Jan 2018 - Dec 2019</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-500">Storage Size</span>
                        <span className="text-sm font-bold text-error">4.2 TB</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <span className="text-sm font-medium text-slate-500">Compliance Standard</span>
                        <span className="text-sm font-bold text-slate-900">GDPR Right to be Forgotten</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="space-y-2">
                    <h3 className="font-bold text-slate-900">Wipe Verification</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        To prevent accidental data loss, please type the word below exactly as shown to confirm you wish to proceed with the permanent archival and subsequent deletion.
                    </p>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Type ARCHIVE to confirm</p>
                        <Input 
                            placeholder="ARCHIVE" 
                            className="bg-slate-50 border-slate-200 py-4 text-center text-lg font-mono tracking-[0.5em] uppercase"
                        />
                    </div>
                    
                    <Button variant="danger" className="w-full py-4 text-base font-black shadow-xl shadow-red-200 gap-2 uppercase tracking-widest">
                        <Trash2 className="w-5 h-5" /> Execute Purge
                    </Button>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="bg-primary rounded-3xl p-8 text-white space-y-6 relative overflow-hidden shadow-2xl shadow-slate-900/20">
                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">Admin Protocol</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            This action requires Level 4 security clearance and will be logged in the immutable system audit trail.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Security Clearance Verified', checked: true },
                            { label: 'MFA Token Validated', checked: true },
                            { label: 'Execution Pending Confirmation', checked: false },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                {item.checked ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-700" />
                                )}
                                <span className={`text-xs font-medium ${item.checked ? 'text-white' : 'text-slate-500'}`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <Lock className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-800 opacity-50 -rotate-12" />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">Related Actions</h3>
                
                <div className="space-y-2">
                    {[
                        { label: 'Export Metadata Only', icon: Download },
                        { label: 'View Retention Logs', icon: History },
                        { label: 'Modify Policy Rules', icon: Settings },
                    ].map((item, i) => (
                        <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                            <span className="text-sm font-bold text-slate-700">{item.label}</span>
                            <item.icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
