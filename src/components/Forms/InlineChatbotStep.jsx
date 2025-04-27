import React, { useState, useEffect, useRef } from "react";
import SendIcon from "../../assets/icons/Send.svg";
import AttachIcon from "../../assets/icons/Anexar.svg";
import { supabase } from "../../utils/supabaseClient";
import { format } from "date-fns";

export default function InlineChatbotStep({ requestId, tableName }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const [isNewChat, setIsNewChat] = useState(true);
  
  // Generate a context-specific welcome message based on the service type
  const getWelcomeMessage = async () => {
    try {
      let welcomeMessage = "Welcome! How can I help you today?";
      
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
          welcomeMessage = `Your consultation for ${formattedDate} (${data.duration_minutes} minutes) is confirmed! I'll be your pre-consultation assistant. Would you like to share what specific topics you'd like to discuss during your session?`;
        } else {
          welcomeMessage = "Your consultation has been scheduled! I'll be your pre-consultation assistant. Would you like to share what specific topics you'd like to discuss during your session?";
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
          
          welcomeMessage = `Welcome to your ${tier} coaching program! I'm your assistant and will connect you with Daniel. To make the most of your coaching experience, could you share what specific goals you're hoping to achieve?`;
        } else {
          welcomeMessage = "Welcome to your coaching program! I'm your assistant and will connect you with Daniel. To make the most of your coaching experience, could you share what specific goals you're hoping to achieve?";
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
          welcomeMessage = `Thank you for requesting our ${analysisType} analysis service! I'll be gathering some initial information to help us provide you with the most comprehensive analysis. Could you provide some specific details about what you'd like us to analyze?`;
        } else {
          welcomeMessage = "Thank you for requesting our analysis service! I'll be gathering some initial information to help us provide you with the most comprehensive analysis. Could you provide some specific details about what you'd like us to analyze?";
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
          welcomeMessage = `Thanks for your interest in the ${data.project} project! I'll be gathering some information to help prepare your pitch deck. Could you tell me a bit about what attracted you to this venture and what kind of investment you're considering?`;
        } else {
          welcomeMessage = "Thanks for your interest in our investment opportunities! I'll be gathering some information to help prepare your pitch deck. Could you tell me a bit about what attracted you to this venture and what kind of investment you're considering?";
        }
      }
      
      return welcomeMessage;
    } catch (err) {
      console.error("Error generating welcome message:", err);
      return "Welcome! How can I help you today?";
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
        };
        
        // Add welcome message to UI
        setMsgs([welcomeMessage]);
        
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
    if (!text.trim()) return;
    setBusy(true);
    const t = text.trim();
    setText("");

    // 1) Save user message
    await supabase
      .from(tableName)
      .insert({ request_id: requestId, sender: "user", message: t });
    setMsgs((m) => [...m, { from: "user", text: t }]);

    try {
      // 2) Send to n8n webhook using same payload as ChatbotWindow
      const res = await fetch("https://rafaello.app.n8n.cloud/webhook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: requestId, chatInput: t }),
      });
      // 3) Parse the response as JSON with `output`
      const data = await res.json();
      const { output } = data;

      // 4) Save bot reply
      await supabase
        .from(tableName)
        .insert({ request_id: requestId, sender: "bot", message: output });
      setMsgs((m) => [...m, { from: "bot", text: output }]);
    } catch (err) {
      console.error("Webhook error", err);
      setMsgs((m) => [
        ...m,
        { from: "bot", text: "Oops, something went wrong." },
      ]);
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
            {m.text}
          </div>
        ))}
        {busy && <div className="text-gray-400">bot is typing…</div>}
      </div>

      <div className="relative">
        <button className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <img src={AttachIcon} alt="attach" className="w-5 h-5" />
        </button>
        <input
          className="w-full h-10 bg-oxfordBlue border-2 border-darkGold rounded-full pl-10 pr-10 text-white"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={busy}
        />
        <button
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={send}
          disabled={busy}
        >
          <img src={SendIcon} alt="send" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}