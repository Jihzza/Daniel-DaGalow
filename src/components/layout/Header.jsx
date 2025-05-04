import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import DaGalowLogo from "../../assets/logos/DaGalow Logo.svg";
import Hamburger from "../../assets/icons/Hamburger.svg";
import { supabase } from "../../utils/supabaseClient";
import AuthModal from "../Auth/AuthModal";
import OctagonalProfile from "../common/Octagonal Profile";

// Define language mapping with language codes and country codes for flags
const languageConfig = {
  en: { code: "US", name: "en" },
  pt: { code: "PT", name: "pt-pt" },
  "pt-BR": { code: "BR", name: "pt-br" },
  es: { code: "ES", name: "es" }
};

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
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const breakpoint = useBreakpoint();
  let profileSize = breakpoint === "lg" ? 50 : breakpoint === "md" ? 56 : 40;

  const currentLanguage = i18n.language || "en";
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
      window.location.href = "/profile";
    } else {
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

  // Function to get flag image for a language
  const getFlagImage = (langCode) => {
    const normalized = langCode.toLowerCase();
    // Handle Brazilian Portuguese explicitly
    if (normalized === "pt-br" || normalized === "br") {
      return (
        <img
          src="https://flagcdn.com/w40/br.png"
          alt="Brazilian flag"
          className="w-6 h-4 object-cover rounded-sm"
          onError={(e) => {
            console.error("Failed to load Brazilian flag");
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3C/svg%3E";
          }}
        />
      );
    }
    // Fallback to configured mapping
    const language = languageConfig[langCode] || languageConfig[normalized] || languageConfig.en;
    const countryCode = language.code.toLowerCase();
    return (
      <img
        src={`https://flagcdn.com/w40/${countryCode}.png`}
        alt={`${language.name} flag`}
        className="w-6 h-4 object-cover rounded-sm"
        onError={(e) => {
          console.error(`Failed to load flag for ${langCode}`);
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3C/svg%3E";
        }}
      />
    );
  };

  // Function to get language name
  const getLanguageName = (langCode) => {
    const normalized = langCode.toLowerCase();
    if (normalized === "pt-br" || normalized === "br") return "pt-br";
    return languageConfig[langCode]?.name || languageConfig[normalized]?.name || langCode.toUpperCase();
  };

  return (
    <>
      <header
        className={`fixed flex items-center justify-between top-0 p-4 md:p-8 lg:p-10 left-0 right-0 z-30 h-14 md:h-24 lg:h-20 bg-black text-white shadow-lg transform transition-transform duration-300 ${show ? "translate-y-0" : "-translate-y-full"}`}
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

        <div className="absolute right-4 md:right-8 lg:right-10 top-1/2 transform -translate-y-1/2 flex items-center gap-4">
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="focus:outline-none p-1 flex items-center justify-center"
              aria-label="Switch language"
            >
              {getFlagImage(currentLanguage)}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg z-50 min-w-[160px] overflow-hidden">
                {allLangs.map(lng => (
                  <button
                    key={lng}
                    onClick={() => { i18n.changeLanguage(lng); setLangOpen(false); }}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                  >
                    <span className="mr-3 flex-shrink-0">{getFlagImage(lng)}</span>
                    <span className="text-sm md:text-base">{getLanguageName(lng)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setMenuOpen(o => !o)} className="focus:outline-none">
            <img src={Hamburger} alt="Menu" className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>
      </header>
      {/* Dropdown Menu */}
      <div className={`fixed top-0 right-0 h-full w-[70%] md:w-[50%] lg:w-[30%] bg-black transform transition-transform duration-300 ease-in-out z-50 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}> ...
      </div>
      {menuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMenuOpen(false)} />}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

export default Header;
