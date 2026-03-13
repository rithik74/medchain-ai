import { useState, useEffect } from 'react';
import api, { getVitals } from '../services/api';
import { useAuth } from './AuthContext';

export default function VitalsLog({ patientId, refreshKey }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    loadRecords();
  }, [patientId, refreshKey]);

  async function loadRecords() {
    setLoading(true);
    try {
      const res = await getVitals(patientId);
      setRecords(res.data || []);
    } catch {} finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this vitals record?')) return;
    try {
      await api.delete(`/vitals/${id}`);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  }

  if (!patientId) return null;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-lg">📋</span> Vitals Log
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">{records.length}</span>
        </h3>
        <button onClick={loadRecords} className="text-xs text-slate-400 hover:text-white transition-all">🔄</button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500 text-center py-4">Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6">No vitals recorded yet</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {records.map((v, i) => (
            <div key={v.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/20 hover:border-slate-600/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-700/40 px-2 py-0.5 rounded-full">
                  #{records.length - i}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">
                    {new Date(v.timestamp).toLocaleString()}
                  </span>
                  {isDoctor && (
                    <button onClick={() => handleDelete(v.id)}
                      className="text-[10px] px-1.5 py-0.5 rounded text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete record">
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">❤️</span>
                  <span className="text-xs text-slate-300"><strong className="text-red-400">{v.heart_rate}</strong> bpm</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🫁</span>
                  <span className="text-xs text-slate-300"><strong className="text-blue-400">{v.spo2}</strong>%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🌡️</span>
                  <span className="text-xs text-slate-300"><strong className="text-amber-400">{v.temperature}</strong>°C</span>
                </div>
                {v.blood_pressure_systolic && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🩸</span>
                    <span className="text-xs text-slate-300"><strong className="text-purple-400">{v.blood_pressure_systolic}/{v.blood_pressure_diastolic || '—'}</strong> mmHg</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
