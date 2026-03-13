import { useState, useEffect } from 'react';
import PatientCard from './PatientCard';
import VitalsInput from './VitalsInput';
import RiskAlert from './RiskAlert';
import BlockchainStatus from './BlockchainStatus';
import VitalsChart from './VitalsChart';
import VitalsLog from './VitalsLog';
import RiskHistory from './RiskHistory';
import SubmitVitalsGraph from './SubmitVitalsGraph';
import { useAuth } from './AuthContext';
import api, { fetchPatients, createPatient, submitVitals, analyzeRisk, storeOnBlockchain, sendEmailAlert, downloadReport } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [lastVitals, setLastVitals] = useState(null);
  const [txData, setTxData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bcLoading, setBcLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ patient_id: '', name: '', email: '', age: '', medical_history: '' });

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      let list = [];

      if (isPatient && user.patient_id) {
        // Patient: only show their own record
        const res = await fetchPatients();
        list = (res.data || []).filter(p => p.patient_id === user.patient_id);
        if (list.length > 0 && !selectedPatient) {
          setSelectedPatient(list[0]);
        }
      } else if (user?.role === 'doctor') {
        // Doctor: only show assigned patients
        try {
          const res = await api.get('/assignments/my-patients');
          list = res.data.data || [];
        } catch {
          // Fallback to all patients if assignments not working
          const res = await fetchPatients();
          list = res.data || [];
        }
      } else {
        // Admin or fallback: show all
        const res = await fetchPatients();
        list = res.data || [];
      }

      setPatients(list);
    } catch (err) {
      console.error('Failed to load patients:', err);
    }
  }

  async function handleAddPatient(e) {
    e.preventDefault();
    try {
      await createPatient({ ...newPatient, age: newPatient.age ? parseInt(newPatient.age) : undefined });
      setNewPatient({ patient_id: '', name: '', email: '', age: '', medical_history: '' });
      setShowAddPatient(false);
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient');
    }
  }

  async function handleAnalyze(vitalsData) {
    setLoading(true);
    setError(null);
    setRiskResult(null);
    setTxData(null);
    setLastVitals(vitalsData);
    try {
      // Step 1: Save vitals to database first
      await submitVitals(vitalsData);

      // Step 2: Then analyze risk
      const res = await analyzeRisk(vitalsData);
      setRiskResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Risk analysis failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleBlockchainStore() {
    if (!lastVitals || !riskResult) return;
    setBcLoading(true);
    try {
      const res = await storeOnBlockchain({
        patient_id: lastVitals.patient_id,
        vitals_data: lastVitals,
        risk_log_id: riskResult.log_id,
      });
      setTxData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Blockchain storage failed');
    } finally {
      setBcLoading(false);
    }
  }

  const inputClass = 'w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Panel — Patient List */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            {isPatient ? 'My Profile' : 'Patients'}
          </h2>
          {!isPatient && (
            <button onClick={() => setShowAddPatient(!showAddPatient)}
              className="text-xs px-3 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-all">
              + Add
            </button>
          )}
        </div>

        {showAddPatient && (
          <form onSubmit={handleAddPatient} className="glass-card p-4 space-y-2">
            <input placeholder="Patient ID (e.g. P-1006)" value={newPatient.patient_id} onChange={e => setNewPatient({...newPatient, patient_id: e.target.value})} required className={inputClass} />
            <input placeholder="Full Name" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} required className={inputClass} />
            <input placeholder="Email (optional)" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} className={inputClass} />
            <input type="number" placeholder="Age" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} className={inputClass} />
            <input placeholder="Medical History" value={newPatient.medical_history} onChange={e => setNewPatient({...newPatient, medical_history: e.target.value})} className={inputClass} />
            <button type="submit" className="w-full py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all">Save Patient</button>
          </form>
        )}

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {patients.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No patients found.<br/>Add one or start the backend.</p>
          ) : patients.map((p) => (
            <PatientCard
              key={p.patient_id}
              patient={p}
              isSelected={selectedPatient?.patient_id === p.patient_id}
              onClick={setSelectedPatient}
            />
          ))}
        </div>
      </div>

      {/* Center Panel — Vitals Input + Risk Result */}
      <div className="lg:col-span-5 space-y-4">
        <VitalsInput
          selectedPatient={selectedPatient}
          onSubmit={handleAnalyze}
          loading={loading}
        />

        {/* Graph showing submitted vitals in 4 colors */}
        {selectedPatient && <SubmitVitalsGraph patientId={selectedPatient.patient_id} newVitals={lastVitals} />}

        {error && (
          <div className="glass-card p-4 border border-red-500/30 bg-red-500/10">
            <p className="text-sm text-red-300">❌ {error}</p>
          </div>
        )}

        {riskResult && <RiskAlert assessment={riskResult} />}

        {/* Send Email Alert Button */}
        {riskResult && lastVitals && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <span className="text-lg">📧</span> Email Alert
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Send this risk assessment to the configured doctor email.
            </p>
            <button
              id="send-email-alert-btn"
              onClick={async () => {
                setEmailLoading(true);
                setEmailStatus(null);
                try {
                  const res = await sendEmailAlert({
                    patient_id: lastVitals.patient_id,
                    vitals: lastVitals,
                    riskAssessment: riskResult,
                  });
                  setEmailStatus({ success: true, message: res.message || 'Email sent!' });
                } catch (err) {
                  setEmailStatus({ success: false, message: err.response?.data?.message || 'Failed to send email' });
                } finally {
                  setEmailLoading(false);
                }
              }}
              disabled={emailLoading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading ? (
                <><span className="animate-spin">⏳</span> Sending...</>
              ) : (
                <><span>📧</span> Send Email Alert</>
              )}
            </button>
            {emailStatus && (
              <div className={`mt-3 p-3 rounded-lg text-xs font-medium ${
                emailStatus.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}>
                {emailStatus.success ? '✅' : '❌'} {emailStatus.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Panel — Doctor: Charts + Log + Risk | Patient: Risk only */}
      <div className="lg:col-span-4 space-y-4">
        {/* Doctor-only: Multi-line graph per patient */}
        {!isPatient && selectedPatient && (
          <VitalsChart patientId={selectedPatient.patient_id} patientName={selectedPatient.name} />
        )}

        {/* Doctor-only: Vitals Log with delete */}
        {!isPatient && selectedPatient && (
          <VitalsLog patientId={selectedPatient.patient_id} />
        )}

        {/* Risk Assessment History — visible to both */}
        {selectedPatient && <RiskHistory patientId={selectedPatient.patient_id} />}

        {riskResult && (
          <BlockchainStatus
            txData={txData}
            loading={bcLoading}
            onStore={handleBlockchainStore}
          />
        )}

        {/* Download PDF Report */}
        {selectedPatient && (
          <button onClick={() => downloadReport(selectedPatient.patient_id)}
            className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            📄 Download PDF Report
          </button>
        )}

        {/* Vitals Summary Card */}
        {lastVitals && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <span className="text-lg">📊</span> Last Submitted Vitals
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Heart Rate', value: `${lastVitals.heart_rate} bpm`, icon: '❤️' },
                { label: 'SpO2', value: `${lastVitals.spo2}%`, icon: '🫁' },
                { label: 'Temperature', value: `${lastVitals.temperature}°C`, icon: '🌡️' },
                ...(lastVitals.blood_pressure_systolic ? [{ label: 'Blood Pressure', value: `${lastVitals.blood_pressure_systolic}/${lastVitals.blood_pressure_diastolic || '—'}`, icon: '🩸' }] : []),
              ].map((item) => (
                <div key={item.label} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
                  <p className="text-xs text-slate-500 flex items-center gap-1">{item.icon} {item.label}</p>
                  <p className="text-lg font-bold text-white mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions when no data */}
        {!riskResult && !lastVitals && (
          <div className="glass-card p-6 text-center">
            <div className="text-4xl mb-3">🩺</div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Getting Started</h3>
            <ol className="text-xs text-slate-400 space-y-1 text-left list-decimal list-inside">
              <li>Select a patient from the left panel</li>
              <li>Enter vital signs or use a demo scenario</li>
              <li>Click "Analyze Risk" for AI assessment</li>
              <li>Store critical records on blockchain</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
