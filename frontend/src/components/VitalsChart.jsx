import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getVitals } from '../services/api';

const VITALS = [
  { key: 'heart_rate', label: 'Heart Rate', unit: 'bpm', color: '#ef4444', icon: '❤️' },
  { key: 'spo2', label: 'SpO2', unit: '%', color: '#3b82f6', icon: '🫁' },
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#f59e0b', icon: '🌡️' },
  { key: 'blood_pressure_systolic', label: 'Systolic BP', unit: 'mmHg', color: '#a855f7', icon: '🩸' },
];

const REFRESH_INTERVAL = 10 * 60 * 1000;

export default function VitalsChart({ patientId, patientName }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!patientId) return;
    loadVitals();
    intervalRef.current = setInterval(loadVitals, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [patientId]);

  async function loadVitals() {
    setLoading(true);
    try {
      const res = await getVitals(patientId);
      const records = (res.data || []).reverse().map(v => ({
        time: formatTime(v.timestamp),
        fullTime: new Date(v.timestamp).toLocaleString(),
        heart_rate: v.heart_rate,
        spo2: v.spo2,
        temperature: v.temperature,
        blood_pressure_systolic: v.blood_pressure_systolic,
      }));
      setData(records);
      setLastUpdated(new Date());
    } catch { setData([]); }
    finally { setLoading(false); }
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (!patientId || data.length === 0) return null;

  const latest = data[data.length - 1];

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          📈 {patientName || patientId}
        </h3>
        <div className="flex items-center gap-2">
          {lastUpdated && <span className="text-[10px] text-slate-500">{lastUpdated.toLocaleTimeString()}</span>}
          <button onClick={loadVitals} disabled={loading} className="text-xs text-slate-400 hover:text-white transition-all">
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Latest values as badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {VITALS.map(v => latest[v.key] != null && (
          <span key={v.key} className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ backgroundColor: v.color + '18', color: v.color, border: `1px solid ${v.color}30` }}>
            {v.icon} {latest[v.key]} {v.unit}
          </span>
        ))}
      </div>

      {/* Multi-line chart — all vitals on one graph */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={{ stroke: '#475569' }}
            interval={Math.max(0, Math.floor(data.length / 5))} />
          <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={{ stroke: '#475569' }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '8px 12px', fontSize: 11 }}>
                  <p style={{ color: '#94a3b8', fontSize: 9, marginBottom: 4 }}>{d?.fullTime}</p>
                  {VITALS.map(v => d?.[v.key] != null && (
                    <p key={v.key} style={{ color: v.color, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      <span>{v.icon} {v.label}</span>
                      <strong>{d[v.key]} {v.unit}</strong>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          {VITALS.map(v => (
            <Line key={v.key} type="monotone" dataKey={v.key} stroke={v.color} strokeWidth={2.5}
              dot={{ fill: v.color, stroke: '#0f172a', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: v.color, stroke: '#fff', strokeWidth: 2 }}
              connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-3">
        {VITALS.map(v => (
          <div key={v.key} className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded-full" style={{ backgroundColor: v.color }} />
            <span className="text-[10px] text-slate-400">{v.label}</span>
          </div>
        ))}
      </div>

      <p className="text-[9px] text-slate-600 text-right mt-2">{data.length} readings • Auto-refreshes every 10 min</p>
    </div>
  );
}
