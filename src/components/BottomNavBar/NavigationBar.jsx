// Update NavigationBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import dagalowicon from '../../assets/icons/Dagalow Branco.svg';
import calendar from '../../assets/icons/Calendar Branco.svg';
import chatbot from '../../assets/icons/Chatbot Branco.svg';
import settings from '../../assets/icons/Settings Branco.svg';
import account from '../../assets/icons/Profile Branco.svg';

const NavigationBar = ({ onChatbotClick, onAuthModalOpen }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAccountClick = () => {
    if (user) {
      // If user is logged in, navigate to profile
      navigate('/profile');
    } else {
      // If user is not logged in, open auth modal
      onAuthModalOpen();
    }
  };

  const icons = [
    {src: dagalowicon, alt: "DaGalow", to: "/"},
    {src: calendar, alt: "Calendar", to: "/components/Subpages/Calendar"},
    {src: chatbot, alt: "Chatbot", action: onChatbotClick},
    {src: settings, alt: "Settings", to: user ? "/components/Subpages/Settings" : null, action: user ? null : onAuthModalOpen},
    {src: account, alt: "Account", action: handleAccountClick},
  ];
  
  return (
    <div className="fixed bottom-0 left-0 w-full py-4 px-8 z-50 bg-black flex justify-between items-center">
      {icons.map((icon, i) => (
        <img
          key={i}
          src={icon.src}
          alt={icon.alt}
          className="w-8 h-8 cursor-pointer drop-shadow-lg transition"
          onClick={() => {
            if (icon.action) {
              icon.action();
            } else if (icon.to) {
              navigate(icon.to);
            }
          }}
        />
      ))}
    </div>
  );
};

export default NavigationBar;