import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerificationFinger() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/confirmation');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

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
        <div className="bg-white rounded-3xl p-10 md:p-14 w-full max-w-2xl flex flex-col items-center text-center shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-50/50">
          <div className="relative flex items-center justify-center w-56 h-56 mb-6">
            <div className="absolute inset-4 bg-blue-400/10 rounded-full blur-2xl"></div>
            <div className="absolute w-56 h-56 border border-blue-100 rounded-full"></div>
            <div className="absolute w-44 h-44 border border-blue-100/70 rounded-full"></div>
            <div className="relative z-10 w-36 h-36 bg-white border border-[#2563eb] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(37,99,235,0.12)]">
              <svg className="w-16 h-16 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
              </svg>
            </div>
          </div>
          <div className="bg-[#eff6ff] text-[#2563eb] text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.15em] mb-6">
            Waiting for scan
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0e1726] mb-4 leading-[1.15]">
            Scan Finger to Verify Identity <br className="hidden md:block" /> and Vote
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
            Please place your thumb on the scanner to continue to the voting booth.
          </p>
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
