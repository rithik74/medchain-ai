import { useState, useRef, useEffect } from 'react';
import { submitVitals, analyzeRisk } from '../services/api';
import { useAuth } from './AuthContext';

// Realistic vital sign ranges
const BASE_VITALS = {
  heart_rate: { min: 65, max: 95, unit: 'bpm' },
  spo2: { min: 95, max: 99, unit: '%' },
  temperature: { min: 36.2, max: 37.3, unit: '°C' },
  blood_pressure_systolic: { min: 110, max: 135, unit: 'mmHg' },
};

function generateVitals(prev, scenario) {
  const jitter = (base, range) => +(base + (Math.random() - 0.5) * range).toFixed(1);

  if (scenario === 'normal') {
    return {
      heart_rate: Math.round(jitter(75, 15)),
      spo2: Math.min(99, Math.max(95, Math.round(jitter(97, 3)))),
      temperature: +jitter(36.6, 0.6).toFixed(1),
      blood_pressure_systolic: Math.round(jitter(120, 15)),
      blood_pressure_diastolic: Math.round(jitter(80, 10)),
    };
  }
  if (scenario === 'stress') {
    return {
      heart_rate: Math.round(jitter(110, 20)),
      spo2: Math.min(99, Math.max(90, Math.round(jitter(94, 4)))),
      temperature: +jitter(37.5, 0.5).toFixed(1),
      blood_pressure_systolic: Math.round(jitter(145, 15)),
      blood_pressure_diastolic: Math.round(jitter(95, 10)),
    };
  }
  if (scenario === 'critical') {
    return {
      heart_rate: Math.round(jitter(140, 25)),
      spo2: Math.min(95, Math.max(82, Math.round(jitter(87, 5)))),
      temperature: +jitter(39.2, 0.8).toFixed(1),
      blood_pressure_systolic: Math.round(jitter(170, 20)),
      blood_pressure_diastolic: Math.round(jitter(105, 10)),
    };
  }
  // Drift from previous — realistic variation
  if (prev) {
    return {
      heart_rate: Math.round(Math.max(55, Math.min(130, prev.heart_rate + (Math.random() - 0.5) * 8))),
      spo2: Math.min(100, Math.max(88, Math.round(prev.spo2 + (Math.random() - 0.5) * 2))),
      temperature: +Math.max(35.5, Math.min(40, prev.temperature + (Math.random() - 0.5) * 0.3)).toFixed(1),
      blood_pressure_systolic: Math.round(Math.max(90, Math.min(180, prev.blood_pressure_systolic + (Math.random() - 0.5) * 10))),
      blood_pressure_diastolic: Math.round(Math.max(60, Math.min(120, (prev.blood_pressure_diastolic || 80) + (Math.random() - 0.5) * 6))),
    };
  }
  return generateVitals(null, 'normal');
}

