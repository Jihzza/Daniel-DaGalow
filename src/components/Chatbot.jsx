// components/Chatbot.js
import React, { useState } from 'react';

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! I'm your assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [
      ...messages,
      { from: "user", text: input },
      { from: "bot", text: "Great question! Let me guide you to the right service." }
    ];
    setMessages(newMessages);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-white w-80 h-96 shadow-lg rounded flex flex-col">
          <div className="bg-oxfordBlue text-white p-3 rounded-t flex justify-between items-center">
            <span>Assistant</span>
            <button onClick={() => setOpen(false)} className="focus:outline-none">
              ✕
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.from === 'bot' ? 'text-left' : 'text-right'}`}>
                <p className="inline-block p-2 rounded bg-gray-100">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
          <div className="p-3">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none"
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-darkGold hover:bg-yellow-600 text-black font-bold p-3 rounded-full focus:outline-none"
        >
          💬
        </button>
      )}
    </div>
  );
}

export default Chatbot;
