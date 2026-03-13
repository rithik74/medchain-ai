import { useState } from 'react';
import api from '../services/api';

export default function BlockchainVerify() {
  const [hash, setHash] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [records, setRecords] = useState([]);

  async function handleVerify(e) {
    e.preventDefault();
    if (!hash.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/blockchain/verify/${hash.trim()}`);
      setResult({ verified: true, data: res.data.data });
    } catch (err) {
      setResult({ verified: false, message: err.response?.data?.message || 'Verification failed' });
    } finally {
      setLoading(false);
    }
  }

  async function loadRecords() {
    if (!patientId.trim()) return;
    try {
      const res = await api.get(`/risk/logs/${patientId}`);
      setRecords((res.data.data || []).filter(r => r.tx_hash));
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">🔗 Blockchain Verification</h2>

      {/* Verify by Hash */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <span className="text-lg">🔍</span> Verify Record
        </h3>
        <p className="text-xs text-slate-400 mb-4">Enter a transaction hash to verify the integrity of a health record on the blockchain.</p>

        <form onSubmit={handleVerify} className="flex gap-3">
          <input value={hash} onChange={e => setHash(e.target.value)} placeholder="0x..."
            className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all font-mono" />
          <button type="submit" disabled={loading || !hash.trim()}
            className="px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-40 transition-all">
            {loading ? '⏳' : '🔍 Verify'}
          </button>
        </form>

        {result && (
          <div className={`mt-4 p-4 rounded-xl border ${result.verified
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-red-500/10 border-red-500/30'}`}>
            {result.verified ? (
              <div>
                <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">✅ Record Verified on Blockchain</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-slate-500">Status</span>
                    <p className="text-white font-mono mt-0.5">Immutable & Tamper-Proof</p>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-slate-500">Network</span>
                    <p className="text-white font-mono mt-0.5">Polygon Amoy</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-400">❌ {result.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Browse On-Chain Records */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <span className="text-lg">📋</span> On-Chain Records
        </h3>
        <div className="flex gap-3 mb-4">
          <input value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="Enter Patient ID (e.g. P-1001)"
            className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all" />
          <button onClick={loadRecords}
            className="px-4 py-3 rounded-xl text-sm bg-slate-700 text-white hover:bg-slate-600 transition-all">
            Load
          </button>
        </div>

        {records.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {records.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleString()}</p>
                  <p className="text-sm text-white font-medium mt-0.5">{r.risk_level} Risk</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-mono">{r.tx_hash?.slice(0, 10)}...{r.tx_hash?.slice(-6)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[10px] text-green-400">On-Chain</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">No on-chain records found</p>
        )}
      </div>
    </div>
  );
}