export default function DeviceMode({ patientId }) {
  const { user } = useAuth();
  const [active, setActive] = useState(false);
  const [interval, setIntervalSec] = useState(30);
  const [scenario, setScenario] = useState('auto');
  const [logs, setLogs] = useState([]);
  const [currentVitals, setCurrentVitals] = useState(null);
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);
  const prevVitalsRef = useRef(null);

  const pid = patientId || user?.patient_id;

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  function addLog(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 30));
  }

  async function sendReading() {
    const vitals = generateVitals(prevVitalsRef.current, scenario === 'auto' ? null : scenario);
    prevVitalsRef.current = vitals;
    setCurrentVitals(vitals);

    const payload = { patient_id: pid, ...vitals };

    try {
      await submitVitals(payload);
      addLog(`HR:${vitals.heart_rate} SpO2:${vitals.spo2} T:${vitals.temperature} BP:${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`, 'data');
      setCount(c => c + 1);

      // Auto-analyze risk
      try {
        const res = await analyzeRisk(payload);
        const level = res.data?.risk_level;
        addLog(`Risk: ${level}`, level === 'CRITICAL' || level === 'HIGH' ? 'alert' : 'info');
      } catch {}
    } catch (err) {
      addLog('Failed to send: ' + (err.message || 'Error'), 'error');
    }
  }

  function startDevice() {
    if (!pid) {
      addLog('No patient ID — cannot start device', 'error');
      return;
    }
    setActive(true);
    addLog(`Device started — sending every ${interval}s`, 'info');
    addLog(`Scenario: ${scenario === 'auto' ? 'Realistic drift' : scenario}`, 'info');
    sendReading();
    timerRef.current = setInterval(sendReading, interval * 1000);
  }

  function stopDevice() {
    clearInterval(timerRef.current);
    setActive(false);
    prevVitalsRef.current = null;
    addLog('Device stopped', 'info');
  }

  const logColors = { info: 'text-slate-400', data: 'text-cyan-400', alert: 'text-red-400', error: 'text-orange-400' };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-lg">📡</span> IoT Device Mode
          {active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">● LIVE</span>}
        </h3>
        <span className="text-[10px] text-slate-500">{count} readings sent</span>
      </div>

      {/* Controls */}
      <div className="space-y-3 mb-4">
        {/* Scenario Selector */}
        <div>
          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Simulation Scenario</label>
          <div className="flex gap-2">
            {[
              { key: 'auto', label: '🔄 Auto Drift', desc: 'Realistic variation' },
              { key: 'normal', label: '💚 Normal', desc: 'Healthy values' },
              { key: 'stress', label: '💛 Stress', desc: 'Elevated values' },
              { key: 'critical', label: '❤️ Critical', desc: 'Emergency values' },
            ].map(s => (
              <button key={s.key} onClick={() => !active && setScenario(s.key)} disabled={active}
                className={`flex-1 py-2 px-2 rounded-lg text-[10px] text-center transition-all border ${scenario === s.key
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                  : 'border-slate-700/30 text-slate-500 hover:border-slate-600/50'} ${active ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="font-bold">{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Interval */}
        <div className="flex items-center gap-3">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Interval</label>
          <div className="flex gap-1">
            {[10, 30, 60].map(s => (
              <button key={s} onClick={() => !active && setIntervalSec(s)} disabled={active}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${interval === s
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/40'
                  : 'text-slate-500 border border-slate-700/30'} ${active ? 'opacity-50' : ''}`}>
                {s}s
              </button>
            ))}
          </div>
        </div>

        {/* Start/Stop */}
        <button onClick={active ? stopDevice : startDevice}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${active
            ? 'bg-red-600 hover:bg-red-500 text-white'
            : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-500/20'}`}>
          {active ? '⏹ Stop Device' : '▶ Start IoT Device'}
        </button>
      </div>

      {/* Current Vitals Display */}
      {currentVitals && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-[9px] text-red-400">❤️ HR</p>
            <p className="text-sm font-bold text-red-400">{currentVitals.heart_rate}</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <p className="text-[9px] text-blue-400">🫁 SpO2</p>
            <p className="text-sm font-bold text-blue-400">{currentVitals.spo2}%</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-[9px] text-amber-400">🌡️ Temp</p>
            <p className="text-sm font-bold text-amber-400">{currentVitals.temperature}</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
            <p className="text-[9px] text-purple-400">🩸 BP</p>
            <p className="text-sm font-bold text-purple-400">{currentVitals.blood_pressure_systolic}</p>
          </div>
        </div>
      )}

      {/* Device Console Log */}
      {logs.length > 0 && (
        <div className="rounded-xl bg-black/40 border border-slate-700/30 p-3 font-mono max-h-48 overflow-y-auto">
          <p className="text-[9px] text-slate-600 mb-2 uppercase">Device Console</p>
          {logs.map((log, i) => (
            <p key={i} className={`text-[10px] ${logColors[log.type]} leading-relaxed`}>
              <span className="text-slate-600">[{log.time}]</span> {log.msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
