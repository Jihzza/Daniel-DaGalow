// src/components/Header.jsx (modified)
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import DaGalowLogo from "../assets/logos/DaGalow Logo.svg";
import Hamburger from "../assets/icons/Hamburger.svg";
import userImage from "../assets/img/Pessoas/Default.svg";
import { supabase } from "../utils/supabaseClient";
import AuthModal from "./Auth/AuthModal";
import OctagonalProfile from "./Subpages/Octagonal Profile";
import LanguageSwitcher from "./UI/LanguageSwitcher"; // Import the language switcher

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
          fixed flex items-center justify-between top-0 p-4 left-0 right-0 z-30 h-14 bg-black text-white shadow-lg
          transform transition-transform duration-300
          ${show ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div onClick={handleProfileClick} className="cursor-pointer">
          <OctagonalProfile
            size={40} // adjust to header height
            borderColor="#002147" // match your theme
            innerBorderColor="#000" // see previous answer
            imageSrc={avatarUrl} // null → fallback
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
              className="w-[150px] h-auto object-cover hover:opacity-90 transition-opacity duration-300"
            />
          </div>
        </div>

        {/* Auth links - visible on desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <button
              onClick={() => signOut()}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {t("logout")} {/* Translate logout text */}
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="bg-darkGold text-black px-3 py-1 rounded hover:bg-opacity-90 transition-colors"
            >
              {t("login")} {/* Translate login text */}
            </button>
          )}
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden focus:outline-none"
        >
          <img src={Hamburger} alt="Hamburger" className="w-6 h-6" />
        </button>
      </header>

      {/* Dropdown Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[70%] bg-black transform transition-transform duration-300 ease-in-out z-50
          ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white text-2xl"
            >
              &times;
            </button>
          </div>

          {/* Language Switcher in dropdown menu */}

          {/* Menu links - now translated */}
          <div className="flex flex-col space-y-4">
            <Link
              to="/"
              className="text-white text-xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t('navigation.home')}
            </Link>

            {/* Calendar link */}
            <Link
              to="/components/Subpages/Calendar"
              className="text-white text-xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t('navigation.calendar')}
            </Link>

            {/* Music link */}
            <Link
              to="/components/Subpages/Music"
              className="text-white text-xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t('navigation.music')}
            </Link>

            {/* Videos link */}
            <Link
              to="/components/Subpages/Videos"
              className="text-white text-xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t('navigation.videos')}
            </Link>

            {/* Auth links in mobile menu */}
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-white text-xl hover:text-gray-300 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('navigation.profile')}
                </Link>
                <Link
                  to="/components/Subpages/Settings"
                  className="text-white text-xl hover:text-gray-300 transition-colors"
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
                className="text-white text-xl hover:text-gray-300 transition-colors text-left"
              >
                {t('navigation.login_signup')}
              </button>
            )}
          </div>
          <div className="mb-6">
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
