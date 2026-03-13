import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

export default function ChatBot({ patientId }) {
  const [messages, setMessages] = useState([
    { type: 'ai', message: "Hello! I'm MedChain AI Health Assistant 🏥\n\nI can help you understand your health metrics, answer medical questions, and provide wellness advice. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', message: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/chatbot/message', { message: userMsg, patient_id: patientId });
      setMessages(prev => [...prev, { type: 'ai', message: res.data.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { type: 'ai', message: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform z-40 flex items-center justify-center">
        🤖
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] glass-card border border-slate-600/30 flex flex-col z-40 shadow-2xl shadow-black/50" style={{ borderRadius: 20 }}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)', borderRadius: '20px 20px 0 0' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <p className="text-sm font-bold text-white">MedChain AI Assistant</p>
            <p className="text-xs text-blue-200">Powered by Gemini</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white text-lg">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.type === 'user'
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-slate-700/50 text-slate-200 rounded-bl-md border border-slate-600/30'}`}>
              {msg.message}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-600/30">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-700/50 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your health..."
          className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all" />
        <button type="submit" disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-40 transition-all">
          ➤
        </button>
      </form>
    </div>
  );
}
