// src/components/layout/NavigationBar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import OctagonalProfile from '../common/Octagonal Profile';
import casa from '../../assets/icons/House Branco.svg';
import calendar from '../../assets/icons/Calendar Branco.svg';
import chatbot from '../../assets/icons/Dagalow Branco.svg';
import messagesIcon from '../../assets/icons/Messages Branco.svg';
import { useTranslation } from 'react-i18next';
import defaultProfileIcon from '../../assets/img/Pessoas/Default.svg'; // Ensure this path is correct

const NavigationBar = ({ onChatbotClick, onAuthModalOpen, isChatbotOpen, showChatbotIconNotification }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Store both avatarUrl and fullName for initials
  const [profileDisplayData, setProfileDisplayData] = useState({
    imageSrc: defaultProfileIcon, // Start with default
    fullName: ''
  });

  useEffect(() => {
    if (!user?.id) {
      setProfileDisplayData({ imageSrc: defaultProfileIcon, fullName: '' }); // Reset on logout
      return;
    }

    const fetchNavProfileData = async () => {
      try {
        const { data: profileFromDB, error } = await supabase
          .from('profiles')
          .select('avatar_url, full_name') // Fetch full_name too for initials
          .eq('id', user.id)
          .single(); // Use single to get one row or null

        let determinedAvatarUrl = defaultProfileIcon; // Default to your SVG icon
        let currentFullName = user.user_metadata?.full_name || ''; // Start with metadata name

        if (error && error.code !== 'PGRST116') { // PGRST116 means no row was found
          console.error("Error fetching profile for navbar:", error.message);
        } else if (profileFromDB) { // Profile row exists
          currentFullName = profileFromDB.full_name || currentFullName; // Prefer name from profiles table
          if (profileFromDB.avatar_url) {
            if (profileFromDB.avatar_url.startsWith('http')) {
              // It's a full URL (e.g., Google's)
              determinedAvatarUrl = profileFromDB.avatar_url;
            } else if (profileFromDB.avatar_url.trim() !== '') {
              // It's a path in Supabase storage
              determinedAvatarUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${profileFromDB.avatar_url}`;
            }
            // If profileFromDB.avatar_url is an empty string, determinedAvatarUrl remains defaultProfileIcon
          }
        }
        
        // If after checking profiles table, we still don't have a specific avatar,
        // try the user_metadata (primary for new OAuth users before profile trigger might run)
        if (determinedAvatarUrl === defaultProfileIcon && user.user_metadata?.avatar_url && user.user_metadata.avatar_url.startsWith('http')) {
            determinedAvatarUrl = user.user_metadata.avatar_url;
        }

        setProfileDisplayData({
          imageSrc: determinedAvatarUrl,
          fullName: currentFullName
        });

      } catch (e) {
        console.error("Exception fetching profile data for navbar:", e);
        // Fallback to default icon and metadata name in case of any other error
        setProfileDisplayData({
            imageSrc: user.user_metadata?.avatar_url && user.user_metadata.avatar_url.startsWith('http') ? user.user_metadata.avatar_url : defaultProfileIcon,
            fullName: user.user_metadata?.full_name || ''
        });
      }
    };

    fetchNavProfileData();
  }, [user]); // Rerun when user object changes

  const handleDagalowIconClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const handleAccountClick = () => {
    if (isChatbotOpen) {
      onChatbotClick();
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
    // Use fullName from profileDisplayData state, then fallback
    const name = profileDisplayData.fullName || user?.email || '';
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 0 || !parts[0]) return '?';
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  const icons = [
    { id: 'home', src: casa, alt: t("navigation.home"), action: handleDagalowIconClick, size: 26 },
    { id: 'messages', src: messagesIcon, alt: t("navigation.messages"), to: user ? "/messages" : null, action: user ? null : onAuthModalOpen, size: 24 },
  ];
  
  return (
    <div className="fixed h-[48px] bottom-0 left-0 w-full px-8 lg:px-10 lg:h-[60px] z-50 bg-black flex justify-between items-center">
      {/* Left side icons */}
      <div className="flex gap-8">
        {icons.map((icon, i) => (
          <img
            key={icon.id || i}
            src={icon.src}
            alt={icon.alt}
            aria-label={icon.alt}
            role="button"
            style={{ width: icon.size, height: icon.size }}
            className="cursor-pointer drop-shadow-lg transition-all duration-300"
            onClick={() => {
              if (isChatbotOpen && icon.id !== 'chatbot') {
                onChatbotClick(); 
              }
              if (icon.action && typeof icon.action === 'function') {
                icon.action();
              } else if (icon.to) {
                navigate(icon.to);
              }
            }}
          />
        ))}
      </div>
      
      {/* Center Chatbot Icon with Notification Dot */}
      <div className="relative">
        <img
          src={chatbot}
          alt={t("navigation.chatbot")}
          aria-label={t("navigation.chatbot")}
          role="button"
          style={{ width: 24, height: 24 }}
          className="cursor-pointer drop-shadow-lg transition-all duration-300"
          onClick={() => {
            onChatbotClick();
          }}
        />
        {showChatbotIconNotification && (
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-black animate-pulse"></span>
        )}
      </div>

      {/* Right side icons */}
      <div className="flex gap-8">
        <img
          src={calendar}
          alt={t("navigation.calendar")}
          aria-label={t("navigation.calendar")}
          role="button"
          style={{ width: 24, height: 24 }}
          className="cursor-pointer drop-shadow-lg transition-all duration-300"
          onClick={() => {
            if (isChatbotOpen) {
              onChatbotClick();
            }
            if (user) {
              navigate("/components/Subpages/Calendar");
            } else {
              onAuthModalOpen();
            }
          }}
        />
        <div role="button" aria-label={t('navigation.account')} onClick={handleAccountClick} className="cursor-pointer">
          <OctagonalProfile
            borderColor="#002147"
            innerBorderColor="#000"
            imageSrc={profileDisplayData.imageSrc}
            fallbackText={getInitials()} 
            size={32}
          />
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;