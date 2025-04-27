// ChatbotWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Send from "../../assets/icons/Send.svg";
import Anexar from "../../assets/icons/Anexar.svg";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import TypingMessage from "../UI/TypingMessage";

export default function ChatbotWindow({ onClose, sessionId: propSessionId }) {
  const [messages, setMessages] = useState([]);
  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTypingAnimationActive, setIsTypingAnimationActive] = useState(false);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const headerRef = useRef(null);
  const DEFAULT_HEIGHT = window.innerHeight - 45;
  const initialHeight = useRef(DEFAULT_HEIGHT);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [resizing, setResizing] = useState(false);
  const lastTap = useRef(0);
  const dragging = useRef(false);
  const [sessionId] = useState(
    () => propSessionId || window.crypto.randomUUID()
  );
  const { user } = useAuth();
  const userId = user?.id;
  const [isNewChat, setIsNewChat] = useState(true);

  // Check if any messages still have active typing animations
  const checkTypingAnimations = () => {
    const anyStillTyping = messages.some(msg => msg.from === "bot" && msg.isTyping);
    setIsTypingAnimationActive(anyStillTyping);
  };

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
    if (!sessionId) return;

    (async () => {
      // Fetch existing messages for this session
      const { data, error } = await supabase
        .from("messages")
        .select("role, content, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (!error) {
        if (data && data.length > 0) {
          // We have existing messages, load them
          setMessages(
            data.map((row) => ({
              from: row.role === "user" ? "user" : "bot",
              text: row.content,
              isTyping: false // Mark existing messages as already typed
            }))
          );
          setIsNewChat(false);
        } else {
          // No messages, this is a new chat
          // Add welcome message immediately to avoid double display
          const welcomeMessage = {
            from: "bot",
            text: "👋 Welcome to DaGalow's personal assistant! I can help you with information about services, booking consultations, or answering questions about Daniel's expertise in mindset, finance, health, and more. How can I assist you today?",
            isTyping: true
          };
          
          // Update UI first
          setMessages([welcomeMessage]);
          setIsNewChat(false);
          setIsTypingAnimationActive(true);
          
          // Then save to database
          try {
            await supabase
              .from("messages")
              .insert({
                session_id: sessionId,
                role: "assistant",
                content: welcomeMessage.text,
                user_id: userId
              });
          } catch (error) {
            console.error("Error saving welcome message:", error);
          }
        }
      }
    })();
  }, [sessionId, userId]);

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

  // Check typing animations whenever messages change
  useEffect(() => {
    checkTypingAnimations();
  }, [messages]);

  const sendMessage = async () => {
    if (!userText.trim() || isTypingAnimationActive) return;

    // Add user message (no animation needed)
    setMessages((msgs) => [...msgs, { from: "user", text: userText }]);
    const textToSend = userText;
    setUserText("");
    setLoading(true);

    try {
      const res = await fetch("https://rafaello.app.n8n.cloud/webhook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          chatInput: textToSend,
          user_id: userId,
        }),
      });
      const data = await res.json();
      console.log("Webhook returned:", data);

      const { output } = data;
      
      // Add bot response WITH typing animation flag
      setMessages((msgs) => [...msgs, { 
        from: "bot", 
        text: output,
        isTyping: true // This triggers the typing animation
      }]);
      setIsTypingAnimationActive(true);
      
      // Save messages to database
      await supabase
        .from("messages")
        .insert([
          {
            session_id: sessionId,
            role: "user",
            content: textToSend,
            user_id: userId,
          },
          {
            session_id: sessionId,
            role: "assistant",
            content: output,
            user_id: userId,
          }
        ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      // Even error messages need the typing animation
      setMessages((msgs) => [
        ...msgs,
        { 
          from: "bot", 
          text: "Sorry, there was an error. Please try again.",
          isTyping: true // Add typing animation to error messages too
        },
      ]);
      setIsTypingAnimationActive(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      ref={panelRef}
      className="fixed bottom-14 w-full bg-oxfordBlue shadow-2xl rounded-t-2xl overflow-visible border-t-2 border-darkGold flex flex-col z-40 touch-none overscroll-contain"
      style={{ height: `${height}px` }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
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
              {m.from === "bot" ? (
                <TypingMessage 
                  text={m.text} 
                  isComplete={!m.isTyping}
                  typingSpeed={2}  // Fast typing speed
                  startDelay={10}  // Quick start delay
                  onComplete={() => {
                    // Mark this message as completed
                    setMessages(prevMsgs => 
                      prevMsgs.map((msg, idx) => 
                        idx === i ? {...msg, isTyping: false} : msg
                      )
                    );
                    // This will trigger our useEffect to check if any messages are still typing
                  }}
                />
              ) : (
                m.text
              )}
            </div>
          ))}

          {loading && (
            <div className="text-center px-4 py-2 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          )}
        </div>
      </div>
      {/* Input & attachments - Disabled while typing animation is active */}
      <div className="pb-2 px-2">
        <div className="relative w-full">
          <button className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <img src={Anexar} alt="Anexar" className="w-6 h-6" />
          </button>
          <input
            className="w-full h-12 border-2 border-darkGold bg-oxfordBlue text-white rounded-full p-4 px-12"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) => !isTypingAnimationActive && e.key === "Enter" && sendMessage()}
            placeholder={isTypingAnimationActive ? "Wait for message..." : "Type a message…"}
            disabled={loading || isTypingAnimationActive}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 pb-1 z-10"
            onClick={sendMessage}
            disabled={loading || isTypingAnimationActive}
          >
            <img
              src={Send}
              alt="Send"
              className={`w-6 h-6 ${(loading || isTypingAnimationActive) ? "opacity-50" : ""}`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}