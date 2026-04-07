import { useNavigate } from 'react-router-dom';

export default function SelectLanguage() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#f8f9fc] min-h-screen flex flex-col font-sans antialiased text-[#0e2341]">
      <header className="w-full bg-white py-5 px-8 flex items-center border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#0e2341]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4">
            </path>
          </svg>
          <span className="font-bold text-lg tracking-tight">Votiix</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto -mt-8">
        <div className="flex flex-col items-center mb-10">
          <img src="/images/286941-200.png" alt="Votiix Logo" className="w-24 h-24 object-contain mb-2" style={{ mixBlendMode: 'multiply' }} />
          <h1 className="text-3xl font-bold tracking-tight">votiix</h1>
        </div>

        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Welcome. Select Language</h2>
          <h3 className="text-2xl sm:text-3xl font-bold">مرحباً. اختر اللغة</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <button onClick={() => navigate('/verify')}
            className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-200 hover:border-[#0e2341] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0e2341] focus:ring-offset-2 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="mb-4 rounded shadow-sm border border-gray-100 overflow-hidden">
              <img src="https://flagcdn.com/w80/gb.png" alt="English" className="w-14 h-10 object-cover" />
            </div>
            <h4 className="text-xl font-bold mb-1">English</h4>
            <p className="text-gray-400 text-sm mb-6">Press 1 to select</p>
            <span className="bg-gray-100 text-[#0e2341] text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              Option 1
            </span>
          </button>

          <button onClick={() => navigate('/verify')}
            className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-200 hover:border-[#0e2341] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0e2341] focus:ring-offset-2 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="mb-4 rounded shadow-sm border border-gray-100 overflow-hidden">
              <img src="https://flagcdn.com/w80/sa.png" alt="Arabic" className="w-14 h-10 object-cover" />
            </div>
            <h4 className="text-xl font-bold mb-1" dir="rtl">العربية</h4>
            <p className="text-gray-400 text-sm mb-6" dir="rtl">اضغط ٢ للاختيار</p>
            <span className="bg-gray-100 text-[#0e2341] text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              Option 2
            </span>
          </button>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-4 px-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
        <div className="flex items-center gap-2 mb-3 sm:mb-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 0 01-8.618 3.04A12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          Secure Biometric Encryption
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Certified Voting Terminal
        </div>
      </footer>
    </div>
  );
}
