// Update NavigationBar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import OctagonalProfile from '../common/Octagonal Profile';
import casa from '../../assets/icons/House Branco.svg';
import calendar from '../../assets/icons/Calendar Branco.svg';
import chatbot from '../../assets/icons/Dagalow Branco.svg';
import messagesIcon from '../../assets/icons/Messages Branco.svg'; // Import messages icon

import { useTranslation } from 'react-i18next';
import defaultProfile from '../../assets/img/Pessoas/Default.svg';

const NavigationBar = ({ onChatbotClick, onAuthModalOpen, isChatbotOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      if (!error && data?.avatar_url) {
        setAvatarUrl(
          `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${data.avatar_url}`
        );
      } else {
        setAvatarUrl(null);
      }
    })();
  }, [user]);

  const handleDagalowIconClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  // Updated handleAccountClick
  const handleAccountClick = () => {
    if (isChatbotOpen) {
      onChatbotClick(); // This should be the toggle function, so it closes the chatbot
    }
    if (user) {
      navigate('/profile');
    } else {
      if (typeof onAuthModalOpen === 'function') {
        onAuthModalOpen();
      }
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    const name = user.user_metadata?.full_name || user.email || '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  const icons = [
    { id: 'home', src: casa, alt: t("navigation.home"), action: handleDagalowIconClick, size: 26 },
    { id: 'calendar', src: calendar, alt: t("navigation.calendar"), to: user ? "/components/Subpages/Calendar" : null, action: user ? null : onAuthModalOpen, size: 24 },
    { id: 'chatbot', src: chatbot, alt: t("navigation.chatbot"), action: onChatbotClick, size: 24 },
    { id: 'messages', src: messagesIcon, alt: t("navigation.messages"), to: user ? "/messages" : null, action: user ? null : onAuthModalOpen, size: 24 },
  ];
  
  return (
    <div className="fixed h-[48px] bottom-0 left-0 w-full px-8 lg:px-10 lg:h-[60px] z-50 bg-black flex justify-between items-center">
      {icons.map((icon, i) => (
        <img
          key={icon.id || i} // Use a stable key like id
          src={icon.src}
          alt={icon.alt}
          aria-label={icon.alt}
          role="button"
          style={{ width: icon.size, height: icon.size }}
          className="cursor-pointer drop-shadow-lg transition-all duration-300"
          onClick={() => {
            // If any icon OTHER than the chatbot icon is clicked AND the chatbot is open, close it.
            if (isChatbotOpen && icon.id !== 'chatbot') {
              onChatbotClick(); // This is the toggle function, so it will close the chatbot.
            }

            // Perform the icon's specific action.
            // For the chatbot icon, its action (onChatbotClick) IS the toggle.
            // For other icons, their action is performed (or navigation occurs).
            if (icon.action && typeof icon.action === 'function') {
              icon.action();
            } else if (icon.to) {
              navigate(icon.to);
            }
          }}
        />
      ))}
      {/* Profile Octagonal Avatar */}
      <div role="button" aria-label={t('navigation.account')} onClick={handleAccountClick} className="cursor-pointer">
      <OctagonalProfile
            borderColor="#002147"
            innerBorderColor="#000"
            imageSrc={avatarUrl || defaultProfile}
            fallbackText={getInitials()} // Use getInitials for fallback
            size={32}
          />
      </div>
    </div>
  );
};

export default NavigationBar;