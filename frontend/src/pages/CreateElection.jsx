import React from 'react';
import { 
  ChevronRight, 
  Info, 
  Calendar, 
  Smartphone, 
  Shield, 
  Map, 
  Plus, 
  Settings, 
  Upload, 
  FileText,
  Fingerprint
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const CreateElection = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Admin</span>
                <ChevronRight className="w-3 h-3" />
                <span>Elections</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-900">Create New</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create New Election</h1>
            <p className="text-slate-500 font-medium">Configure election details, geography, and contest logic.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="secondary" className="px-6">Discard</Button>
            <Button className="px-6 gap-2 bg-slate-900">
                <FileText className="w-4 h-4" /> Save Election
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <Info className="w-4 h-4 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900">Section A: Election Details</h3>
                </div>

                <div className="space-y-6">
                    <Input 
                        label="Election Title" 
                        placeholder="e.g. 2024 Presidential General Election" 
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Start Date & Time</label>
                            <div className="relative">
                                <input type="text" placeholder="mm/dd/yyyy, --:-- --" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 pl-10" />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">End Date & Time</label>
                            <div className="relative">
                                <input type="text" placeholder="mm/dd/yyyy, --:-- --" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 pl-10" />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-between border border-slate-100 group hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                                <Smartphone className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Enable Mobile Voting</p>
                                <p className="text-xs text-slate-500">Allows verified voters to cast ballots via Votiix mobile app</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-slate-900 rounded-full relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <Shield className="w-4 h-4 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900">Archive Policy</h3>
                </div>

                <div className="space-y-8">
                    <div className="flex items-end gap-6">
                        <div className="flex-1">
                            <Input 
                                label="PII Purge Timeline (Days)" 
                                defaultValue="30"
                                helperText="Standard compliance requires a minimum of 7 days for verification."
                                className="bg-slate-50"
                            />
                        </div>
                        <div className="pb-8">
                            <span className="text-sm font-bold text-slate-400">Days after close</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Fingerprint className="w-5 h-5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-700">Automatic Biometric Wipe</span>
                        </div>
                        <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 shadow-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Map className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-900 text-lg tracking-tight">Section B:<br/>Geography</h3>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                        <Plus className="w-3 h-3" /> Add Level
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-900">National</span>
                        </div>
                        <Settings className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-pointer transition-all" />
                    </div>

                    <div className="pl-4 border-l-2 border-slate-100 space-y-4">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
                                <span className="text-sm font-bold text-slate-700">Provinces (12)</span>
                            </div>
                        </div>

                        <div className="pl-8 space-y-4">
                            {[
                                'Northern Ward A',
                                'Southern Ward B',
                                'Eastern District C',
                            ].map((ward) => (
                                <div key={ward} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <Settings className="w-3 h-3 text-slate-300" />
                                        <span className="text-xs font-medium text-slate-500">{ward}</span>
                                    </div>
                                </div>
                            ))}
                            <button className="flex items-center gap-2 text-[10px] font-bold text-primary hover:text-slate-900 transition-colors uppercase tracking-widest pl-5">
                                <Plus className="w-3 h-3" /> New Ward
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 group hover:bg-slate-50 hover:border-primary/20 cursor-pointer transition-all">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 group-hover:shadow-sm">
                            <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
                            Or import geographic hierarchy from<br/>
                            <span className="font-bold text-slate-600">CSV/JSON</span>
                        </p>
                        <Button variant="secondary" size="sm" className="bg-white">Upload File</Button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateElection;
