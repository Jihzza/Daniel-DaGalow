// components/Chatbot.jsx
import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! I’m Daniel’s assistant. How can I help you today?' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef(null);

  // TODO: replace with your actual n8n webhook URL
  const WEBHOOK_URL = 'https://rafaello.app.n8n.cloud/webhook/general';

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // append user message
    const userMsg = { sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      const reply = data.reply || 'Sorry, I didn’t quite catch that. Could you rephrase?';
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Oops! Something went wrong. Please try again later.' },
      ]);
    }
  };

  return (
    <section id="chatbot" className="py-8 px-4 text-white h-screen">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Chat with Daniel</h2>
        <div
          ref={chatContainerRef}
          className="bg-darkGold rounded-lg p-4 h-80 overflow-y-auto"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-[75%] whitespace-pre-wrap break-words ${
                  msg.sender === 'user' ? 'bg-darkGold text-black' : 'bg-gentleGray text-oxfordBlue'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex">
          <input
            type="text"
            className="flex-1 p-2 rounded-l-lg text-black"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            type="submit"
            className="bg-darkGold text-black font-bold px-4 py-2 rounded-r-lg hover:bg-opacity-90 transition-all duration-200"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
};

export default Chatbot;
