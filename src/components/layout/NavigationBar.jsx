// Update NavigationBar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import OctagonalProfile from '../common/Octagonal Profile';
import home from '../../assets/icons/Home Branco.svg';
import calendar from '../../assets/icons/Calendar Branco.svg';
import chatbot from '../../assets/icons/Dagalow Branco.svg';
import settings from '../../assets/icons/Settings Branco.svg';
import { useTranslation } from 'react-i18next';

const NavigationBar = ({ onChatbotClick, onAuthModalOpen }) => {
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

  const handleAccountClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      onAuthModalOpen();
    }
  };

  // Helper to get initials for fallback
  const getInitials = () => {
    if (!user) return '?';
    const name = user.user_metadata?.full_name || user.email || '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  const icons = [
    {src: home, alt: t("navigation.home"), action: handleDagalowIconClick},
    {src: calendar, alt: t("navigation.calendar"), to: user ? "/components/Subpages/Calendar" : null, action: user ? null : onAuthModalOpen},
    {src: chatbot, alt: t("navigation.chatbot"), action: onChatbotClick},
    {src: settings, alt: t("navigation.settings"), to: "/components/Subpages/Settings", action: null},
    // Profile icon will be handled separately below
  ];
  
  return (
    <div className="fixed h-[56px] bottom-0 left-0 w-full px-8 lg:px-10 lg:h-[60px] z-50 bg-black flex justify-between items-center">
      {icons.map((icon, i) => (
        <img
          key={i}
          src={icon.src}
          alt={icon.alt}
          aria-label={icon.alt}
          role="button"
          className="w-8 h-8 md:w-12 md:h-12 lg:w-8 lg:h-8 cursor-pointer drop-shadow-lg transition-all duration-300"
          onClick={() => {
            if (icon.action) {
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
            imageSrc={avatarUrl}
            fallbackText={user?.email?.[0]?.toUpperCase() || "?"}
            size={40}
          />
      </div>
    </div>
  );
};

export default NavigationBar;