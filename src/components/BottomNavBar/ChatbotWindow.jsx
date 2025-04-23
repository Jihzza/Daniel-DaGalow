// ChatbotWindow.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import Send from "../../assets/icons/Send.svg";
import Anexar from "../../assets/icons/Anexar.svg";

export default function ChatbotWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const headerRef = useRef(null);
  const DEFAULT_HEIGHT = window.innerHeight - 45;
  const initialHeight = useRef(DEFAULT_HEIGHT);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [resizing, setResizing] = useState(false);
  const lastTap = useRef(0);
  const dragging = useRef(false);

  // inside your component, before the return
  const onPointerDown = (e) => {
    e.preventDefault();
    setResizing(true);
    dragging.current = false;
    // capture the pointer so we continue getting moves
    headerRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!resizing) return;
    dragging.current = true;
    const newHeight = window.innerHeight - e.clientY - 56;
    setHeight(Math.max(100, Math.min(newHeight, window.innerHeight - 100)));
  };

  useEffect(() => {
    const threshold = initialHeight.current * 0.3;
    if (height <= threshold) {
      onClose();
    }
  }, [height, onClose]);

  const onPointerUp = (e) => {
    headerRef.current.releasePointerCapture(e.pointerId);
    setResizing(false);

    // double‑tap logic
    if (!dragging.current) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        onClose();
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
    dragging.current = false;
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!userText.trim()) return;

    // add user message
    setMessages((msgs) => [...msgs, { from: "user", text: userText }]);
    const textToSend = userText;
    setUserText("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://rafaello.app.n8n.cloud/webhook/general",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatInput: textToSend }),
        }
      );
      const data = await res.json();
      console.log("Webhook returnded:", data);

      const { output } = data;
      setMessages((msgs) => [...msgs, { from: "bot", text: output }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Sorry, there was an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={panelRef}
      className="fixed bottom-14 w-full bg-oxfordBlue shadow-2xl rounded-t-2xl overflow-visible border-t-2 border-darkGold flex flex-col z-40 touch-none overscroll-contain"
      style={{ height: `${height}px` }}
    >
      {/* Header */}
      <div
        ref={headerRef}
        className={`relative w-full flex items-center justify-center py-6 px-4 cursor-row-resize touch-none ${
          resizing ? "bg-opacity-50" : ""
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="w-10 h-1 bg-darkGold rounded-full"></div>
        <button
          onClick={onClose}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-darkGold text-2xl leading-none focus:outline-none"
        >
          x
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 w-full text-white overflow-auto space-y-2">
        <div
          ref={listRef}
          className="flex-1 w-full text-white overflow-auto space-y-2"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`px-4 py-2 ${
                m.from === "user"
                  ? "bg-gentleGray/20 self-end text-white"
                  : "self-start text-white"
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
      </div>
      {/* Input & attachments */}
      <div className="pb-2 px-2">
        <div className="relative w-full">
          <button className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <img src={Anexar} alt="Anexar" className="w-6 h-6" />
          </button>
          <input
            className="w-full h-12 border-2 border-darkGold bg-oxfordBlue text-white rounded-full p-4 px-12"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message…"
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 pb-1 z-10"
            onClick={sendMessage}
            disabled={loading}
          >
            <img
              src={Send}
              alt="Send"
              className={`w-6 h-6 ${loading ? "opacity-50" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
