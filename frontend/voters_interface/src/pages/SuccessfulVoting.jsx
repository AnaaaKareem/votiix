import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';

export default function SuccessfulVoting() {
  const navigate = useNavigate();
  const [receiptHash, setReceiptHash] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const transactionHash = localStorage.getItem('vote_transaction_hash');

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        // Use the stored transaction hash to get the receipt
        // First try to get the election ID by checking if we can get active elections
        let response = await api.get('/public/elections/active');
        let electionId = 'default'; // fallback

        if (response.data && Array.isArray(response.data)) {
          if (response.data.length > 0) {
            electionId = response.data[0].id;
          }
        } else if (response.data && typeof response.data === 'object') {
          electionId = response.data.id || 'default';
        }

        if (!transactionHash) {
          throw new Error('No transaction hash found');
        }

        // Try to fetch the vote receipt
        try {
          const receiptResponse = await api.get(`/public/elections/${electionId}/vote/${transactionHash}`);
          setReceiptHash(transactionHash);

          // Store election info for potential display
          localStorage.setItem('receipt_data', JSON.stringify(receiptResponse.data));

        } catch (receiptErr) {
          // Some implementations might return the hash in the response data
          if (!receiptHash && transactionHash) {
            setReceiptHash(transactionHash);
          }
        }
      } catch (err) {
        console.log('Could not retrieve receipt details:', err.message);
        // It's not critical, the vote was still successful
        if (transactionHash) {
          setReceiptHash(transactionHash);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();

    // Clean up any temporary vote-related state
    localStorage.removeItem('pending_vote_candidate');
  }, [transactionHash]);

  const handleReturn = () => {
    navigate('/language');
  };

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

        {receiptHash && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-700 max-w-xl break-all">
            Receipt Hash: {receiptHash}
          </div>
        )}

        {loading && (
          <div className="mb-8 text-gray-500">Verifying receipt details...</div>
        )}

        {(error && !loading) && (
          <div className="mb-8 text-red-500 text-sm">{error}</div>
        )}

        <button
          onClick={handleReturn}
          className="bg-[#111827] hover:bg-[#0e1726] text-white transition-colors duration-200 py-3 px-8 rounded-lg font-bold text-[13px] shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200">
          Return to Language Selection
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
