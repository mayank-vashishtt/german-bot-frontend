import React, { useState, useEffect, useRef } from 'react';

const USER_ID = 'demo-user'; // In production, generate or fetch a real userId

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // On mount, fetch the welcome message and first question
  useEffect(() => {
    const fetchWelcome = async () => {
      setIsTyping(true);
      const res = await fetch('https://german-bot-backend.onrender.com/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID })
      });
      const data = await res.json();
      setMessages([{ from: 'bot', text: data.response }]);
      setIsTyping(false);
    };
    fetchWelcome();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    setIsTyping(true);

    const res = await fetch('https://german-bot-backend.onrender.com/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID, answer: input })
    });
    const data = await res.json();
    setMessages(msgs => [...msgs, { from: 'bot', text: data.response }]);
    setInput('');
    setIsTyping(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>German Quiz Chatbot</h2>
      <div style={{ minHeight: 300, border: '1px solid #ccc', padding: 16, borderRadius: 8, marginBottom: 16, background: '#fafafa' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: '12px 0', textAlign: msg.from === 'user' ? 'right' : 'left' }}>
            <span style={{ background: msg.from === 'user' ? '#d1e7dd' : '#e2e3e5', padding: '8px 12px', borderRadius: 8, display: 'inline-block' }}>
              {msg.text}
            </span>
          </div>
        ))}
        {isTyping && <div><em>Bot is typing...</em></div>}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your answer..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Send</button>
      </form>
    </div>
  );
};

export default ChatPage;