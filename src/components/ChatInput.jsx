import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import sendIcon from "../assets/Send.svg";
import clipper from "../assets/Anexar.svg";
import search from "../assets/Habits Branco.svg";
import folder from "../assets/MoneyBag Branco.svg";
import contact from "../assets/Investment.svg";
import dashboard from "../assets/Heart Branco.svg";
import account from "../assets/Dating Branco.svg";
import { supabase } from "../utils/supabaseClient";

const ChatInput = ({ input = "", setInput, handleSubmit, isLoading = false }) => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [roundedStyle, setRoundedStyle] = useState("rounded-full");
  const [attachedFiles, setAttachedFiles] = useState([]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
    if (newHeight <= 42) setRoundedStyle("rounded-full");
    else if (newHeight <= 70) setRoundedStyle("rounded-3xl");
    else setRoundedStyle("rounded-2xl");
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleFocus = () => {
    setTimeout(() => {
      window.scrollTo(window.scrollX, window.scrollY);
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim() !== "") handleSubmitWithAttachments(e);
    }
  };

  const handleAttachClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => setAttachedFiles(prev => [...prev, ...Array.from(e.target.files)]);
  const handleRemoveFile = (i) => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i));

  const readFileAsText = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsText(file);
  });

  const handleSubmitWithAttachments = async (e) => {
    e.preventDefault();
    let uploadedFiles = [];
    for (let file of attachedFiles) {
      let content = null;
      if (file.name.endsWith('.js')) content = await readFileAsText(file);
      const path = `chat-attachments/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('attachments').upload(path, file);
      if (!error) {
        const { publicURL } = supabase.storage.from('attachments').getPublicUrl(path);
        uploadedFiles.push({ name: file.name, url: publicURL, content });
      }
    }
    handleSubmit(e, { text: input, attachments: uploadedFiles, isBot: false });
    setInput('');
    setAttachedFiles([]);
  };

  const isInputEmpty = !input.trim();

  return (
    <div className="fixed bottom-0 left-0 w-full p-2 z-50">
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {attachedFiles.map((file, idx) => (
            <div key={idx} className="relative">
              {file.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(file)} alt={file.name}
                  className="w-16 h-16 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-xs text-gray-800 bg-gray-200 rounded-lg shadow">
                  {file.name}
                </div>
              )}
              <button onClick={() => handleRemoveFile(idx)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmitWithAttachments}
        className={`flex items-center ${roundedStyle} bg-oxfordBlue border-2 border-darkGold px-4 py-2 shadow-lg`}
      >
        <button type="button" onClick={handleAttachClick}
          className={`flex-shrink-0 mr-2 ${isLoading ? 'opacity-50' : ''}`}>
          <img src={clipper} alt="Attach" className="w-5 h-5" />
        </button>
        <input type="file" multiple ref={fileInputRef} onChange={handleFileChange}
          style={{ display: 'none' }} />
        <textarea rows={1} ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown} onFocus={handleFocus}
          placeholder={isLoading ? 'AI is thinking...' : 'Type a message...'}
          className="flex-1 bg-transparent resize-none outline-none text-gray-800 placeholder-gray-500"
        />
        <button type="submit" disabled={isLoading || isInputEmpty}
          className={`flex-shrink-0 ml-2 ${isLoading || isInputEmpty ? 'cursor-not-allowed' : ''}`}>
          <img src={sendIcon} alt="Send" className="w-5 h-5 mb-1" />
        </button>
      </form>

      <div className="flex justify-around items-center mt-2">
        {[
          { src: dashboard, to: '/dashboard', alt: 'Dashboard' },
          { src: folder,    to: '/folder',    alt: 'Folder'    },
          { src: search,    to: '/search',    alt: 'Search'    },
          { src: contact,   to: '/contacts',  alt: 'Contacts'  },
          { src: account,   to: '/account',   alt: 'Account'   },
        ].map((icon, i) => (
          <img key={i} src={icon.src} alt={icon.alt}
            className="w-8 h-8 cursor-pointer hover:scale-110 transition" 
            onClick={() => navigate(icon.to)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatInput;