// src/components/layout/NavigationBar.jsx

// React & Hooks
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Contexts & Utils
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { useTranslation } from 'react-i18next';

// Components & Assets
import OctagonalProfile from '../common/Octagonal Profile';
import casaIcon from '../../assets/icons/House Branco.svg';
import calendarIcon from '../../assets/icons/Calendar Branco.svg';
import chatbotIcon from '../../assets/icons/Dagalow Branco.svg';
import messagesIcon from '../../assets/icons/Messages Branco.svg';
import defaultProfileIcon from '../../assets/img/Pessoas/Default.svg';

// Constants
const ICON_SIZE_PX = 26; 
const PROFILE_ICON_SIZE_PX = 26;

// Helper to construct Supabase avatar URL
const getSupabaseAvatarUrl = (avatarPath) =>
  `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`;

const NavigationBar = ({
  onChatbotClick,
  onAuthModalOpen,
  isChatbotOpen,
  showChatbotIconNotification,
}) => {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  // State
  const [profileDisplayData, setProfileDisplayData] = useState({
    imageSrc: defaultProfileIcon,
    fullName: '',
  });

  // Effect to fetch profile data
  useEffect(() => {
    const fetchAndSetProfileData = async () => {
      if (!user?.id) {
        setProfileDisplayData({ imageSrc: defaultProfileIcon, fullName: '' });
        return;
      }

      let newAvatarUrl = defaultProfileIcon;
      let newFullName = user.user_metadata?.full_name || '';

      try {
        const { data: dbProfile, error } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching profile for navbar:", error.message);
        } else if (dbProfile) {
          newFullName = dbProfile.full_name || newFullName;
          if (dbProfile.avatar_url) {
            if (dbProfile.avatar_url.startsWith('http')) {
              newAvatarUrl = dbProfile.avatar_url;
            } else if (dbProfile.avatar_url.trim() !== '') {
              newAvatarUrl = getSupabaseAvatarUrl(dbProfile.avatar_url);
            }
          }
        }
        
        if (newAvatarUrl === defaultProfileIcon && user.user_metadata?.avatar_url?.startsWith('http')) {
          newAvatarUrl = user.user_metadata.avatar_url;
        }
        
        setProfileDisplayData({ imageSrc: newAvatarUrl, fullName: newFullName });

      } catch (e) {
        console.error("Exception fetching profile data for navbar:", e);
        const fallbackUserAvatar = user.user_metadata?.avatar_url?.startsWith('http')
          ? user.user_metadata.avatar_url
          : defaultProfileIcon;
        setProfileDisplayData({ imageSrc: fallbackUserAvatar, fullName: newFullName });
      }
    };

    fetchAndSetProfileData();
  }, [user]);

  // Memoized helper functions
  const getInitials = useCallback(() => {
    const name = profileDisplayData.fullName || user?.email || '';
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  }, [profileDisplayData.fullName, user?.email]);

  // Memoized event handlers
  const handleCloseChatbotIfNeeded = useCallback(() => {
    if (isChatbotOpen && typeof onChatbotClick === 'function') {
      onChatbotClick();
    }
  }, [isChatbotOpen, onChatbotClick]);
  
  const handleHomeNavigation = useCallback(() => {
    handleCloseChatbotIfNeeded();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  }, [location.pathname, navigate, handleCloseChatbotIfNeeded]);

  const navigateToPathOrOpenAuth = useCallback((path) => {
    handleCloseChatbotIfNeeded();
    if (user) {
      navigate(path);
    } else if (typeof onAuthModalOpen === 'function') {
      onAuthModalOpen();
    }
  }, [user, navigate, onAuthModalOpen, handleCloseChatbotIfNeeded]);

  const handleAccountClick = useCallback(() => {
    handleCloseChatbotIfNeeded();
    if (user) {
      navigate('/profile');
    } else if (typeof onAuthModalOpen === 'function') {
      onAuthModalOpen();
    }
  }, [user, navigate, onAuthModalOpen, handleCloseChatbotIfNeeded]);

  const handleChatbotToggle = useCallback(() => {
    if (typeof onChatbotClick === 'function') {
      onChatbotClick();
    }
  }, [onChatbotClick]);

  // Function to generate common props for icon images
  const commonIconProps = (altText) => ({
    role: "button",
    "aria-label": altText,
    style: { width: `${ICON_SIZE_PX}px`, height: `${ICON_SIZE_PX}px` },
    className: "cursor-pointer drop-shadow-lg transition-all duration-300",
  });

  // Unified list of navigation items for even distribution
  const navItems = [
    { 
      id: 'home', 
      type: 'image', 
      src: casaIcon, 
      altKey: "navigation.home", 
      action: handleHomeNavigation 
    },
    { 
      id: 'calendar', 
      type: 'image', 
      src: calendarIcon, 
      altKey: "navigation.calendar", 
      action: () => navigateToPathOrOpenAuth("/components/Subpages/Calendar") 
    },
    { 
      id: 'chatbot', 
      type: 'imageWithNotification', 
      src: chatbotIcon, 
      altKey: "navigation.chatbot", 
      action: handleChatbotToggle,
      showNotification: showChatbotIconNotification
    },
    { 
      id: 'messages', 
      type: 'image', 
      src: messagesIcon, 
      altKey: "navigation.messages", 
      action: () => navigateToPathOrOpenAuth("/messages") 
    },
    { 
      id: 'account', 
      type: 'profile', 
      altKey: 'navigation.account', 
      action: handleAccountClick 
    },
  ];

  return (
    <div className="fixed h-[48px] bottom-0 left-0 w-full px-2 lg:px-4 lg:h-[60px] z-50 bg-black flex justify-evenly items-center"> {/* Changed padding to px-2 lg:px-4 */}
      {navItems.map((item) => {
        const translatedAlt = t(item.altKey);
        switch (item.type) {
          case 'image':
            return (
              <img
                key={item.id}
                src={item.src}
                alt={translatedAlt}
                {...commonIconProps(translatedAlt)}
                onClick={item.action}
              />
            );
          case 'imageWithNotification':
            return (
              <div key={item.id} className="relative">
                <img
                  src={item.src}
                  alt={translatedAlt}
                  {...commonIconProps(translatedAlt)}
                  onClick={item.action}
                />
                {item.showNotification && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-black animate-pulse"></span>
                )}
              </div>
            );
          case 'profile':
            return (
              <div
                key={item.id}
                role="button"
                aria-label={translatedAlt}
                onClick={item.action}
                className="cursor-pointer"
              >
                <OctagonalProfile
                  borderColor="#002147" 
                  innerBorderColor="#000"   
                  imageSrc={profileDisplayData.imageSrc}
                  fallbackText={getInitials()} 
                  size={PROFILE_ICON_SIZE_PX}
                />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default NavigationBar;