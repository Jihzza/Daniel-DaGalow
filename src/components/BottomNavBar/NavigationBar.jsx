import React from 'react';
import {useNavigate} from 'react-router-dom';

import chatbot from '../../assets/icons/Dagalow Branco.svg';
import folder from '../../assets/icons/Stocks Branco.svg';
import contact from '../../assets/icons/Brain Branco.svg';
import dashboard from '../../assets/icons/Fitness Branco.svg';
import account from '../../assets/icons/PersonalTrainer Branco.svg';

const NavigationBar = ({ onChatbotClick }) => {
  const navigate = useNavigate();

  const icons = [
    {src: dashboard, alt: "Dashboard", to: "/"},
    {src: folder, alt: "Folder", to: "/"},
    {src: chatbot, alt: "Chatbot", action: onChatbotClick},
    {src: contact, alt: "Contact", to: "/"},
    {src: account, alt: "Account", to: "/"},
  ];
  
  return (
    <div className="fixed bottom-0 left-0 w-full py-3 px-8 z-50 bg-black flex justify-between items-center">
      {icons.map((icon, i) => (
        <img
          key={i}
          src={icon.src}
          alt={icon.alt}
          className="w-8 h-8 cursor-pointer drop-shadow-lg transition"
          onClick={() => icon.action ? icon.action() : navigate(icon.to)}
        />
      ))}
    </div>
  );
};

export default NavigationBar;