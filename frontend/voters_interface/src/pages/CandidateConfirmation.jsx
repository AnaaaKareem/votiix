import { useNavigate } from 'react-router-dom';

export default function CandidateConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f8f9fc] min-h-screen flex flex-col font-sans antialiased text-[#111827] pb-10">
      <header className="w-full bg-white py-5 px-8 flex items-center border-b border-gray-100 shadow-sm z-10 hidden">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#111827]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
          </svg>
          <span className="font-bold text-lg tracking-tight">Votiix</span>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto pt-12 md:pt-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-[42px] font-extrabold tracking-tight text-[#111827] mb-3">Vote Confirmation</h1>
          <p className="text-slate-500 text-[15px] font-medium">Please review your final selection carefully.</p>
        </div>
        <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] w-full max-w-[760px] flex flex-col md:flex-row overflow-hidden mb-12 border border-gray-100">
          <div className="w-full md:w-[45%] h-72 md:h-auto relative bg-slate-200">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="John Doe" className="w-full h-full object-cover object-top" />
          </div>
          <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center">
            <p className="text-[11px] font-bold tracking-[0.15em] text-[#111827] uppercase mb-1">Selected Candidate</p>
            <h2 className="text-4xl md:text-[40px] font-extrabold text-[#111827] mb-6 tracking-tight leading-none">John Doe</h2>
            <p className="text-xs font-semibold text-slate-400 mb-1.5">Affiliated Party</p>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-3.5 h-3.5 rounded-full bg-[#111827]"></div>
              <span className="font-bold text-[#111827] text-[17px]">National Party</span>
            </div>
            <hr className="border-gray-100 mb-6 w-full" />
            <div className="flex items-center gap-2 text-[#1ab77b] font-bold text-[15px]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
              Candidate Verified
            </div>
          </div>
        </div>
        <div className="text-center mb-8 w-full">
          <p className="text-[22px] font-semibold text-[#111827] mb-2">
            You are voting for: <span className="font-bold underline underline-offset-[6px] decoration-2 decoration-[#111827]">John Doe</span>
          </p>
          <p className="text-sm text-slate-500 font-medium">Confirming this vote is final and cannot be undone.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[560px] mx-auto">
          <div className="flex-1 flex flex-col items-center">
            <button onClick={() => navigate('/success')}
              className="w-full h-[60px] bg-[#1ab77b] hover:bg-[#159a66] text-white rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgb(26,183,123,0.25)] transition-all focus:outline-none focus:ring-4 focus:ring-green-100">
              <span className="font-mono text-[17px] font-bold mt-0.5">[ # ]</span>
              <span className="font-extrabold text-[16px] tracking-wide">SUBMIT VOTE</span>
            </button>
            <span className="text-[10px] text-slate-400 font-bold tracking-[0.05em] mt-3 uppercase">Press hash to confirm</span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <button onClick={() => navigate('/select-candidate')}
              className="w-full h-[60px] bg-[#e3e8f1] hover:bg-[#cfd6e2] text-[#111827] rounded-xl flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-4 focus:ring-gray-200">
              <span className="font-mono text-[17px] font-bold mt-0.5">[ * ]</span>
              <span className="font-extrabold text-[16px] tracking-wide">RETURN</span>
            </button>
            <span className="text-[10px] text-slate-400 font-bold tracking-[0.05em] mt-3 uppercase">Press star to go back</span>
          </div>
        </div>
      </main>
    </div>
  );
}
