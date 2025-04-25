// src/components/InlineChatbotStep.jsx
import React, { useState, useEffect, useRef } from "react";
import SendIcon from "../../assets/icons/Send.svg";
import AttachIcon from "../../assets/icons/Anexar.svg";
import { supabase } from "../../utils/supabaseClient";

export default function InlineChatbotStep({ requestId, tableName }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

  // load existing
  useEffect(() => {
    if (!requestId) return;
    (async () => {
      const { data } = await supabase
        .from(tableName)
        .select("sender, message, created_at")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });
      if (data) {
        setMsgs(data.map(d => ({
          from: d.sender === "user" ? "user" : "bot",
          text: d.message
        })));
      }
    })();
  }, [requestId, tableName]);

  // scroll
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs, busy]);

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const t = text.trim();
    setText("");
    // save user
    await supabase.from(tableName).insert({ request_id: requestId, sender: "user", message: t });
    setMsgs(m => [...m, { from: "user", text: t }]);

    try {
      const res = await fetch(process.env.REACT_APP_N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, chatInput: t })
      });
      const { output } = await res.json();
      await supabase.from(tableName).insert({ request_id: requestId, sender: "bot", message: output });
      setMsgs(m => [...m, { from: "bot", text: output }]);
    } catch {
      setMsgs(m => [...m, { from: "bot", text: "Oops, something went wrong." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-oxfordBlue rounded-2xl h-[300px] space-y-4 flex flex-col">
      <div ref={listRef} className="flex-1 overflow-auto space-y-2">
        {msgs.map((m,i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[80%] ${m.from==="user" ? "self-end bg-darkGold text-white" : "self-start bg-white/20 text-black"}`}>
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="text-gray-400">bot is typing…</div>
        )}
      </div>
      <div className="relative ">
        <button className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <img src={AttachIcon} alt="attach" className="w-5 h-5"/>
        </button>
        <input
          className="w-full h-10 bg-oxfordBlue border-2 border-darkGold rounded-full pl-10 pr-10 text-white"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key==="Enter" && send()}
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
