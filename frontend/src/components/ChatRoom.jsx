import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

export default function ChatRoom() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get('/chat/contacts').then(res => setContacts(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedContact) return;
    setLoading(true);
    api.get(`/chat/${selectedContact.id}`).then(res => setMessages(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [selectedContact]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (selectedContact && (msg.sender_id === selectedContact.id || msg.receiver_id === selectedContact.id)) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('new-message', handler);
    return () => socket.off('new-message', handler);
  }, [socket, selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !selectedContact) return;
    try {
      const res = await api.post('/chat/send', { receiver_id: selectedContact.id, message: input.trim() });
      setMessages(prev => [...prev, res.data.data]);
      setInput('');
    } catch {}
  }

  return (
    <div className="glass-card flex overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: 400 }}>
      {/* Contacts Sidebar */}
      <div className="w-64 border-r border-slate-700/50 flex flex-col">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">💬 Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(c => (
            <button key={c.id} onClick={() => setSelectedContact(c)}
              className={`w-full p-3 text-left flex items-center gap-3 transition-all border-b border-slate-700/20 ${selectedContact?.id === c.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : 'hover:bg-slate-800/50'}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold">
                {c.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{c.name}</p>
                <p className="text-xs text-slate-400 capitalize">{c.role}</p>
              </div>
            </button>
          ))}
          {contacts.length === 0 && (
            <p className="text-xs text-slate-500 text-center p-4">No contacts yet</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold">
                {selectedContact.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{selectedContact.name}</p>
                <p className="text-xs text-slate-400 capitalize">{selectedContact.role}{selectedContact.patient_id ? ` • ${selectedContact.patient_id}` : ''}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender_id === user?.id
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-slate-700/50 text-slate-200 rounded-bl-md border border-slate-600/30'}`}>
                    {msg.message}
                    <p className="text-[10px] opacity-50 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-slate-700/50 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
                className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all" />
              <button type="submit" disabled={!input.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-40 transition-all">
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm">Select a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
