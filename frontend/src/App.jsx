import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { SocketProvider } from './components/SocketContext';
import NotificationToast from './components/NotificationToast';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ChatRoom from './components/ChatRoom';
import BlockchainVerify from './components/BlockchainVerify';
import ChatBot from './components/ChatBot';
import SOSButton from './components/SOSButton';
import MyDoctors from './components/MyDoctors';
import DeviceMode from './components/DeviceMode';
import { connectWallet } from './services/blockchain';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AppLayout() {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  async function handleConnectWallet() {
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
    } catch (err) {
      alert(err.message || 'Failed to connect wallet');
    }
  }

  const tabs = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    ...(user?.role === 'patient' ? [
      { key: 'iot-device', icon: '📡', label: 'IoT Device' },
      { key: 'my-doctors', icon: '👨‍⚕️', label: 'My Doctors' },
    ] : []),
    ...(user?.role !== 'patient' ? [{ key: 'analytics', icon: '📈', label: 'Analytics' }] : []),
    { key: 'chat', icon: '💬', label: 'Messages' },
    { key: 'blockchain', icon: '🔗', label: 'Blockchain' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #0f172a 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <Header walletAddress={walletAddress} onConnectWallet={handleConnectWallet} />

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t.key
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Page Content */}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'iot-device' && <DeviceMode />}
        {activeTab === 'my-doctors' && <MyDoctors />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'chat' && <ChatRoom />}
        {activeTab === 'blockchain' && <BlockchainVerify />}

        {/* Floating AI Chatbot (bottom-right) */}
        <ChatBot patientId={user?.patient_id} />

        {/* Fixed SOS Button (bottom-left) for patients */}
        {user?.role === 'patient' && <SOSButton patientId={user.patient_id} />}
      </div>
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
