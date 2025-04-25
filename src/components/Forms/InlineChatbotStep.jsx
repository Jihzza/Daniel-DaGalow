import React, { useState, useEffect, useRef } from "react";
import SendIcon from "../../assets/icons/Send.svg";
import AttachIcon from "../../assets/icons/Anexar.svg";
import { supabase } from "../../utils/supabaseClient";

export default function InlineChatbotStep({ requestId, tableName }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

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
      setMsgs(
        data.map((d) => ({
          from: d.sender === "user" ? "user" : "bot",
          text: d.message,
        }))
      );
    })();
  }, [requestId, tableName]);

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
      <div ref={listRef} className="flex-1 overflow-auto space-y-2 p-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
              m.from === "user"
                ? "self-end bg-darkGold text-white"
                : "self-start bg-white/20 text-black"
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
