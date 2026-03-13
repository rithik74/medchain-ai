import { useState, useEffect } from 'react';
import { setup2FA, verify2FA } from '../services/api';

export default function TwoFactorSetup({ onClose, onVerified }) {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function fetchSetup() {
      try {
        const res = await setup2FA();
        setQrCode(res.data.qr_code);
        setSecret(res.data.secret);
      } catch (err) {
        setError('Failed to setup 2FA. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchSetup();
  }, []);

  async function handleVerify(e) {
    e.preventDefault();
    setVerifying(true);
    setError('');
    try {
      await verify2FA({ token });
      if (onVerified) onVerified();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Try again.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Setup 2-Factor Auth</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading QR code...</div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-300">1. Scan this QR code with your Authenticator App (Google Authenticator, Authy, etc).</p>
                <div className="mx-auto bg-white p-2 rounded-xl inline-block">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
                <p className="text-xs text-slate-400 mt-2">Manual entry key: <code className="font-mono text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded">{secret}</code></p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4 pt-4 border-t border-slate-800">
                <p className="text-sm text-slate-300">2. Enter the 6-digit code from your app to verify.</p>
                {error && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
                    {error}
                  </div>
                )}
                <div>
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                    required
                  />
                </div>
                <button type="submit" disabled={verifying || token.length !== 6}
                  className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg disabled:opacity-50">
                  {verifying ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
