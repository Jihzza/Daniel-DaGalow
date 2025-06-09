// src/pages/profile/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import OctagonalProfile from "../../components/common/Octagonal Profile";
import { useTranslation } from "react-i18next";
import defaultProfileIcon from '../../assets/img/Pessoas/Default.svg';
import { ChevronRight, Edit3 } from 'lucide-react';

export default function ProfilePage({ onChatOpen }) {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const getInitials = () => {
    if (!profile && !user) return '?';
    const name = profile?.full_name || user?.user_metadata?.full_name || user?.email || '';
    const parts = name.split(' ');
    if (parts.length === 0 || !parts[0]) return '?';
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const { data: pData, error: pError } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url, phone_number, role")
          .eq("id", user.id)
          .single();

        if (pError && pError.code !== 'PGRST116') {
          throw pError;
        }
        setProfile(pData);
        if (pData?.role === 'admin') {
            setIsAdmin(true);
        }
      } catch (err) {
        console.error("Error in fetchProfileData:", err);
        setError(err.message || "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  let displayAvatarUrl = defaultProfileIcon;
  if (profile?.avatar_url) {
    if (profile.avatar_url.startsWith('http')) {
      displayAvatarUrl = profile.avatar_url;
    } else if (profile.avatar_url.trim() !== '') {
      displayAvatarUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`;
    }
  } else if (user?.user_metadata?.avatar_url && user.user_metadata.avatar_url.startsWith('http')) {
    displayAvatarUrl = user.user_metadata.avatar_url;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const menuItems = [
    { label: "Appointments", path: "/profile/appointments" },
    { label: "Subscriptions", path: "/profile/subscriptions" },
    { label: "Pitch Deck Requests", path: "/profile/pitch-decks" },
    { label: "Chatbot History", path: "/profile/chat-history" },
    { label: "Account & Settings", path: "/settings" },
  ];
  
  const adminMenuItems = isAdmin ? [
    { label: "User Management", path: "/admin/users" },
    { label: "Testimonial Review", path: "/admin/testimonials" },
    { label: "Bug Reports", path: "/admin/bugs" },
  ] : [];

  if (loading) {
    return (
      <main className="mt-14 md:mt-24 lg:mt-20">
        <div className="flex justify-center items-center min-h-[calc(100vh-136px)]">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-2 border-t-transparent border-oxfordBlue"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
       <main className="mt-14 md:mt-24 lg:mt-20">
        <div className="py-12 px-6 min-h-screen">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 m-4 rounded-lg text-center">
            <h3 className="font-bold text-lg">{t("profile.error.title")}</h3>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mt-14 md:mt-24 lg:mt-20">
      <div className="min-h-screen bg-white">
        {/* Profile Header */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <OctagonalProfile
            size={64}
            borderColor="#002147"
            innerBorderColor="#FFFFFF"
            imageSrc={displayAvatarUrl}
            fallbackText={getInitials()}
          />
          <div className="ml-4 flex-grow">
            <h2 className="text-xl font-bold text-gray-800">
              {profile?.full_name || user?.user_metadata?.full_name || t("profile.unnamed")}
            </h2>
            <p className="text-sm text-gray-500">
              {profile?.phone_number || "No phone number"}
            </p>
          </div>
          <Link to="/edit-profile" className="p-2 text-gray-600 hover:text-oxfordBlue">
            <Edit3 size={20} />
          </Link>
        </div>

        {/* Menu List */}
        <nav className="flex flex-col">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
                <span className="text-lg text-gray-700">{item.label}</span>
                <ChevronRight size={20} className="text-gray-400" />
            </Link>
          ))}
          {isAdmin && (
              <div className="pt-2">
                 {adminMenuItems.map((item) => (
                    <Link
                    key={item.label}
                    to={item.path}
                    className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-lg text-gray-700">{item.label}</span>
                        <ChevronRight size={20} className="text-gray-400" />
                    </Link>
                 ))}
              </div>
          )}
           <button
            onClick={handleSignOut}
            className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors w-full text-left"
          >
            <span className="text-lg text-gray-700">Logout</span>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </nav>
      </div>
    </main>
  );
}
