import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const SOCKET_URL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : window.location.origin;

    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => {
      console.log('🔌 Socket connected');
      s.emit('join-room', user.id);
    });

    s.on('risk-alert', (data) => {
      setNotifications(prev => [...prev, { type: 'risk', ...data, id: Date.now() }]);
    });

    s.on('emergency-alert', (data) => {
      setNotifications(prev => [...prev, { type: 'emergency', ...data, id: Date.now() }]);
    });

    s.on('new-message', (data) => {
      setNotifications(prev => [...prev, { type: 'message', ...data, id: Date.now() }]);
    });

    s.on('patient-assigned', (data) => {
      setNotifications(prev => [...prev, { type: 'assignment', ...data, id: Date.now() }]);
    });

    return () => { s.disconnect(); };
  }, [user]);

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotification }}>
      {children}
    </SocketContext.Provider>
  );
}
