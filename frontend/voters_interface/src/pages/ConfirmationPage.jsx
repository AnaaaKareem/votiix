import { useNavigate } from 'react-router-dom';

export default function ConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8f9fc] min-h-screen flex flex-col font-sans antialiased text-[#0e1726]">
      <header className="w-full bg-white py-5 px-8 flex items-center border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#0e1726]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
          </svg>
          <span className="font-bold text-lg tracking-tight">Votiix</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 w-full">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 w-full max-w-xl flex flex-col items-center text-center shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-50/50">
          <div className="relative flex items-center justify-center w-56 h-56 mb-6 mt-4">
            <div className="absolute inset-2 bg-[#10b981]/10 rounded-full blur-2xl"></div>
            <div className="absolute w-56 h-56 border border-[#10b981]/20 rounded-full"></div>
            <div className="absolute w-44 h-44 border border-[#10b981]/40 rounded-full"></div>
            <div className="relative z-10 w-36 h-36 bg-white border-[3px] border-[#10b981] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(16,185,129,0.15)]">
              <svg className="w-16 h-16 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
              </svg>
              <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 bg-[#10b981] rounded-full p-2 border-4 border-white shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[#ecfdf5] text-[#10b981] text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.15em] mb-4">
            Identity Verified
          </div>

          <h1 className="text-3xl md:text-[32px] font-extrabold tracking-tight text-[#0e1726] mb-3">
            Access Granted
          </h1>

          <p className="text-slate-500 text-[15px] font-medium max-w-sm mx-auto leading-relaxed mb-8">
            Biometric authentication successful. Your record has been matched with the National Voter Registry.
          </p>

          <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 text-left mb-8 shadow-sm">
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="Voter Avatar" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
            <div className="flex flex-col">
              <h3 className="font-bold text-[#0e1726] text-[17px] leading-tight mb-0.5">Alexander J. Sterling</h3>
              <p className="text-xs text-slate-500 font-medium mb-2">Voter ID: ****-****-9281</p>
              <div className="flex gap-2">
                <span className="bg-slate-200/70 text-slate-600 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">District 12</span>
                <span className="bg-slate-200/70 text-slate-600 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">Eligible</span>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/select-candidate')}
            className="w-full max-w-[280px] bg-[#0e1726] hover:bg-[#1a2639] text-white transition-colors duration-200 rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-semibold text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#0e1726] focus:ring-offset-2">
            Proceed to Voting
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
      </main>

      <footer className="py-8 flex items-center justify-center gap-2 text-slate-400 text-[11px] font-semibold">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        End-to-end encrypted biometric tunnel active
      </footer>
    </div>
  );
}
