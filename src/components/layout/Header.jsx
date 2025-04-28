// src/components/Header.jsx (modified)
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import DaGalowLogo from "../../assets/logos/DaGalow Logo.svg";
import Hamburger from "../../assets/icons/Hamburger.svg";
import userImage from "../../assets/img/Pessoas/Default.svg";
import { supabase } from "../../utils/supabaseClient";
import AuthModal from "../Auth/AuthModal";
import OctagonalProfile from "../common/Octagonal Profile";
import LanguageSwitcher from "../common/LanguageSwitcher"; // Import the language switcher

function useBreakpoint() {
  const getBreakpoint = () => {
    if (window.innerWidth >= 1024) return "lg";
    if (window.innerWidth >= 768) return "md";
    return "sm";
  };

  const [breakpoint, setBreakpoint] = useState(getBreakpoint());

  useEffect(() => {
    const handleResize = () => setBreakpoint(getBreakpoint());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const lastY = useRef(0);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Use translation hook

  const [avatarUrl, setAvatarUrl] = useState(null);

  const breakpoint = useBreakpoint();
  let profileSize;
  if (breakpoint === "lg") profileSize = 50; // or your desired lg size
  else if (breakpoint === "md") profileSize = 56; // md size
  else profileSize = 40; // mobile size

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (!error && data?.avatar_url) {
        setAvatarUrl(
          `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${data.avatar_url}`
        );
      }
    })();
  }, [user]);

  const handleProfileClick = () => {
    if (user) {
      // If user is logged in, navigate to profile
      window.location.href = "/profile";
    } else {
      // If user is not logged in, open auth modal
      setAuthModalOpen(true);
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <header
        className={`
          sticky flex items-center justify-between top-0 p-4 md:p-8 lg:p-10 left-0 right-0 z-30 h-14 md:h-24 lg:h-20 bg-black text-white shadow-lg
          transform transition-transform duration-300
          ${show ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div onClick={handleProfileClick} className="cursor-pointer">
          <OctagonalProfile
            size={profileSize}
            borderColor="#002147"
            innerBorderColor="#000"
            imageSrc={avatarUrl}
            fallbackText={user?.email?.[0]?.toUpperCase() || "?"}
          />
        </div>

        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <div
            onClick={handleLogoClick}
            className="focus:outline-none cursor-pointer"
          >
            <img
              src={DaGalowLogo}
              alt="DaGalow Logo"
              className="w-[150px] md:w-[275px] h-auto object-cover"
            />
          </div>
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="focus:outline-none"
        >
          <img src={Hamburger} alt="Hamburger" className="w-6 h-6 md:w-10 md:h-10 lg:w-8 lg:h-8" />
        </button>
      </header>

      {/* Dropdown Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[70%] md:w-[50%] lg:w-[30%] bg-black transform transition-transform duration-300 ease-in-out z-50
          ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white font-bold text-2xl md:text-4xl"
            >
              &times;
            </button>
          </div>

          {/* Menu links - now translated */}
          <div className="flex flex-col space-y-4 md:space-y-8">
            <Link
              to="/"
              className="text-white text-xl md:text-4xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t('navigation.home')}
            </Link>

            {/* Calendar link */}
            <Link
              to="/components/Subpages/Calendar"
              className="text-white text-xl md:text-4xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t('navigation.calendar')}
            </Link>

            {/* Music link */}
            <Link
              to="/components/Subpages/Music"
              className="text-white text-xl md:text-4xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t('navigation.music')}
            </Link>

            {/* Videos link */}
            <Link
              to="/components/Subpages/Videos"
              className="text-white text-xl md:text-4xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t('navigation.videos')}
            </Link>

            {/* Auth links in mobile menu */}
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-white text-xl md:text-4xl hover:text-gray-300 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('navigation.profile')}
                </Link>
                <Link
                  to="/components/Subpages/Settings"
                  className="text-white text-xl md:text-4xl hover:text-gray-300 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('navigation.settings')}
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="text-white text-xl md:text-4xl hover:text-gray-300 transition-colors text-left"
              >
                {t('navigation.login_signup')}
              </button>
            )}
          </div>
          <div className="mb-6 md:mt-12">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}

export default Header;
