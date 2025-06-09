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

// Constants for responsive icon sizing
const ICON_SIZE_DEFAULT_PX = 26;
const ICON_SIZE_ACTIVE_MOBILE_PX = 22; // Smaller size for the active icon on mobile
const PROFILE_ICON_SIZE_DEFAULT_PX = 28;
const PROFILE_ICON_SIZE_ACTIVE_MOBILE_PX = 24;

// Helper hook to detect if the view is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

// Helper to construct Supabase avatar URL
const getSupabaseAvatarUrl = (avatarPath) =>
  `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`;

const NavigationBar = ({
  onChatbotClick,
  onAuthModalOpen,
  isChatbotOpen,
  showChatbotIconNotification,
  unreadMessagesCount,
}) => {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

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
        if (error && error.code !== 'PGRST116') throw error;
        if (dbProfile) {
          newFullName = dbProfile.full_name || newFullName;
          if (dbProfile.avatar_url) {
            newAvatarUrl = dbProfile.avatar_url.startsWith('http')
              ? dbProfile.avatar_url
              : getSupabaseAvatarUrl(dbProfile.avatar_url);
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

  const handleMessagesClick = useCallback(() => {
    handleCloseChatbotIfNeeded();
    if (user) {
        if (location.pathname === '/messages') {
            // If already on the messages page, send a signal to reset the view to the list.
            navigate('/messages', { state: { forceList: true }, replace: true });
        } else {
            // Otherwise, just navigate to the messages page.
            navigate('/messages');
        }
    } else if (typeof onAuthModalOpen === 'function') {
        // If not logged in, open the authentication modal.
        onAuthModalOpen();
    }
  }, [user, location.pathname, navigate, onAuthModalOpen, handleCloseChatbotIfNeeded]);

  // Data for nav items
  const navItems = [
    { id: 'home', type: 'image', src: casaIcon, altKey: "navigation.home", labelKey: "navigation.home", path: "/", action: handleHomeNavigation },
    { id: 'calendar', type: 'image', src: calendarIcon, altKey: "navigation.calendar", labelKey: "navigation.calendar", path: "/components/Subpages/Calendar", action: () => navigateToPathOrOpenAuth("/components/Subpages/Calendar") },
    { id: 'chatbot', type: 'imageWithNotification', src: chatbotIcon, altKey: "navigation.chatbot", labelKey: "navigation.chatbot", path: null, action: handleChatbotToggle, showNotification: showChatbotIconNotification },
    { id: 'messages', type: 'image', src: messagesIcon, altKey: "navigation.messages", labelKey: "navigation.messages", path: "/messages", action: handleMessagesClick },
    { id: 'account', type: 'profile', altKey: 'navigation.profile', labelKey: 'navigation.profile', path: "/profile", action: handleAccountClick },
  ];

  return (
    <div className="fixed h-[48px] bottom-0 left-0 w-full px-3 lg:px-4 lg:h-[60px] z-50 bg-black flex justify-evenly items-center">
      {navItems.map((item) => {
        
        let isActive = false;
        if (isChatbotOpen) {
          isActive = item.id === 'chatbot';
        } else {
          isActive = 
            (item.id === 'home' && location.pathname === '/') ||
            (item.path && item.path !== '/' && location.pathname.startsWith(item.path));
        }

        const translatedLabel = t(item.labelKey);

        const iconSize = isMobile && isActive ? ICON_SIZE_ACTIVE_MOBILE_PX : ICON_SIZE_DEFAULT_PX;
        const profileIconSize = isMobile && isActive ? PROFILE_ICON_SIZE_ACTIVE_MOBILE_PX : PROFILE_ICON_SIZE_DEFAULT_PX;

        return (
          <button
            key={item.id}
            onClick={item.action}
            className="flex flex-col items-center justify-center h-full min-h-full flex-1 text-white transition-colors duration-200"
            aria-label={translatedLabel}
          >
            <div className="relative">
              {item.type === 'profile' ? (
                <OctagonalProfile
                  borderColor="#002147" 
                  innerBorderColor="#000"   
                  imageSrc={profileDisplayData.imageSrc}
                  fallbackText={getInitials()} 
                  size={profileIconSize}
                />
              ) : (
                <img
                  src={item.src}
                  alt={t(item.altKey)}
                  style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                  className="cursor-pointer drop-shadow-lg"
                />
              )}
               {item.type === 'imageWithNotification' && item.showNotification && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-black animate-pulse"></span>
               )}
              {item.id === 'messages' && unreadMessagesCount > 0 && (
                 <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-black"></span>
              )}
            </div>
            
            {isActive && (
              <span className="text-xs text-white whitespace-nowrap">
                {translatedLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default NavigationBar;