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

/**
 * Helper hook to get the current responsive breakpoint.
 * This allows the component to adapt its styling for mobile, tablet, and desktop.
 * @returns {'sm' | 'md' | 'lg'} The current breakpoint.
 */
function useBreakpoint() {
  const getBreakpoint = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 'lg';
      if (window.innerWidth >= 768) return 'md';
    }
    return 'sm';
  };

  const [breakpoint, setBreakpoint] = useState(getBreakpoint());

  useEffect(() => {
    const handleResize = () => setBreakpoint(getBreakpoint());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
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
  unreadChatbotMessagesCount,
}) => {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const breakpoint = useBreakpoint(); // Use the new responsive breakpoint hook

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

  const handleNavClick = useCallback((path) => {
    handleCloseChatbotIfNeeded();
    if (user) {
      // If the user is on the page they are trying to navigate to, go back.
      if (location.pathname === path) {
        navigate(-1);
      } else {
        navigate(path);
      }
    } else if (typeof onAuthModalOpen === 'function') {
      // If not logged in, open the authentication modal.
      onAuthModalOpen();
    }
  }, [user, location.pathname, navigate, onAuthModalOpen, handleCloseChatbotIfNeeded]);

  const handleChatbotToggle = useCallback(() => {
    if (typeof onChatbotClick === 'function') {
      onChatbotClick();
    }
  }, [onChatbotClick]);

  // Data for nav items
  const navItems = [
    { id: 'home', type: 'image', src: casaIcon, altKey: "navigation.home", labelKey: "navigation.home", path: "/", action: handleHomeNavigation },
    { id: 'calendar', type: 'image', src: calendarIcon, altKey: "navigation.calendar", labelKey: "navigation.calendar", path: "/components/Subpages/Calendar", action: () => handleNavClick("/components/Subpages/Calendar") },
    { id: 'chatbot', type: 'imageWithNotification', src: chatbotIcon, altKey: "navigation.chatbot", labelKey: "navigation.chatbot", path: null, action: handleChatbotToggle, showNotification: showChatbotIconNotification },
    { id: 'messages', type: 'image', src: messagesIcon, altKey: "navigation.messages", labelKey: "navigation.messages", path: "/messages", action: () => handleNavClick("/messages") },
    { id: 'account', type: 'profile', altKey: 'navigation.profile', labelKey: 'navigation.profile', path: "/profile", action: () => handleNavClick("/profile") },
  ];

  return (
    <div className="fixed h-[48px] md:h-[54px] lg:h-[60px] bottom-0 left-0 w-full px-3 lg:px-4 z-50 bg-black flex justify-evenly items-center">
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

        // --- RESPONSIVE SIZING LOGIC ---
        // 1. Determine the base (inactive) icon size based on the current breakpoint.
        let baseIconSize;
        switch (breakpoint) {
          case 'lg':
            baseIconSize = 30; // Larger icons for desktop
            break;
          case 'md':
            baseIconSize = 28; // Medium icons for tablet
            break;
          default: // 'sm'
            baseIconSize = 26; // Default icons for mobile
        }

        // 2. When active, shrink the icon to make space for the label.
        //    The profile icon is consistently larger than the other icons.
        const iconSize = isActive ? baseIconSize - 4 : baseIconSize;
        const profileIconSize = iconSize + 2;
        // --- END OF SIZING LOGIC ---

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
                  className="cursor-pointer drop-shadow-lg transition-all duration-200"
                />
              )}
               {item.type === 'imageWithNotification' && item.showNotification && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-black animate-pulse"></span>
               )}
              
              {/* === MODIFIED SECTION START === */}
              {item.id === 'messages' && unreadMessagesCount > 0 && (
                 <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-black">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                 </span>
               )}
               {item.id === 'chatbot' && unreadChatbotMessagesCount > 0 && (
                 <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-black">
                    {unreadChatbotMessagesCount > 9 ? '9+' : unreadChatbotMessagesCount}
                 </span>
               )}
            
              {/* === MODIFIED SECTION END === */}
            </div>
            
            {isActive && (
              <span className="text-[10px] mt-[2px] md:text-xs lg:text-sm text-white whitespace-nowrap">
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