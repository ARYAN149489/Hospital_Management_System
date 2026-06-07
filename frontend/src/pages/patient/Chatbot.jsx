import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Mic } from 'lucide-react';
import { chatbotAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const SUGGESTIONS = [
  'How do I book an appointment?',
  'What are the visiting hours?',
  'How to view my lab results?',
  'Tell me about your services',
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: "Hello! I'm MediCare Plus AI Assistant. I can help you with appointments, medical queries, and platform guidance. Ask me anything in English or Hindi! 🏥", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text = input) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { id: Date.now(), role: 'user', text: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await chatbotAPI.sendMessage({ message: msg });
      if (res.success) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: res.data?.response || res.data?.message || 'I understand. How can I help?', timestamp: new Date() }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: "I'm having trouble connecting right now. Please try again shortly.", timestamp: new Date() }]);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    try {
      await chatbotAPI.clearHistory();
      setMessages([{ id: 1, role: 'bot', text: "Hello! I'm MediCare Plus AI Assistant. How can I help you today?", timestamp: new Date() }]);
    } catch { toast.error('Failed to clear history'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', maxHeight: '720px' }}>
      {/* Header */}
      <div className="glass-card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px' }}>MediCare AI</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--secondary)' }}>
              <div className="status-dot stable pulse" />
              Online · Bilingual Support
            </div>
          </div>
        </div>
        <button onClick={clearHistory} className="btn-icon" title="Clear history"><Trash2 size={16} /></button>
      </div>

      {/* Messages */}
      <div className="glass-card-sm" style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: msg.role === 'user' ? 'var(--surface-container)' : 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {msg.role === 'user' ? <User size={16} color="var(--on-surface-var)" /> : <Bot size={16} color="white" />}
            </div>
            <div style={{
              maxWidth: '75%',
              background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface-low)',
              color: msg.role === 'user' ? 'white' : 'var(--on-surface)',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              fontSize: '14px',
              lineHeight: '1.6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              {msg.text}
              <p style={{ fontSize: '10px', marginTop: '6px', opacity: 0.6, textAlign: 'right' }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="white" />
            </div>
            <div style={{ background: 'var(--surface-low)', padding: '14px 18px', borderRadius: '18px 18px 18px 4px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--outline)', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '12px 0', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => sendMessage(s)}
            style={{ padding: '7px 14px', borderRadius: '999px', border: '1.5px solid var(--outline-var)', background: 'white', color: 'var(--on-surface-var)', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--secondary)'; e.target.style.color = 'var(--secondary)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--outline-var)'; e.target.style.color = 'var(--on-surface-var)'; }}
          >{s}</button>
        ))}
      </div>

      {/* Input */}
      <div className="glass-card-sm" style={{ padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div className="input-wrapper" style={{ flex: 1 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="input-glass"
            placeholder="Ask me anything in English or Hindi…"
            disabled={loading}
          />
        </div>
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn btn-primary" style={{ padding: '13px 18px' }}>
          <Send size={18} />
        </button>
      </div>

      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }`}</style>
    </div>
  );
}
