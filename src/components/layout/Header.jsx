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
import { ReactComponent as GlobeIcon } from "../../assets/icons/Globe Branco.svg";

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
  const { i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const breakpoint = useBreakpoint();
  let profileSize;
  if (breakpoint === "lg") profileSize = 50; // or your desired lg size
  else if (breakpoint === "md") profileSize = 56; // md size
  else profileSize = 40; // mobile size
  const allLangs = (i18n.options.supportedLngs || [])
  .filter(l => l !== "cimode" && l !== "*");
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

  useEffect(() => {
    function onClick(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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
          fixed flex items-center justify-between top-0 p-4 md:p-8 lg:p-10 left-0 right-0 z-30 h-14 md:h-24 lg:h-20 bg-black text-white shadow-lg
          transform transition-transform duration-300
          ${show ? "translate-y-0" : "-translate-y-full"}
        `}
      >
         <div
        onClick={handleProfileClick}
        className="absolute left-4 md:left-8 lg:left-10 top-1/2 transform -translate-y-1/2 cursor-pointer"
      >
        <OctagonalProfile
          size={profileSize}
          borderColor="#002147"
          innerBorderColor="#000"
          imageSrc={avatarUrl}
          fallbackText={user?.email?.[0]?.toUpperCase() || "?"}
        />
      </div>

      {/* 2) Logo absolutely centered */}
      <div
        onClick={handleLogoClick}
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      >
        <img
          src={DaGalowLogo}
          alt="DaGalow Logo"
          className="w-[150px] md:w-[275px] h-auto object-cover"
        />
      </div>

      {/* 3) Globe + Hamburger on the right */}
      <div className="absolute right-4 md:right-8 lg:right-10 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(o => !o)}
            className="focus:outline-none p-1"
            aria-label="Switch language"
          >
            <GlobeIcon className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg z-50">
              {allLangs.map(lng => (
                <button
                  key={lng}
                  onClick={() => {
                    i18n.changeLanguage(lng);
                    setLangOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="focus:outline-none"
        >
          <img
            src={Hamburger}
            alt="Menu"
            className="w-6 h-6 md:w-8 md:h-8"
          />
        </button>
      </div>
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
              {t("navigation.home")}
            </Link>

            {/* Calendar link */}
            <Link
              to="/components/Subpages/Calendar"
              className="text-white text-xl md:text-4xl hover:text-gray-300 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t("navigation.calendar")}
            </Link>

            {/* Auth links in mobile menu */}
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-white text-xl md:text-4xl hover:text-gray-300 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("navigation.profile")}
                </Link>
                <Link
                  to="/components/Subpages/Settings"
                  className="text-white text-xl md:text-4xl hover:text-gray-300 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("navigation.settings")}
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
                {t("navigation.login_signup")}
              </button>
            )}
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
