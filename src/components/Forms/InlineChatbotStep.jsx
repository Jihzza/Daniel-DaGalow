import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import SendIcon from "../../assets/icons/Send.svg";
import AttachIcon from "../../assets/icons/Anexar.svg";
import { supabase } from "../../utils/supabaseClient";
import { format } from "date-fns";
import TypingMessage from "../UI/TypingMessage";

export default function InlineChatbotStep({ requestId, tableName }) {
  const { t } = useTranslation();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [isTypingAnimationActive, setIsTypingAnimationActive] = useState(false);
  const listRef = useRef(null);
  const [isNewChat, setIsNewChat] = useState(true);
  
  // Function to check if any messages still have active typing animations
  const checkTypingAnimations = () => {
    const anyStillTyping = msgs.some(msg => msg.from === "bot" && msg.isTyping);
    setIsTypingAnimationActive(anyStillTyping);
  };
  
  // Check for active typing animations whenever messages change
  useEffect(() => {
    checkTypingAnimations();
  }, [msgs]);
  
  // Generate a context-specific welcome message based on the service type
  const getWelcomeMessage = async () => {
    try {
      let welcomeMessage = t("inline_chatbot.welcome_message");
      
      // Default welcome messages for different service types
      if (tableName === "booking_chat_messages") {
        // For consultations, get the booking details
        const { data, error } = await supabase
          .from("bookings")
          .select("appointment_date, duration_minutes")
          .eq("id", requestId)
          .single();
          
        if (!error && data) {
          const appointmentDate = new Date(data.appointment_date);
          const formattedDate = format(appointmentDate, "MMMM do, yyyy 'at' h:mm a");
          welcomeMessage = t("inline_chatbot.booking_welcome_with_date", {
            date: formattedDate,
            duration: data.duration_minutes
          });
        } else {
          welcomeMessage = t("inline_chatbot.booking_welcome");
        }
      } 
      else if (tableName === "coaching_chat_messages") {
        // For coaching services
        const { data, error } = await supabase
          .from("coaching_requests")
          .select("service_type")
          .eq("id", requestId)
          .single();
          
        if (!error && data) {
          const tier = {
            "weekly": "Basic",
            "daily": "Standard",
            "priority": "Premium"
          }[data.service_type] || "coaching";
          
          welcomeMessage = t("inline_chatbot.coaching_welcome", { tier });
        } else {
          welcomeMessage = t("inline_chatbot.coaching_welcome", { tier: "coaching" });
        }
      }
      else if (tableName === "analysis_chat_messages") {
        // For analysis services
        const { data, error } = await supabase
          .from("analysis_requests")
          .select("service_type")
          .eq("id", requestId)
          .single();
          
        if (!error && data) {
          const analysisType = data.service_type || "analysis";
          welcomeMessage = t("inline_chatbot.analysis_welcome", { type: analysisType });
        } else {
          welcomeMessage = t("inline_chatbot.analysis_welcome", { type: "analysis" });
        }
      }
      else if (tableName === "pitchdeck_chat_messages") {
        // For pitch deck requests
        const { data, error } = await supabase
          .from("pitch_requests")
          .select("project")
          .eq("id", requestId)
          .single();
          
        if (!error && data) {
          welcomeMessage = t("inline_chatbot.pitch_deck_welcome", { project: data.project });
        } else {
          welcomeMessage = t("inline_chatbot.pitch_deck_welcome", { project: "investment opportunity" });
        }
      }
      
      return welcomeMessage;
    } catch (err) {
      console.error("Error generating welcome message:", err);
      return t("inline_chatbot.welcome_message");
    }
  };

  // Load existing messages
  useEffect(() => {
    if (!requestId) return;
    (async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select("sender, message, created_at")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("Fetch messages error", error);
        return;
      }
      
      const messagesList = data.map((d) => ({
        from: d.sender === "user" ? "user" : "bot",
        text: d.message,
        isTyping: false // Mark existing messages as already typed
      }));
      
      setMsgs(messagesList);
      
      // If no messages exist, this is a new chat
      setIsNewChat(data.length === 0);
    })();
  }, [requestId, tableName]);
  
  // Display welcome message if this is a new chat
  useEffect(() => {
    if (isNewChat && msgs.length === 0) {
      const initializeChat = async () => {
        const welcomeText = await getWelcomeMessage();
        const welcomeMessage = {
          from: "bot",
          text: welcomeText,
          isTyping: true
        };
        
        // Add welcome message to UI
        setMsgs([welcomeMessage]);
        setIsTypingAnimationActive(true);
        
        // Store welcome message in database
        if (requestId) {
          await supabase
            .from(tableName)
            .insert({
              request_id: requestId,
              sender: "bot",
              message: welcomeText,
            });
        }
        
        setIsNewChat(false);
      };
      
      initializeChat();
    }
  }, [isNewChat, msgs, requestId, tableName]);

  // Auto-scroll whenever messages or busy change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [msgs, busy]);

  async function send() {
    // Don't allow sending if text is empty or a typing animation is in progress
    if (!text.trim() || isTypingAnimationActive) return;
    
    setBusy(true);
    const t = text.trim();
    setText("");

    // 1) Add user message to UI (no animation for user messages)
    setMsgs((m) => [...m, { from: "user", text: t }]);
    
    // 2) Save user message to database
    await supabase
      .from(tableName)
      .insert({ request_id: requestId, sender: "user", message: t });

    try {
      // 3) Send to n8n webhook to get response
      const res = await fetch("https://rafaello.app.n8n.cloud/webhook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: requestId, chatInput: t }),
      });
      
      // 4) Parse the response
      const data = await res.json();
      const { output } = data;

      // 5) Save bot response to database
      await supabase
        .from(tableName)
        .insert({ request_id: requestId, sender: "bot", message: output });
      
      // 6) Add bot response to UI with typing animation
      setMsgs((m) => [...m, { 
        from: "bot", 
        text: output,
        isTyping: true  // This ensures typing animation for every bot message
      }]);
      setIsTypingAnimationActive(true);
    } catch (err) {
      console.error("Webhook error", err);
      
      // Even error messages should animate
      setMsgs((m) => [
        ...m,
        { 
          from: "bot", 
          text: "Oops, something went wrong.",
          isTyping: true  // Animation for error messages too
        },
      ]);
      setIsTypingAnimationActive(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-oxfordBlue rounded-2xl h-[300px] space-y-4 flex flex-col">
      <div ref={listRef} className="flex-1 overflow-auto">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`w-full p-3 rounded-lg whitespace-pre-wrap ${
              m.from === "user"
                ? "self-end bg-gentleGray/20 text-white"
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
                  // Mark this message as completed typing
                  setMsgs(prevMsgs => 
                    prevMsgs.map((msg, idx) => 
                      idx === i ? {...msg, isTyping: false} : msg
                    )
                  );
                  // checkTypingAnimations will be called via useEffect
                }}
              />
            ) : (
              m.text
            )}
          </div>
        ))}
        {busy && <div className="text-gray-400">{t("inline_chatbot.bot_typing")}</div>}
      </div>

      <div className="relative">
        <button className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <img src={AttachIcon} alt="attach" className="w-5 h-5" />
        </button>
        <input
          className="w-full h-10 bg-oxfordBlue border-2 border-darkGold rounded-full pl-10 pr-10 text-white"
          placeholder={isTypingAnimationActive ? t("inline_chatbot.input_placeholder_waiting") : t("inline_chatbot.input_placeholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => !isTypingAnimationActive && e.key === "Enter" && send()}
          disabled={busy || isTypingAnimationActive}
        />
        <button
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={send}
          disabled={busy || isTypingAnimationActive}
        >
          <img 
            src={SendIcon} 
            alt="send" 
            className={`w-5 h-5 ${(busy || isTypingAnimationActive) ? "opacity-50" : ""}`} 
          />
        </button>
      </div>
    </div>
  );
}