import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function VideoRoom() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch appointment to ensure user has access and to grab meeting_link
    async function fetchAppointment() {
      try {
        const res = await api.get('/appointments');
        const apt = res.data.data.find(a => a.id === appointmentId);
        
        if (!apt) {
          setError('Appointment not found or you do not have access.');
          return;
        }

        if (apt.status !== 'approved') {
          setError('This appointment is not approved yet.');
          return;
        }

        setRoomName(apt.meeting_link);
      } catch (err) {
        setError('Failed to load meeting details.');
      }
    }
    fetchAppointment();
  }, [appointmentId]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!roomName) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading secure room...</div>;
  }

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col">
      <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            📹
          </div>
          <h1 className="text-white font-semibold">Video Consultation</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ml-2">
            Secure WebRTC
          </span>
        </div>
        <button onClick={() => navigate('/')} className="px-4 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm transition-colors">
          Leave
        </button>
      </div>
      
      <div className="flex-1 w-full bg-black relative">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            disableModeratorIndicator: true,
            startScreenSharing: true,
            enableEmailInStats: false
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
          }}
          userInfo={{
            displayName: `${user.role === 'doctor' ? 'Dr. ' : ''}${user.name}`
          }}
          onApiReady={(externalApi) => {
            // Can attach event listeners here if needed, like videoConferenceLeft to auto-navigate
            externalApi.addListener('videoConferenceLeft', () => {
              navigate('/');
            });
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
          }}
        />
      </div>
    </div>
  );
}
