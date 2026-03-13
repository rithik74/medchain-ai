import { useState, useEffect } from 'react';
import api from '../services/api';

export default function MyDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMyDoctors(); }, []);

  async function loadMyDoctors() {
    try {
      const res = await api.get('/assignments/my-doctors');
      setDoctors(res.data.data || []);
    } catch {} finally { setLoading(false); }
  }

  async function loadAvailableDoctors() {
    try {
      const res = await api.get('/assignments/available-doctors');
      setAvailableDoctors(res.data.data || []);
      setShowPicker(true);
    } catch {}
  }

  async function assignDoctor(doctorId) {
    try {
      await api.post('/assignments/assign', { doctor_id: doctorId });
      setShowPicker(false);
      loadMyDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign doctor');
    }
  }

  async function unassignDoctor(doctorId) {
    try {
      await api.delete(`/assignments/unassign/${doctorId}`);
      loadMyDoctors();
    } catch {}
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-lg">👨‍⚕️</span> My Doctors
        </h3>
        <button onClick={loadAvailableDoctors}
          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all">
          + Add Doctor
        </button>
      </div>

      {/* Assigned Doctors */}
      {loading ? (
        <p className="text-xs text-slate-500 text-center py-4">Loading...</p>
      ) : doctors.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">👨‍⚕️</div>
          <p className="text-sm text-slate-400">No doctors assigned yet</p>
          <p className="text-xs text-slate-500 mt-1">Click "+ Add Doctor" to assign a doctor to your care</p>
        </div>
      ) : (
        <div className="space-y-2">
          {doctors.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm text-white font-bold shadow-lg shadow-emerald-500/20">
                  {doc.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{doc.name}</p>
                  <p className="text-xs text-slate-400">{doc.email}</p>
                </div>
              </div>
              <button onClick={() => unassignDoctor(doc.id)}
                className="text-xs px-2.5 py-1 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPicker(false)}>
          <div className="glass-card p-6 w-full max-w-md border border-slate-600/30" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Select a Doctor</h3>
              <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableDoctors.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No doctors available yet</p>
              ) : availableDoctors.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm text-white font-bold">
                      {doc.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.email}</p>
                    </div>
                  </div>
                  {doc.isAssigned ? (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Assigned ✓</span>
                  ) : (
                    <button onClick={() => assignDoctor(doc.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-all">
                      Assign
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
