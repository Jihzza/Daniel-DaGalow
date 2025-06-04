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

export default function ChatbotWindow({ onClose, sessionId: propSessionId, chatOpenedViaNotification }) {
  const [messages, setMessages] = useState([]);
  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTypingAnimationActive, setIsTypingAnimationActive] = useState(false);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const draggableHeaderRef = useRef(null);
  
  // NavigationBar heights
  const navBarHeightDefault = 48; 
  const navBarHeightLg = 60;    

  // Function to calculate the height of the chatbot window
  // It should fill the screen from the top of the navbar to the top of the viewport
  const calculateChatbotHeight = () => {
    const viewportHeight = window.innerHeight;
    const currentNavBarHeight = window.innerWidth >= 1024 ? navBarHeightLg : navBarHeightDefault;
    return viewportHeight - currentNavBarHeight;
  };

  const [height, setHeight] = useState(calculateChatbotHeight());
  const [resizing, setResizing] = useState(false);
  const lastTap = useRef(0);
  const dragging = useRef(false);
  const [sessionId] = useState(() => propSessionId || generateUUID());
  const { user } = useAuth();
  const userId = user?.id;
  // const [isNewChat, setIsNewChat] = useState(true); // This state might not be strictly needed if fetch logic handles it
  const { t } = useTranslation();

  // Recalculate height on window resize
  useEffect(() => {
    const handleResize = () => {
      setHeight(calculateChatbotHeight());
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation
    return () => window.removeEventListener('resize', handleResize);
  }, []);


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
      if (draggableHeaderRef.current.setPointerCapture) {
        draggableHeaderRef.current.setPointerCapture(e.pointerId);
      }
    }
  };

  const onPointerMove = (e) => {
    if (!resizing) return;
    dragging.current = true;
    const viewportHeight = window.innerHeight;
    const currentNavBarHeight = window.innerWidth >= 1024 ? navBarHeightLg : navBarHeightDefault;
    
    // Calculate new height based on pointer position relative to the top of the viewport
    // The chatbot's height is viewportHeight - pointerY (relative to viewport top) - navBarHeight
    const newHeightValue = viewportHeight - e.clientY - currentNavBarHeight;

    // Min height: e.g., 100px. Max height: full available height above navbar.
    const minChatHeight = 100;
    const maxChatHeight = viewportHeight - currentNavBarHeight; 

    setHeight(Math.max(minChatHeight, Math.min(newHeightValue, maxChatHeight)));
  };
  

  const onPointerUp = (e) => {
    if (!resizing) return;
    if (draggableHeaderRef.current) {
      if (draggableHeaderRef.current.releasePointerCapture) {
        draggableHeaderRef.current.releasePointerCapture(e.pointerId);
      }
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
          // setIsNewChat(false); 
          if (!sessionData && !sessionError) { 
             try {
                await supabase.from("chat_sessions").insert({
                    id: sessionId,
                    user_id: userId, 
                    title: "Previous Chat", 
                });
            } catch (insertError) {
                console.error("Error creating session for existing messages:", insertError);
            }
          }
        } else { 
          const welcomeMessageText = chatOpenedViaNotification
            ? t('window_chatbot.guided_welcome_message', "I'm here to help you explore all available services! How can I assist you today?")
            : t("window_chatbot.welcome_message");
          
          const welcomeMessage = {
            from: "bot",
            text: welcomeMessageText,
            isTyping: true, 
          };
          if (!sessionData && !sessionError) { 
            try {
                await supabase.from("chat_sessions").insert({
                    id: sessionId,
                    user_id: userId,
                    title: chatOpenedViaNotification ? "Guided Service Chat" : "New Chat",
                });
            } catch (insertError) {
                console.error("Error creating new session:", insertError);
            }
          }
          setMessages([welcomeMessage]);
          // setIsNewChat(false); 
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
  }, [sessionId, userId, t, chatOpenedViaNotification]); 

  useEffect(() => {
    // Simplified drag-to-close logic: if height becomes very small, close.
    // This threshold should be less than minChatHeight.
    const closeThreshold = 50; 
    if (height <= closeThreshold && resizing) { // Only consider closing during active resize
      // To prevent accidental closure, perhaps add a delay or require a more deliberate gesture.
      // For now, direct close.
      // onClose(); // This might be too aggressive. Double-tap is more reliable.
    }
  }, [height, onClose, resizing]);


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
      const botResponseText = data.output || t('window_chatbot.error_understanding'); 
      
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
                    await supabase.from("chat_sessions")
                                  .update({ title: titleData.title || "Chat Session", updated_at: new Date() })
                                  .eq("id", sessionId);
                }
            } catch (titleError) {
                console.error("Error updating chat title:", titleError);
            }
        }
      }

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage = { from: "bot", text: t('window_chatbot.error_message'), isTyping: true };
      setMessages((msgs) => [...msgs, errorMessage]);
      setIsTypingAnimationActive(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      ref={panelRef}
      className="fixed w-full bg-oxfordBlue shadow-2xl rounded-t-2xl overflow-visible border-t-2 border-darkGold flex flex-col z-50 touch-none overscroll-contain bottom-[48px] lg:bottom-[60px]" // MODIFIED: Changed z-40 to z-50
      style={{ height: `${height}px` }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "tween", duration: 0.15 }}
    >
      {/* Header */}
      <div
        className={`relative w-full flex items-stretch justify-between py-3 md:py-4 px-2 md:px-4 touch-none ${
          resizing ? "bg-opacity-50" : ""
        }`}
      >
        <div
          ref={draggableHeaderRef}
          className="flex-grow h-full cursor-row-resize"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ touchAction: 'none' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-1 bg-darkGold rounded-full pointer-events-none"></div>
        </div>

        <div className="flex-shrink-0 flex items-center justify-center pl-2 z-10"> {/* Note: This inner z-10 is relative to its parent stacking context */}
          <button
            onClick={onClose}
            className="text-darkGold text-2xl md:text-3xl leading-none focus:outline-none p-2"
            aria-label="Close chat"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 w-full text-white overflow-auto space-y-2 px-2">
        <div
          ref={listRef}
          className="flex-1 w-full text-white overflow-auto space-y-2"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`px-4 py-2 rounded-lg whitespace-pre-wrap break-words ${
                m.from === "user"
                  ? "bg-gentleGray/20 md:text-xl self-end text-white ml-auto max-w-[80%]"
                  : "self-start md:text-xl text-white bg-oxfordBlue/50 max-w-[80%]"
              }`}
            >
              {m.from === "bot" ? (
                <TypingMessage
                  text={m.text}
                  isComplete={!m.isTyping}
                  typingSpeed={2}
                  startDelay={100}
                  onComplete={() => {
                    setMessages((prevMsgs) =>
                      prevMsgs.map((msg, idx) =>
                        idx === i ? { ...msg, isTyping: false } : msg
                      )
                    );
                  }}
                />
              ) : (
                m.text
              )}
            </div>
          ))}

          {loading && (
            <div className="text-center px-4 py-2 text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-darkGold mx-auto"></div>
            </div>
          )}
        </div>
      </div>
      {/* Input & attachments */}
      <div className="pb-2 md:pb-4 px-2">
        <div className="relative w-full">
          <button className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1"> {/* Note: This inner z-10 is relative to its parent stacking context */}
            <img src={Anexar} alt={t("window_chatbot.attach_alt", "Attach file")} className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <input
            className="w-full h-12 md:h-14 border-2 border-darkGold bg-oxfordBlue text-white md:text-lg rounded-full p-3 pl-10 pr-12 md:pl-12 md:pr-14"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) =>
              !isTypingAnimationActive && e.key === "Enter" && sendMessage()
            }
            placeholder={
              isTypingAnimationActive
                ? t("window_chatbot.placeholder_waiting", "Wait for bot response...")
                : t("window_chatbot.placeholder_default", "Type a message…")
            }
            disabled={loading || isTypingAnimationActive}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1"  // Note: This inner z-10 is relative to its parent stacking context
            onClick={sendMessage}
            disabled={loading || isTypingAnimationActive}
          >
            <img
              src={Send}
              alt={t("window_chatbot.send_alt", "Send message")}
              className={`w-5 h-5 md:w-6 md:h-6 ${
                loading || isTypingAnimationActive ? "opacity-50" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}