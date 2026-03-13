import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getAppointments, requestAppointment, approveAppointment, cancelAppointment } from '../services/api';
import api from '../services/api';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await getAppointments();
      setAppointments(res.data);

      if (user.role === 'patient') {
        const docRes = await api.get('/assignments/my-doctors');
        setDoctors(docRes.data.data);
      }
    } catch (err) { }
    finally { setLoading(false); }
  }

  async function handleBook(e) {
    e.preventDefault();
    try {
      const dateTime = new Date(`${date}T${time}`).toISOString();
      await requestAppointment({ doctor_id: selectedDoctor, date_time: dateTime, notes });
      setShowForm(false);
      fetchData();
      alert('Appointment requested successfully!');
    } catch (err) { 
      const msg = err.response?.data?.message || 'Failed to book appointment';
      alert(msg); 
    }
  }

  async function handleAction(id, action) {
    try {
      if (action === 'approve') await approveAppointment(id);
      if (action === 'cancel') await cancelAppointment(id);
      fetchData();
    } catch (err) { alert(`Failed to ${action} appointment`); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Appointments</h2>
        {user.role === 'patient' && !showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 text-white rounded-xl text-sm font-medium transition-all">
            + Book Appointment
          </button>
        )}
      </div>

      {showForm && user.role === 'patient' && (
        <form onSubmit={handleBook} className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Book New Appointment</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Select Doctor</label>
              <select required value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30">
                <option value="">-- Choose Assigned Doctor --</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Date</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Time</label>
              <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Reason / Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white h-24 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30" placeholder="Briefly describe your symptoms or reason for visit..."></textarea>
            </div>
          </div>
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium mt-2 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all">Submit Request</button>
        </form>
      )}

      {loading ? (
        <div className="text-center text-slate-400 py-12">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed border-2 border-slate-700/50">
          <div className="text-4xl mb-4 opacity-50">📅</div>
          <h3 className="text-lg font-medium text-slate-300">No Appointments</h3>
          <p className="text-sm text-slate-500 mt-1">You do not have any appointments scheduled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {appointments.map(apt => (
            <div key={apt.id} className="glass-card p-5 relative overflow-hidden group hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                    {user.role === 'patient' ? '👨‍⚕️' : '👤'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {user.role === 'patient' ? `Dr. ${apt.Doctor?.name}` : `Patient: ${apt.Patient?.name}`}
                    </h3>
                    <p className="text-xs text-blue-400 font-medium">{new Date(apt.date_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  apt.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  apt.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {apt.status}
                </span>
              </div>
              
              {apt.notes && (
                <div className="bg-slate-800/40 p-3 rounded-lg text-sm text-slate-300 mb-4 border border-slate-700/50">
                  <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">Notes:</span>
                  {apt.notes}
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
                {user.role === 'doctor' && apt.status === 'pending' && (
                  <button onClick={() => handleAction(apt.id, 'approve')} className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-sm font-medium transition-colors border border-emerald-500/30">
                    Approve
                  </button>
                )}
                
                {apt.status === 'pending' && (
                  <button onClick={() => handleAction(apt.id, 'cancel')} className="flex-1 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors border border-red-500/30">
                    Cancel Request
                  </button>
                )}

                {apt.status === 'approved' && apt.meeting_link && (
                  <a href={`/video-consultation/${apt.id}`} className="flex-1 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium text-center transition-colors border border-blue-500/30">
                    📹 Join Video Consult
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
