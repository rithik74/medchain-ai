import { useState, useEffect } from 'react';
import { getRiskLogs } from '../services/api';

const LEVEL_STYLES = {
  CRITICAL: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', badge: 'bg-red-600' },
  HIGH: { bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-400', badge: 'bg-orange-600' },
  MEDIUM: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', text: 'text-yellow-400', badge: 'bg-yellow-600' },
  LOW: { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-400', badge: 'bg-green-600' },
};

export default function RiskHistory({ patientId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    getRiskLogs(patientId)
      .then(res => setLogs(res.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (!patientId) return null;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-lg">🛡️</span> Risk Assessment History
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">{logs.length}</span>
        </h3>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500 text-center py-4">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6">No risk assessments yet</p>
      ) : (
        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
          {logs.map((log, i) => {
            const style = LEVEL_STYLES[log.risk_level] || LEVEL_STYLES.LOW;
            const isOpen = expanded === i;

            return (
              <div key={log.id || i}
                className={`rounded-xl border transition-all cursor-pointer ${style.bg} ${style.border} ${isOpen ? 'p-4' : 'p-3'}`}
                onClick={() => setExpanded(isOpen ? null : i)}>

                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white ${style.badge}`}>
                      {log.risk_level}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div className="mt-3 space-y-2">
                    {/* Reason */}
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Reason</p>
                      <p className={`text-xs ${style.text}`}>{log.reason || 'No details available'}</p>
                    </div>

                    {/* Recommended Action */}
                    {log.recommended_action && (
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Action</p>
                        <p className="text-xs text-slate-300">{log.recommended_action}</p>
                      </div>
                    )}

                    {/* Flagged Vitals */}
                    {log.vitals_flagged && log.vitals_flagged.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {log.vitals_flagged.map((v, j) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/30">
                            {v}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* TX Hash if on blockchain */}
                    {log.tx_hash && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-[10px] text-slate-500 font-mono">
                          On-chain: {log.tx_hash.slice(0, 12)}...{log.tx_hash.slice(-6)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
