import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Upload, 
  CheckCircle2, 
  X,
  Camera
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const Assets = () => {
  const [showToast, setShowToast] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showToast && (
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-200/50 flex items-center justify-between border border-emerald-400/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-50" />
            <p className="font-semibold text-sm">Candidate Alex Morgan added successfully!</p>
          </div>
          <button onClick={() => setShowToast(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Asset Management</h1>
        <p className="text-slate-500 mt-1 font-medium">Centralized content management for political parties and candidate data.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <Users className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Candidate CMS</h2>
        </div>

        <div className="space-y-8">
            <div className="flex items-center gap-2 text-slate-900 mb-6">
                <UserPlus className="w-4 h-4" />
                <h3 className="font-bold text-sm">Add New Candidate</h3>
            </div>

            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-8 space-y-8">
                <div className="space-y-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Candidate Information</p>
                    
                    <Input 
                        label="Full Name" 
                        placeholder="e.g. Alex Morgan" 
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select 
                            label="Party Affiliation" 
                            options={[
                                { value: '', label: 'Select Party' },
                                { value: 'progressive', label: 'Progressive Party' },
                                { value: 'unity', label: 'Unity Alliance' }
                            ]} 
                        />
                        <Input 
                            label="Candidate Code" 
                            placeholder="PC-2024-001" 
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Candidate Portrait</p>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 bg-white flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-slate-50 transition-all cursor-pointer group">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                                <Camera className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-900">Click to upload or drag & drop</p>
                                <p className="text-xs text-slate-500 mt-1">JPG, PNG UP TO 5MB</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Button className="w-full py-3.5 text-base shadow-lg shadow-primary/20 gap-2" size="lg">
                    <UserPlus className="w-5 h-5" /> Add Candidate
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Assets;
