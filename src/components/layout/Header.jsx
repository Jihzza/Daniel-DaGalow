// src/components/layout/Header.jsx
// src/components/layout/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import DaGalowLogo from "../../assets/logos/DaGalow Logo.svg";
import Hamburger from "../../assets/icons/Hamburger.svg";
import AuthModal from "../Auth/AuthModal";
import SettingsIcon from "../../assets/icons/Settings Branco.svg";
import NotificationsIcon from "../../assets/icons/notifications white.svg";

// Define language mapping with language codes and country codes for flags
const languageConfig = {
  en: { code: "US", name: "EN" },
  pt: { code: "PT", name: "PT" },
  "pt-BR": { code: "BR", name: "PT-BR" },
  es: { code: "ES", name: "ES" },
};

// Internal useBreakpoint hook, as it was in your original file
function useBreakpoint() {
  const getBreakpoint = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return "lg";
      if (window.innerWidth >= 768) return "md";
    }
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

function Header({ onAuthModalOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const lastY = useRef(0); // For header show/hide on scroll
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  
  const breakpoint = useBreakpoint();

  const currentLanguage = i18n.language || "en";
  const allLangs = (i18n.options.supportedLngs || []).filter(
    (l) => l !== "cimode" && l !== "*"
  );

  // Removed useEffect for scroll-padding-top

  // Original logic for showing/hiding header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY.current && currentY > 56) { // 56 is h-14 (default header height)
        setShow(false);
      } else {
        setShow(true);
      }
      lastY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // lastY.current is mutated, so it doesn't need to be in dependencies

  // Click outside listener for language dropdown
  useEffect(() => {
    function onClick(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" }); 
    } else {
      navigate("/");
    }
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    navigate("/");
  };

  const handleLogIn = () => {
    if (typeof onAuthModalOpen === 'function') {
      onAuthModalOpen();
    } else {
      setAuthModalOpen(true);
    }
    setMenuOpen(false);
  };

  // Simplified handleScrollToSection
  const handleScrollToSection = (sectionId) => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        // Calculate offset based on current header height
        const headerHeight = breakpoint === "lg" ? 80 : breakpoint === "md" ? 96 : 56;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };
  
  const getFlagImage = (langCode) => {
    const normalized = langCode.toLowerCase();
    const langDetails = languageConfig[normalized] || languageConfig[langCode.split('-')[0]] || languageConfig.en;
    const countryCode = langDetails.code.toLowerCase();
    return (
      <img
        src={`https://flagcdn.com/w40/${countryCode}.png`}
        alt={`${langDetails.name} flag`}
        className="w-6 h-4 object-cover rounded-sm"
        onError={(e) => { // Fallback for missing flags
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3C/svg%3E"; 
        }}
      />
    );
  };
  
  const getLanguageName = (langCode) => {
    const normalized = langCode.toLowerCase();
    const langDetails = languageConfig[normalized] || languageConfig[langCode.split('-')[0]] || languageConfig.en;
    return langDetails.name.toUpperCase();
  };

  return (
    <>
      <header
        className={`fixed flex items-center justify-between top-0 p-4 md:px-8 lg:px-10 left-0 right-0 z-30 h-14 md:h-[96px] lg:h-20 bg-black text-white shadow-lg transform transition-transform duration-150 ${
          show ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="focus:outline-none z-10 p-2 -ml-2 md:p-0 md:ml-0"
          aria-label="Open menu"
        >
          <img src={Hamburger} alt="Menu" className="w-5 h-5 md:w-7 md:h-7" />
        </button>

        <div
          onClick={handleLogoClick}
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          aria-label="Go to homepage"
        >
          <img
            src={DaGalowLogo}
            alt="DaGalow Logo"
            className="w-[130px] md:w-[220px] lg:w-[250px] h-auto object-cover"
          />
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="focus:outline-none p-1 flex items-center justify-center"
              aria-label="Switch language"
            >
              <p className="text-sm md:text-base">{getLanguageName(currentLanguage)}</p>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg z-50 min-w-[160px] overflow-hidden">
                {allLangs.map((lng) => (
                  <button
                    key={lng}
                    onClick={() => {
                      i18n.changeLanguage(lng);
                      setLangOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-left"
                  >
                    <span className="mr-3 flex-shrink-0">
                      {getFlagImage(lng)}
                    </span>
                    <span className="text-sm md:text-base">
                      {getLanguageName(lng)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/notifications")}
            className="focus:outline-none p-1"
            aria-label="Open notifications"
          >
            <img src={NotificationsIcon} alt="Notifications" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu (Side Panel) */}
      <div
        className={`fixed top-0 left-0 w-[70vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw] max-w-xs bg-black transform transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          height: `calc(100vh - ${breakpoint === "lg" ? "80px" : breakpoint === "md" ? "96px" : "56px"})`,
          top: `${breakpoint === "lg" ? "80px" : breakpoint === "md" ? "96px" : "56px"}`,
        }}
      >
        <nav className="flex-grow p-3 sm:p-4 space-y-1 overflow-y-auto">
          <Link
            to="/"
            className="flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
            onClick={() => { handleLogoClick(); }} // setMenuOpen is handled by handleLogoClick
          >
            {t("navigation.home")}
          </Link>
          {user && (
            <Link
              to="/profile"
              className="flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t("navigation.profile")}
            </Link>
          )}
           {user && (
            <Link
              to="/messages"
              className="flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t("navigation.messages", "Messages")} {/* Fallback translation */}
            </Link>
          )}
          {user && (
            <Link
              to="/components/Subpages/Calendar"
              className="flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {t("navigation.calendar")}
            </Link>
          )}
          
          {/* Sections for All Users */}
          <div className="pt-1 sm:pt-2">
            <p className="text-xs sm:text-sm text-darkGold px-3 mb-1 opacity-70">
              {t("navigation.explore")}
            </p>
            <button
              onClick={() => handleScrollToSection("services")}
              className="w-full text-left flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
            >
              {t("services.services_title")}
            </button>
            <button
                onClick={() => handleScrollToSection("coaching")}
              className="w-full text-left flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
            >
              {t("coaching.coaching_title", "Coaching")} {/* Fallback translation */}
            </button>
            <button
                onClick={() => handleScrollToSection('venture-investment')}
                className="w-full text-left flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
            >
                {t("venture_investment.venture_title")}
            </button>
             <button
              onClick={() => handleScrollToSection("testimonials")}
              className="w-full text-left flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
            >
              {t("testimonials.testimonials_title")}
            </button>
            <button
                onClick={() => handleScrollToSection('interviews')}
                className="w-full text-left flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
            >
                {t("interviews.interviews_title")}
            </button>
              <button
                onClick={() => handleScrollToSection('other-wins')}
                className="w-full text-left flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
            >
                {t("other_wins.other_wins_title")}
            </button>
            <button
              onClick={() => handleScrollToSection("bottom-carousel")}
              className="w-full text-left flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
            >
              {t("bottom_carousel.pages.faqs")}
            </button>
          </div>

          {/* Conditional Log In / Log Out */}
          <div className="pt-2 border-t border-darkGold/20 mt-2">
            {!user ? (
              <button
                onClick={handleLogIn}
                className="w-full text-left flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
              >
                {t("navigation.login")}
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full text-left flex items-center text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors"
              >
                {t("navigation.logout")}
              </button>
            )}
          </div>
        </nav>
        
        <div className="p-3 sm:p-4 border-t border-darkGold/30 flex-shrink-0 space-y-2">
          <Link
            to="/settings"
            className="flex items-center gap-3 text-white hover:bg-darkGold/10 hover:text-darkGold px-3 py-2 sm:py-2.5 rounded-lg text-base md:text-lg transition-colors w-full"
            onClick={() => setMenuOpen(false)}
          >
            <img src={SettingsIcon} alt="Settings" className="w-5 h-5 md:w-6 md:h-6" />
            <span>{t("navigation.settings")}</span>
          </Link>
        </div>
      </div>

      {/* Overlay for when mobile menu is open */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" // Only show on mobile
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* AuthModal, if not handled by a prop */}
      {!onAuthModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </>
  );
}

export default Header;