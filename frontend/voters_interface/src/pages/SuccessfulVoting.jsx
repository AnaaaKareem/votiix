import { useNavigate } from 'react-router-dom';

export default function SuccessfulVoting() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8f9fc] min-h-screen flex flex-col font-sans antialiased text-[#111827]">
      <header className="w-full bg-white py-5 px-8 flex items-center border-b border-gray-100 shadow-sm z-10 relative">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#111827]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
          </svg>
          <span className="font-bold text-lg tracking-tight">Votiix</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 w-full text-center">
        <div className="mb-8 relative flex items-center justify-center">
          <div className="w-28 h-28 bg-[#e6f7f0] rounded-full flex items-center justify-center">
            <div className="w-[72px] h-[72px] bg-[#1ab77b] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgb(26,183,123,0.3)]">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-[32px] md:text-[38px] font-extrabold tracking-tight text-[#111827] mb-4">
          Vote Cast Successfully.
        </h1>

        <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-[380px] mx-auto mb-8">
          Your selection has been securely recorded, encrypted, and added to the blockchain ledger.
        </p>

        <button onClick={() => navigate('/language')}
          className="bg-[#eef2f6] hover:bg-[#dbe3ed] text-[#111827] transition-colors duration-200 py-3 px-8 rounded-lg font-bold text-[13px] shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200">
          Return to Dashboard
        </button>
      </main>

      <footer className="py-8 w-full flex items-center justify-center">
        <p className="text-[11px] font-medium text-slate-400">
          For security, this session will automatically close in <span className="font-bold text-slate-600">2:00</span> minutes.
        </p>
      </footer>
    </div>
  );
}
