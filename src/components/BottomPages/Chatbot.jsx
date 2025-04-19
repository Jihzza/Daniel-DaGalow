import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const scrollRef = useRef(null);

  // Auto‑scroll to bottom when history changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = () => {
    if (!message.trim()) return;
    setHistory(h => [...h, { sender: 'user', text: message }]);
    setMessage('');

    // Dummy bot response
    setTimeout(() => {
      setHistory(h => [...h, { sender: 'bot', text: 'Thanks for your message! I’ll get back to you soon.' }]);
    }, 500);
  };

  return (
      <section id="chatbot" className="h-screen">
        <h3 className="text-2xl text-center font-bold text-black mb-4">Chat with Me</h3>
    <div className="bg-oxfordBlue p-6 rounded-2xl shadow-xl max-w-2xl mx-auto ">
      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto bg-white/10 rounded-xl p-4 mb-4 space-y-3"
      >
        {history.length === 0 && (
          <p className="text-white/60 text-center">Start the conversation below.</p>
        )}
        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-xs break-words whitespace-pre-wrap text-sm ${
                msg.sender === 'user'
                  ? 'bg-darkGold text-black'
                  : 'bg-white text-black'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <textarea
          rows={1}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold resize-none"
        />
        <button
          type="button"
          onClick={handleSend}
          className="bg-darkGold px-4 py-3 rounded-xl text-black font-bold hover:bg-opacity-90 transition-all duration-300"
        >
          Send
        </button>
      </div>
    </div>
    </section>
  );
}
