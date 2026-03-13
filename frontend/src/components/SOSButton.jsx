import { useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export default function SOSButton({ patientId }) {
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);

  async function handleSOS() {
    setLoading(true);
    try {
      await api.post('/emergency/sos', {
        patient_id: patientId || user?.patient_id,
        notes: 'Emergency SOS triggered by patient',
      });
      setTriggered(true);
      setShowConfirm(false);
      setTimeout(() => setTriggered(false), 10000);
    } catch (err) {
      console.error('SOS failed:', err);
    } finally {
      setLoading(false);
    }
  }

  // Triggered state — full-screen overlay
  if (triggered) {
    return (
      <div className="fixed inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4 animate-bounce">🚨</div>
          <h3 className="text-2xl font-bold text-white mb-2">Emergency Alert Sent!</h3>
          <p className="text-red-200">Your doctor has been notified. Stay calm.</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span className="text-sm text-red-300">Broadcasting emergency signal...</span>
          </div>
          <button onClick={() => setTriggered(false)}
            className="mt-6 px-6 py-2 rounded-xl text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all">
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  // Confirmation modal
  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowConfirm(false)}>
        <div className="glass-card p-6 w-80 border border-red-500/30 text-center" onClick={e => e.stopPropagation()}>
          <div className="text-4xl mb-3">🚨</div>
          <h3 className="text-lg font-bold text-white mb-2">Emergency SOS</h3>
          <p className="text-sm text-slate-300 mb-4">This will immediately alert your doctor. Are you sure?</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShowConfirm(false)}
              className="py-2.5 rounded-xl text-sm font-medium border border-slate-600/50 text-slate-300 hover:bg-slate-800/50 transition-all">
              Cancel
            </button>
            <button onClick={handleSOS} disabled={loading}
              className="py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-all disabled:opacity-50">
              {loading ? '⏳ Sending...' : '🚨 Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Small fixed button at bottom-left
  return (
    <button onClick={() => setShowConfirm(true)}
      className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-red-600 text-white text-xl shadow-lg shadow-red-500/40 hover:scale-110 hover:shadow-red-500/60 active:scale-95 transition-all flex items-center justify-center animate-pulse"
      title="Emergency SOS">
      🚨
    </button>
  );
}
