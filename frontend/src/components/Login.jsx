import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login, loginWith2FA } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (require2FA) {
        await loginWith2FA(tempToken, totpToken);
        navigate('/');
      } else {
        const res = await login(email, password);
        if (res?.require2FA) {
          setRequire2FA(true);
          setTempToken(res.tempToken);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-blue-500/30">
            🏥
          </div>
          <h1 className="text-3xl font-bold gradient-text">MedChain AI</h1>
          <p className="text-slate-400 text-sm mt-1">AI-Powered Healthcare Monitoring</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          <h2 className="text-xl font-bold text-white text-center">Welcome Back</h2>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {require2FA ? (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-yellow-400 text-center mb-4">2-Factor Authentication Required</p>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider text-center">Enter 6-digit Code</label>
                <input
                  type="text" value={totpToken} onChange={e => setTotpToken(e.target.value)} required
                  placeholder="000000" maxLength={6}
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>
              <button type="button" onClick={() => setRequire2FA(false)} className="text-xs text-slate-400 hover:text-white block mx-auto mt-2">← Back to login</button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="doctor@medchain.ai"
                  className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-300 disabled:opacity-50">
            {loading ? '⏳ Verifying...' : require2FA ? '🔓 Verify Code' : '🔒 Sign In'}
          </button>

          {!require2FA && (
            <p className="text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">Create one</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
