import { useNavigate } from 'react-router-dom';

export default function EnrollmentPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#FAFBFF] min-h-screen flex flex-col items-center font-sans antialiased">
      <header className="w-full h-16 bg-white border-b border-gray-100 flex items-center px-8 z-10 relative">
        <div className="flex items-center gap-2 cursor-pointer">
          <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M7 12L17 12M12 7L12 17M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Votiix</span>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-[480px] h-[400px] flex flex-col items-center justify-center relative z-10 mt-[-50px]">
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10"></div>
          
          <div className="relative flex items-center justify-center mb-10 mt-4">
            <div className="absolute w-44 h-44 rounded-full border border-blue-100 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            <div className="absolute w-36 h-36 rounded-full border border-blue-200 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute w-28 h-28 rounded-full border-2 border-blue-500 bg-white z-10 flex items-center justify-center shadow-sm">
              <img src="/images/286941-200.png" alt="Real Fingerprint" className="w-16 h-16 object-contain" style={{ filter: 'invert(48%) sepia(84%) saturate(2891%) hue-rotate(202deg) brightness(101%) contrast(97%)' }} />
            </div>
          </div>

          <div className="mt-8 mb-10 z-10">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider uppercase border border-blue-100">
              Waiting for scan
            </span>
          </div>

          <input type="text" placeholder="enter national ID"
            className="w-[260px] mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all z-10" />

          <button onClick={() => navigate('/language')}
            className="bg-[#1A1528] hover:bg-[#2A2342] text-white font-medium text-sm py-3 px-10 rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] w-[260px] z-10">
            Enroll Fingerprint
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-8 text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <span className="text-xs font-medium tracking-wide">End-to-end encrypted biometric tunnel active</span>
        </div>
      </main>
    </div>
  );
}
