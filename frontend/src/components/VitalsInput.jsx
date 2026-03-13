import { useState } from 'react';

export default function VitalsInput({ selectedPatient, onSubmit, loading }) {
  const [vitals, setVitals] = useState({
    heart_rate: '',
    spo2: '',
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
  });

  const handleChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const data = {
      patient_id: selectedPatient.patient_id,
      heart_rate: parseFloat(vitals.heart_rate),
      spo2: parseFloat(vitals.spo2),
      temperature: parseFloat(vitals.temperature),
    };
    if (vitals.blood_pressure_systolic) data.blood_pressure_systolic = parseFloat(vitals.blood_pressure_systolic);
    if (vitals.blood_pressure_diastolic) data.blood_pressure_diastolic = parseFloat(vitals.blood_pressure_diastolic);
    onSubmit(data);
  };

  const loadScenario = (scenario) => {
    const scenarios = {
      normal: { heart_rate: '72', spo2: '98', temperature: '36.8', blood_pressure_systolic: '120', blood_pressure_diastolic: '80' },
      medium: { heart_rate: '105', spo2: '91', temperature: '38.1', blood_pressure_systolic: '145', blood_pressure_diastolic: '90' },
      high: { heart_rate: '125', spo2: '87', temperature: '39.2', blood_pressure_systolic: '165', blood_pressure_diastolic: '100' },
      critical: { heart_rate: '145', spo2: '82', temperature: '40.5', blood_pressure_systolic: '190', blood_pressure_diastolic: '120' },
    };
    setVitals(scenarios[scenario]);
  };

  const inputClass = 'w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all';

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className="text-lg">💉</span> Submit Vitals
        {selectedPatient && (
          <span className="text-xs text-slate-400 font-normal">— {selectedPatient.name}</span>
        )}
      </h3>

      {/* Quick scenario buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'normal', label: 'Normal', color: 'emerald' },
          { key: 'medium', label: 'Medium Risk', color: 'yellow' },
          { key: 'high', label: 'High Risk', color: 'orange' },
          { key: 'critical', label: 'Critical', color: 'red' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => loadScenario(s.key)}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all hover:scale-105 active:scale-95
              border-${s.color}-500/30 text-${s.color}-400 hover:bg-${s.color}-500/10`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Heart Rate (bpm)</label>
            <input type="number" name="heart_rate" value={vitals.heart_rate} onChange={handleChange}
              placeholder="60-100" required min="0" max="300" step="1" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">SpO2 (%)</label>
            <input type="number" name="spo2" value={vitals.spo2} onChange={handleChange}
              placeholder="95-100" required min="0" max="100" step="1" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Temperature (°C)</label>
            <input type="number" name="temperature" value={vitals.temperature} onChange={handleChange}
              placeholder="36.0-37.5" required min="25" max="45" step="0.1" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Systolic BP (mmHg)</label>
            <input type="number" name="blood_pressure_systolic" value={vitals.blood_pressure_systolic} onChange={handleChange}
              placeholder="Optional" min="40" max="300" step="1" className={inputClass} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!selectedPatient || loading || !vitals.heart_rate || !vitals.spo2 || !vitals.temperature}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white
            hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-300
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Analyzing...
            </span>
          ) : '🔬 Analyze Risk'}
        </button>
      </form>
    </div>
  );
}
