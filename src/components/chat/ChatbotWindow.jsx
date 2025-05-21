// ChatbotWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Send from "../../assets/icons/Send.svg";
import Anexar from "../../assets/icons/Anexar.svg";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import TypingMessage from "../common/TypingMessage";
import { useTranslation } from "react-i18next";

// Fallback function to generate UUID for browsers that don't support crypto.randomUUID
function generateUUID() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ChatbotWindow({ onClose, sessionId: propSessionId }) {
  const [messages, setMessages] = useState([]);
  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTypingAnimationActive, setIsTypingAnimationActive] = useState(false);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const draggableHeaderRef = useRef(null);
  const DEFAULT_HEIGHT = window.innerHeight - 45;
  const initialHeight = useRef(DEFAULT_HEIGHT);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [resizing, setResizing] = useState(false);
  const lastTap = useRef(0);
  const dragging = useRef(false);
  const [sessionId] = useState(() => propSessionId || generateUUID());
  const { user } = useAuth();
  const userId = user?.id;
  const [isNewChat, setIsNewChat] = useState(true);
  const { t } = useTranslation();

  const checkTypingAnimations = () => {
    const anyStillTyping = messages.some(
      (msg) => msg.from === "bot" && msg.isTyping
    );
    setIsTypingAnimationActive(anyStillTyping);
  };

  const onPointerDown = (e) => {
    if (draggableHeaderRef.current && draggableHeaderRef.current.contains(e.target)) {
      e.preventDefault();
      setResizing(true);
      dragging.current = false;
      draggableHeaderRef.current.setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e) => {
    if (!resizing) return;
    dragging.current = true;
    const newHeight = window.innerHeight - e.clientY - 56; 
    setHeight(Math.max(100, Math.min(newHeight, window.innerHeight - 100)));
  };

  const onPointerUp = (e) => {
    if (!resizing) return;
    if (draggableHeaderRef.current) {
      draggableHeaderRef.current.releasePointerCapture(e.pointerId);
    }
    setResizing(false);

    if (!dragging.current && draggableHeaderRef.current && draggableHeaderRef.current.contains(e.target)) {
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
    if (!sessionId) return;
    (async () => {
      const { data: sessionData, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("id, title")
        .eq("id", sessionId)
        .single();

      if (sessionError && sessionError.code !== "PGRST116") {
        console.error("Error checking session:", sessionError);
      }

      const { data, error } = await supabase
        .from("messages")
        .select("role, content, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (!error) {
        if (data && data.length > 0) {
          setMessages(
            data.map((row) => ({
              from: row.role === "user" ? "user" : "bot",
              text: row.content,
              isTyping: false,
            }))
          );
          setIsNewChat(false);
          if (!sessionData) {
            await supabase.from("chat_sessions").insert({
              id: sessionId,
              user_id: userId,
              title: "Previous Chat",
            });
          }
        } else {
          const welcomeMessageText = t("window_chatbot.welcome_message");
          const welcomeMessage = {
            from: "bot",
            text: welcomeMessageText,
            isTyping: true,
          };
          await supabase.from("chat_sessions").insert({
            id: sessionId,
            user_id: userId,
            title: "New Chat",
          });
          setMessages([welcomeMessage]);
          setIsNewChat(false);
          setIsTypingAnimationActive(true);
          try {
            await supabase.from("messages").insert({
              session_id: sessionId,
              role: "assistant",
              content: welcomeMessageText,
              user_id: userId,
            });
          } catch (dbError) {
            console.error("Error saving welcome message:", dbError);
          }
        }
      } else {
        console.error("Error fetching messages:", error);
      }
    })();
  }, [sessionId, userId, t]);

  useEffect(() => {
    const threshold = initialHeight.current * 0.3;
    if (height <= threshold && !resizing) { 
      onClose();
    }
  }, [height, onClose, resizing, initialHeight]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    checkTypingAnimations();
  }, [messages]);

  const sendMessage = async () => {
    if (!userText.trim() || isTypingAnimationActive || loading) return;

    const newUserMessage = { from: "user", text: userText.trim(), isTyping: false };
    setMessages((msgs) => [...msgs, newUserMessage]);
    const textToSend = userText.trim();
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
      if (!res.ok) {
        throw new Error(`Webhook failed with status ${res.status}`);
      }
      const data = await res.json();
      const botResponseText = data.output || "Sorry, I had trouble understanding that.";
      
      const newBotMessage = { from: "bot", text: botResponseText, isTyping: true };
      setMessages((msgs) => [...msgs, newBotMessage]);
      setIsTypingAnimationActive(true);

      await supabase.from("messages").insert([
        { session_id: sessionId, role: "user", content: textToSend, user_id: userId },
        { session_id: sessionId, role: "assistant", content: botResponseText, user_id: userId },
      ]);

      if (messages.length + 2 >= 4 && (messages.length + 2) % 3 === 0) {
        const firstUserMessage = messages.find(msg => msg.from === 'user');
        if (firstUserMessage) {
            try {
                const titleRes = await fetch("https://rafaello.app.n8n.cloud/webhook/chat-title", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId, firstUserPrompt: firstUserMessage.text }),
                });
                if (titleRes.ok) {
                    const titleData = await titleRes.json();
                    await supabase.from("chat_sessions").update({ title: titleData.title || "Chat Session", updated_at: new Date() }).eq("id", sessionId);
                }
            } catch (titleError) {
                console.error("Error updating chat title:", titleError);
            }
        }
      }

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage = { from: "bot", text: t('window_chatbot.error_message') || "Sorry, there was an error. Please try again.", isTyping: true };
      setMessages((msgs) => [...msgs, errorMessage]);
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
        className={`relative w-full flex items-stretch justify-between py-3 md:py-4 px-2 md:px-4 touch-none ${ // Added relative for absolute positioning of the handle
          resizing ? "bg-opacity-50" : ""
        }`}
      >
        {/* Draggable Area (takes up space, handles drag events) */}
        <div
          ref={draggableHeaderRef}
          className="flex-grow h-full cursor-row-resize" // Ensure it fills height for reliable drag
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ touchAction: 'none' }}
        >
          {/* This div is now just for capturing pointer events over the main area. */}
          {/* The visual handle is positioned absolutely relative to the parent. */}
        </div>

        {/* Centered Drag Handle (Visual) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-1 bg-darkGold rounded-full pointer-events-none"></div>


        {/* Close Button Container */}
        <div className="flex-shrink-0 flex items-center justify-center pl-2 z-10"> {/* Added z-10 to ensure it's clickable over the draggable area if overlap occurs */}
          <button
            onClick={(e) => {
              onClose();
            }}
            className="text-darkGold text-2xl md:text-3xl leading-none focus:outline-none p-2"
            aria-label="Close chat"
          >
            x
          </button>
        </div>
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
                  ? "bg-gentleGray/20 md:text-xl self-end text-white"
                  : "self-start md:text-xl text-white"
              }`}
            >
              {m.from === "bot" ? (
                <TypingMessage
                  text={m.text}
                  isComplete={!m.isTyping}
                  typingSpeed={2} // Fast typing speed
                  startDelay={10} // Quick start delay
                  onComplete={() => {
                    // Mark this message as completed
                    setMessages((prevMsgs) =>
                      prevMsgs.map((msg, idx) =>
                        idx === i ? { ...msg, isTyping: false } : msg
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
      <div className="pb-2 md:pb-10 px-2">
        <div className="relative w-full">
          <button className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <img src={Anexar} alt="Anexar" className="w-6 h-6 md:w-10 md:h-10" />
          </button>
          <input
            className="w-full h-12 md:h-16 border-2 border-darkGold bg-oxfordBlue text-white md:text-xl rounded-full p-4 px-12 md:px-16"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) =>
              !isTypingAnimationActive && e.key === "Enter" && sendMessage()
            }
            placeholder={
              isTypingAnimationActive
                ? "Wait for message..."
                : "Type a message…"
            }
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
              className={`w-6 h-6 md:w-10 md:h-10 ${
                loading || isTypingAnimationActive ? "opacity-50" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}