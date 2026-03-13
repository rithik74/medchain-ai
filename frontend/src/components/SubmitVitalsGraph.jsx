import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getVitals } from '../services/api';

const VITALS = [
  { key: 'heart_rate', label: 'Heart Rate', unit: 'bpm', color: '#ef4444', icon: '❤️' },
  { key: 'spo2', label: 'SpO2', unit: '%', color: '#3b82f6', icon: '🫁' },
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#f59e0b', icon: '🌡️' },
  { key: 'blood_pressure_systolic', label: 'Systolic BP', unit: 'mmHg', color: '#a855f7', icon: '🩸' },
];

export default function SubmitVitalsGraph({ patientId, newVitals }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!patientId) return;
    getVitals(patientId)
      .then(res => setHistory(res.data || []))
      .catch(() => {});
  }, [patientId, newVitals]);

  if (!patientId) return null;

  const trendData = history.slice(0, 10).reverse().map((v, i) => ({
    time: new Date(v.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    heart_rate: v.heart_rate,
    spo2: v.spo2,
    temperature: v.temperature,
    blood_pressure_systolic: v.blood_pressure_systolic,
    fullTime: new Date(v.timestamp).toLocaleString(),
  }));

  if (trendData.length === 0) return null;

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span> Submitted Vitals
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {VITALS.map(v => {
          const hasData = trendData.some(d => d[v.key] != null);
          if (!hasData) return null;
          const latestVal = trendData[trendData.length - 1]?.[v.key];

          return (
            <div key={v.key} className="rounded-xl p-3" style={{ backgroundColor: v.color + '08', border: `1px solid ${v.color}20` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold" style={{ color: v.color }}>{v.icon} {v.label}</span>
                <span className="text-sm font-bold" style={{ color: v.color }}>
                  {latestVal} <span className="text-[8px] text-slate-500 font-normal">{v.unit}</span>
                </span>
              </div>
              <ResponsiveContainer width="100%" height={60}>
                <AreaChart data={trendData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`sg-${v.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={v.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={v.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <YAxis tick={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div style={{ background: '#1e293b', border: `1px solid ${v.color}40`, borderRadius: 6, padding: '4px 8px', fontSize: 10, color: v.color, fontWeight: 'bold' }}>
                          {payload[0].value} {v.unit}
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey={v.key} stroke={v.color} strokeWidth={2}
                    fill={`url(#sg-${v.key})`} dot={{ fill: v.color, r: 2 }} activeDot={{ r: 4, fill: v.color }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
