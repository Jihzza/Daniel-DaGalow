// ChatbotWindow.jsx
import React, { useState, useRef, useEffect } from 'react';
import Send from '../../assets/Send.svg';
import Anexar from '../../assets/Anexar.svg';

export default function ChatbotWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [userText, setUserText] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!userText.trim()) return;

    // add user message
    setMessages(msgs => [...msgs, { from: 'user', text: userText }]);
    const textToSend = userText;
    setUserText('');
    setLoading(true);

    try {
      const res = await fetch("https://rafaello.app.n8n.cloud/webhook/general", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: textToSend })
      });
      const data = await res.json();
      console.log("Webhook returnded:", data);

      const { output } = data;
      setMessages(msgs => [...msgs, { from: 'bot', text: output }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: 'Sorry, there was an error. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-14 w-full h-96 bg-oxfordBlue shadow-2xl rounded-t-2xl overflow-visible border-t-2 border-darkGold flex flex-col z-40">
      {/* Header */}
      <div className="w-full flex items-center justify-center py-6 px-4">
        <div className="w-10 h-1 bg-darkGold rounded-full"></div>
      </div>

      {/* Message list */}
      <div
        ref={containerRef}
        className="flex-1 w-full text-white overflow-auto space-y-2"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-4 py-2 ${
              m.from === 'user'
                ? 'bg-gentleGray/20 self-end text-white'
                : 'self-start text-white'
            }`}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}
      </div>

      {/* Input & attachments */}
      <div className="p-2 flex items-center space-x-2">
        <button>
          <img src={Anexar} alt="Anexar" className="w-6 h-6" />
        </button>
        <input
          className="flex-1 h-12 border-2 border-darkGold bg-oxfordBlue text-white rounded-full p-4"
          value={userText}
          onChange={e => setUserText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message…"
        />
        <button onClick={sendMessage} disabled={loading}>
          <img src={Send} alt="Send" className={`w-6 h-6 ${loading ? 'opacity-50' : ''}`} />
        </button>
      </div>
    </div>
);
}
