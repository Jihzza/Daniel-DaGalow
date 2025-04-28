// Update NavigationBar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import home from '../../assets/icons/Home Branco.svg';
import calendar from '../../assets/icons/Calendar Branco.svg';
import chatbot from '../../assets/icons/Dagalow Branco.svg';
import settings from '../../assets/icons/Settings Branco.svg';
import account from '../../assets/icons/Profile Branco.svg';

const NavigationBar = ({ onChatbotClick, onAuthModalOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleDagalowIconClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

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
    {src: home, alt: "Home", action: handleDagalowIconClick},
    {src: calendar, alt: "Calendar", to: user ? "/components/Subpages/Calendar" : null, action: user ? null : onAuthModalOpen},
    {src: chatbot, alt: "Chatbot", action: onChatbotClick},
    {src: settings, alt: "Settings", to: user ? "/components/Subpages/Settings" : null, action: user ? null : onAuthModalOpen},
    {src: account, alt: "Account", action: handleAccountClick},
  ];
  
  return (
    <div className="fixed h-[56px] bottom-0 left-0 w-full px-8 lg:h-[80px] z-50 bg-black flex justify-between items-center">
      {icons.map((icon, i) => (
        <img
          key={i}
          src={icon.src}
          alt={icon.alt}
          className="w-8 h-8 md:w-12 md:h-12 lg:w-10 lg:h-10 cursor-pointer drop-shadow-lg transition-all duration-300"
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