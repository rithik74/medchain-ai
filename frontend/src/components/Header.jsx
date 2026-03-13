import { useState } from 'react';
import { useAuth } from './AuthContext';
import TwoFactorSetup from './TwoFactorSetup';

export default function Header({ walletAddress, onConnectWallet }) {
  const { user, logout } = useAuth();
  const [show2FA, setShow2FA] = useState(false);

  return (
    <header className="glass-card px-6 py-4 flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
          🏥
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-text">MedChain AI</h1>
          <p className="text-xs text-slate-400">AI-Powered Healthcare Monitoring</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-300">System Online</span>
        </div>

        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <span className="text-xs text-slate-300">{user.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
              user.role === 'doctor' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>{user.role}</span>
          </div>
        )}

        <button onClick={onConnectWallet}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            walletAddress
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-95'
          }`}>
          {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '🔗 Wallet'}
        </button>

        {user && (
          <>
            <button onClick={() => setShow2FA(true)}
              className="hidden sm:inline-block px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all">
              🔐 2FA Setup
            </button>
            <button onClick={logout}
              className="px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all">
              🚪 Logout
            </button>
          </>
        )}
      </div>

      {show2FA && <TwoFactorSetup onClose={() => setShow2FA(false)} onVerified={() => {
        setShow2FA(false);
        alert('2FA successfully enabled!');
      }} />}
    </header>
  );
}
