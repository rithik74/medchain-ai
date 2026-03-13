import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const RISK_COLORS = { LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444' };

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-slate-400 py-12">Loading analytics...</div>;
  if (!stats) return <div className="text-center text-slate-400 py-12">Unable to load analytics</div>;

  const statCards = [
    { label: 'Total Patients', value: stats.totalPatients, icon: '👥', color: 'from-blue-600 to-cyan-600' },
    { label: 'Doctors', value: stats.totalDoctors, icon: '👨‍⚕️', color: 'from-emerald-600 to-teal-600' },
    { label: 'Alerts Today', value: stats.alertsToday, icon: '⚠️', color: 'from-orange-600 to-amber-600' },
    { label: 'Active Emergencies', value: stats.activeEmergencies, icon: '🚨', color: 'from-red-600 to-rose-600' },
    { label: 'Total Vitals', value: stats.totalVitalsRecorded, icon: '📊', color: 'from-purple-600 to-violet-600' },
  ];

  const pieData = (stats.riskDistribution || []).map(r => ({ name: r.risk_level, value: parseInt(r.count) }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">📈 Analytics Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="glass-card p-4 hover:scale-[1.03] transition-transform">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3 shadow-lg`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Risk Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-500">No risk data yet</div>
          )}
        </div>

        {/* Weekly Alert Trend */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Weekly Alert Trend</h3>
          {stats.weeklyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#334155' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
                <Bar dataKey="alerts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-500">No trend data yet</div>
          )}
        </div>
      </div>

      {/* Recent Critical Events */}
      {stats.recentCritical?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Recent High-Risk Events</h3>
          <div className="space-y-2">
            {stats.recentCritical.map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold text-white`}
                  style={{ background: RISK_COLORS[log.risk_level] }}>
                  {log.risk_level}
                </span>
                <span className="text-sm text-white font-medium">{log.Patient?.name || log.patient_id}</span>
                <span className="text-xs text-slate-400 ml-auto">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
