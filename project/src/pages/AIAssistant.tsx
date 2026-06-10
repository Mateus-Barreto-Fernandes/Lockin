import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { ai } from '../lib/api';

interface Msg { role: 'user' | 'assistant'; content: string; }

const suggestions = ['Help me plan my week', "What's due soon?", 'Study tips for exams', 'How do I manage my time better?'];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, typing]);

  async function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { role: 'user', content: text.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setTyping(true);
    try {
      const data = await ai.chat(newMsgs.map(m => ({ role: m.role, content: m.content })));
      setMessages([...newMsgs, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: 'Sorry, I couldn\'t process that. Please try again.' }]);
    }
    setTyping(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  const showSuggestions = messages.length === 0;

  return (
    <div className="panel" key="ai" style={{ padding: '28px 28px 0' }}>
      <div className="ai-layout">
        <div className="ai-header">
          <div className="ai-avatar"><Bot size={18} /></div>
          <div className="ai-header-info">
            <h3>Lockin AI</h3>
            <div className="ai-online"><div className="ai-online-dot" /> Online</div>
          </div>
        </div>

        <div className="chat-thread" ref={threadRef}>
          {showSuggestions && (
            <div className="empty-state" style={{ padding: '40px 16px' }}>
              <p style={{ marginBottom: 12 }}>Hi! I'm Lockin AI, your study assistant. Ask me anything about your deadlines, timetable, or study tips.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <div className={`msg-avatar ${m.role === 'assistant' ? 'ai' : 'user-av'}`}>
                {m.role === 'assistant' ? 'AI' : 'U'}
              </div>
              <div className="msg-bubble">{m.content}</div>
            </div>
          ))}
          {typing && (
            <div className="chat-msg ai">
              <div className="msg-avatar ai">AI</div>
              <div className="msg-bubble" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                <div className="typing-indicator">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
        </div>

        {showSuggestions && (
          <div className="ai-suggestions">
            {suggestions.map(s => (
              <button key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="chat-input-area">
          <textarea
            className="chat-textarea"
            placeholder="Ask Lockin AI anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="btn-send" onClick={() => send(input)} disabled={!input.trim() || typing}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
