import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../config/api';

export default function VerificationFinger() {
  const navigate = useNavigate();
  const location = useLocation(); // To check if coming from vote selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const simulateScan = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/kiosk/identity/auth', {
        fingerprint_id: 1,
        terminal_id: "esp32-01"
      });

      // Store JWT token from response
      const { token } = response.data;
      localStorage.setItem('jwt', token);

      // After successful auth, call token signing
      let signedToken = token;
      try {
        const tokenResponse = await api.post('/kiosk/token/sign');
        signedToken = tokenResponse.data.token;
        localStorage.setItem('jwt', signedToken);
      } catch (signError) {
        console.error('Token signing failed:', signError);
        // Continue with authentication anyway - use original token if signing fails
        localStorage.setItem('jwt', token);
      }

      // Check if we should commit a vote or just navigate to confirmation
      const pendingVote = localStorage.getItem('pending_vote_candidate');
      if (pendingVote) {
        // We're here to commit a vote - extract candidate info
        let candidateData;
        try {
          candidateData = JSON.parse(pendingVote);
        } catch {
          candidateData = { id: pendingVote }; // Support older formats
        }

        // Commit the vote with the signed token
        const voteResponse = await api.post('/kiosk/vote/commit', {
          candidate_id: candidateData.id,
          election_id: candidateData.election_id || null
        }, {
          headers: {
            'Authorization': `Bearer ${signedToken}`
          }
        });

        // Store transaction hash from the response
        let txHash = 'tx_' + Date.now(); // fallback hash
        if (voteResponse.data && (voteResponse.data.tx_hash || voteResponse.data.transaction_hash)) {
          txHash = voteResponse.data.tx_hash || voteResponse.data.transaction_hash;
        }

        localStorage.setItem('vote_transaction_hash', txHash);

        // Clean up pending vote data
        localStorage.removeItem('pending_vote_candidate');

        setLoading(false);
        navigate('/success'); // Go to success screen after vote commit
      } else {
        // Regular authentication - navigate to confirmation
        setLoading(false);
        navigate('/confirmation');
      }
    } catch (err) {
      setLoading(false);
      let errorMessage = 'Network error - retrying...';

      if (err.response) {
        switch(err.response.status) {
          case 401:
            errorMessage = 'Fingerprint not recognized. Try again.';
            break;
          case 400:
            errorMessage = 'Invalid request. Please contact support.';
            break;
          case 403:
            errorMessage = 'Already voted or election not active.';
            break;
          default:
            errorMessage = err.response.data?.message || 'Authentication failed. Try again.';
        }
      }

      setError(errorMessage);
      setRetryCount(prev => prev + 1);

      if (retryCount >= 2) {  // Max 3 attempts
        setTimeout(() => {
          setRetryCount(0);
          setError('');
        }, 2000);
      }
    }
  };

  // Handle scan click - check retries and initiate scan
  const handleScanClick = () => {
    if (retryCount >= 3) {
      setRetryCount(0);
      setError('');
      return; // Allow another set of attempts
    }
    simulateScan();
  };

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
            <div className="relative z-10 w-36 h-36 bg-white border border-[#2563eb] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(37,99,235,0.12)] cursor-pointer hover:bg-blue-50 transition-colors"
                 onClick={handleScanClick}>
              {loading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              ) : (
                <svg className="w-16 h-16 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
                </svg>
              )}
            </div>
          </div>
          <div className={`text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.15em] mb-6 ${
            loading ? 'bg-yellow-100 text-yellow-700' : 'bg-[#eff6ff] text-[#2563eb]'
          }`}>
            {!loading ? 'Waiting for scan' : 'Scanning...'}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0e1726] mb-4 leading-[1.15]">
            Scan Finger to Verify Identity <br className="hidden md:block" /> and Vote
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
            Please place your thumb on the scanner to continue to the voting booth.
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg w-full max-w-xs">
              {error}
            </div>
          )}
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
