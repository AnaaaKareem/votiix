import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelectCandidate() {
  const navigate = useNavigate();
  const [candidateCode, setCandidateCode] = useState('');

  const candidates = [
    { id: '01', name: 'Mariam Youssef', party: 'Democratic Party' },
    { id: '02', name: 'Khaled Ibrahim', party: 'National Alliance' },
    { id: '03', name: 'Laila Hassan', party: 'Independent' },
    { id: '04', name: 'Omar Abdelaziz', party: 'Social Justice Party' },
    { id: '05', name: 'Fatima Al-Sayed', party: 'Independent' },
    { id: '06', name: 'Mostafa Kamel', party: 'Liberal Union' }
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans antialiased text-[#111827] overflow-hidden">
      <header className="w-full bg-white py-5 px-8 flex items-center border-b border-gray-100 shadow-sm z-10 relative">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#111827]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
          </svg>
          <span className="font-bold text-lg tracking-tight">Votiix</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-73px)] w-full">
        <div className="flex-1 p-8 lg:p-14 flex flex-col h-full bg-[#fbfcfd] relative overflow-y-auto">
          <div className="mb-10">
            <p className="text-[13px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-2">Contest Title</p>
            <h1 className="text-3xl lg:text-[40px] font-extrabold tracking-tight text-[#111827] leading-tight">
              Parliamentary Seat - Giza
            </h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto pb-20">
            <label className="text-slate-500 font-semibold mb-6 text-lg">Enter Candidate Code</label>
            <input 
              type="text" 
              inputMode="numeric" 
              pattern="[0-9]*" 
              placeholder="00"
              value={candidateCode}
              onChange={(e) => setCandidateCode(e.target.value)}
              className="w-full max-w-[340px] h-40 bg-white border-[3px] border-[#111827] rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] mb-8 text-center text-6xl font-extrabold text-[#111827] focus:outline-none focus:border-[#111827] focus:ring-4 focus:ring-gray-200 transition-all placeholder:text-gray-200" 
            />

            <div className="flex gap-4 w-full max-w-[340px]">
              <button onClick={() => navigate('/candidate-confirmation')}
                className="flex-1 bg-white border border-gray-200 rounded-xl py-4 flex items-center justify-center gap-3 transition-colors hover:border-[#111827] hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 hover:text-white hover:border-green-600">
                <span className="bg-slate-100 text-[#111827] w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm">#</span>
                <span className="font-bold text-[14px]">Confirm Vote</span>
              </button>

              <button onClick={() => setCandidateCode('')}
                className="flex-1 bg-white border border-gray-200 rounded-xl py-4 flex items-center justify-center gap-3 transition-colors hover:border-[#111827] hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 hover:text-white hover:border-red-600">
                <span className="bg-slate-100 text-[#111827] w-8 h-8 rounded-md flex items-center justify-center font-bold text-lg leading-none pt-2">*</span>
                <span className="font-bold text-[14px]">Clear Entry</span>
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-8 lg:left-14 right-8 lg:right-14 border-t border-gray-200/60 pt-6">
            <p className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-3">Device Controller Legend</p>
            <div className="flex items-center gap-3">
              <span className="bg-slate-200/70 text-[#111827] text-[10px] font-bold px-2 py-1 rounded shadow-sm">0 - 9</span>
              <span className="text-xs text-slate-500 font-medium">Type Code</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[480px] xl:w-[540px] bg-white border-l border-gray-100 flex flex-col h-full z-10 shadow-[-4px_0_24px_-16px_rgba(0,0,0,0.05)]">
          <div className="p-6 lg:p-8 flex items-center justify-between border-b border-gray-50">
            <h2 className="text-xl font-bold text-[#111827]">Candidate Registry</h2>
            <div className="flex gap-2">
              <button className="bg-[#111827] text-white w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path>
                </svg>
              </button>
              <button className="bg-[#111827] text-white w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-4">
            {candidates.map((c) => (
              <div key={c.id} onClick={() => setCandidateCode(c.id)} className="border border-gray-200/80 rounded-2xl p-4 flex items-center gap-5 bg-white transition-all hover:border-[#111827] hover:shadow-md cursor-pointer">
                <div className="w-[52px] h-[52px] rounded-full bg-slate-200/60 flex items-center justify-center text-xl font-bold text-[#111827]">
                  {c.id}
                </div>
                <div>
                  <h3 className="font-bold text-[17px] text-[#111827] leading-tight mb-0.5">{c.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{c.party}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
