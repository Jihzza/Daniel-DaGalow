// components/home-sections/Analysis.jsx
import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SocialIcon from "../../assets/icons/Phone Branco.svg";
import StocksIcon from "../../assets/icons/MoneyBag Branco.svg";
import BusinessIcon from "../../assets/icons/Bag Branco.svg";
import { ServiceContext } from "../../contexts/ServiceContext";
import { useTranslation } from "react-i18next";

const NAVIGATION_BAR_HEIGHT = 60; // px
const BUTTON_PADDING_ABOVE_NAV = 10; // px
const SMOOTH_TRANSITION = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out'; // Match Coaching/Services

function Analysis() {
  const navigate = useNavigate();
  const { setService } = useContext(ServiceContext);
  const { t } = useTranslation();

  // --- Button Animation State (copied from Coaching/Services) ---
  const [isButtonVisibleBasedOnSection, setIsButtonVisibleBasedOnSection] = useState(false);
  const [buttonPositionStyle, setButtonPositionStyle] = useState({
    position: 'absolute',
    opacity: 0,
    bottom: '0px',
    left: '50%',
    transform: 'translateX(-50%)',
    transition: SMOOTH_TRANSITION,
    zIndex: 1,
  });

  const sectionRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonStopContainerRef = useRef(null); // replaces marker ref
  const hasButtonReachedFinalPosition = useRef(false);

  const openForm = (serviceType) => {
    setService(serviceType);
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Intersection Observer for section visibility (copied from Coaching/Services)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsButtonVisibleBasedOnSection(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Scroll handler for button positioning (copied and adapted)
  const handleScroll = useCallback(() => {
    if (!buttonRef.current || !buttonStopContainerRef.current) {
      return;
    }

    const stopContainerRect = buttonStopContainerRef.current.getBoundingClientRect();
    const buttonHeight = buttonRef.current.offsetHeight;
    const effectiveSpaceFromBottomForFixed = NAVIGATION_BAR_HEIGHT + BUTTON_PADDING_ABOVE_NAV;
    const dockTriggerY = window.innerHeight - buttonHeight - effectiveSpaceFromBottomForFixed;

    if (stopContainerRect.top <= dockTriggerY) {
      setButtonPositionStyle({
        position: 'absolute',
        bottom: '0px',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: 1,
        transition: SMOOTH_TRANSITION,
        zIndex: 1,
      });
      hasButtonReachedFinalPosition.current = true;
    } else {
      setButtonPositionStyle({
        position: 'fixed',
        bottom: `${effectiveSpaceFromBottomForFixed}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: 1,
        transition: SMOOTH_TRANSITION,
        zIndex: 10, // Higher zIndex when fixed
      });
      hasButtonReachedFinalPosition.current = false;
    }
  }, []);

  // Effect to manage button visibility and scroll listener (copied and adapted)
  useEffect(() => {
    if (isButtonVisibleBasedOnSection) {
      handleScroll();
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
    } else {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (hasButtonReachedFinalPosition.current) {
        setButtonPositionStyle({
          position: 'absolute',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 1,
          transition: SMOOTH_TRANSITION,
          zIndex: 1,
        });
      } else {
        setButtonPositionStyle(prev => ({
          ...prev,
          opacity: 0,
          transition: SMOOTH_TRANSITION,
        }));
      }
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isButtonVisibleBasedOnSection, handleScroll]);

  const analysisServices = [
    // ... (analysisServices array remains the same)
        {
      id: "social", // Unique id for key and potentially for handleServiceClick
      title: t("analysis.analysis_service_1"), // "Social Media Analysis"
      icon: (
        <img
          src={SocialIcon}
          alt={t("analysis.analysis_service_1")}
          className="w-8 h-8 md:w-12 md:h-12 object-contain"
        />
      ),
      // action: () => handleServiceClick("socialMediaAnalysis") // Example action
    },
    {
      id: "stocks",
      title: t("analysis.analysis_service_2"), // "Stocks/Crypto Analysis"
      icon: (
        <img
          src={StocksIcon}
          alt={t("analysis.analysis_service_2")}
          className="w-8 h-8 md:w-12 md:h-12 object-contain"
        />
      ),
      // action: () => handleServiceClick("stocksAnalysis")
    },
    {
      id: "business",
      title: t("analysis.analysis_service_4"), // "Business/Company Analysis" (using key from original code)
      icon: (
        <img
          src={BusinessIcon}
          alt={t("analysis.analysis_service_4")}
          className="w-8 h-8 md:w-12 md:h-12 object-contain"
        />
      ),
      // action: () => handleServiceClick("businessAnalysis")
    },
  ];

  return (
    <section ref={sectionRef} id="expert-analysis" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold">{t("analysis.analysis_title")}</h2>
        <p className="md:text-xl">{t("analysis.analysis_description")}</p>

        <div className="flex flex-col gap-6 text-white">
          {/* ... (analysis services grid remains the same) ... */}
          <div className="grid grid-cols-2 gap-6">
            {analysisServices.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center justify-center h-full p-6 border-2 border-darkGold rounded-lg text-center shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={item.action || (() => openForm("analysis"))}
              >
                <div className="flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <div className="font-semibold text-[13px] md:text-lg">{item.title}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <div
              key={analysisServices[2].id}
              className="flex flex-col items-center justify-center h-full p-6 border-2 border-darkGold rounded-lg text-center shadow-lg cursor-pointer hover:opacity-80 transition-opacity w-[50%] md:w-1/2"
              onClick={analysisServices[2].action || (() => openForm("analysis"))}
            >
              <div className="flex items-center justify-center mb-3">
                {analysisServices[2].icon}
              </div>
              <div className="font-semibold text-[13px] md:text-lg">{analysisServices[2].title}</div>
            </div>
          </div>
        </div>

        <div className="w-full mx-auto px-4 mt-8">
          {/* ... (features grid remains the same) ... */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Consultations Feature */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 md:h-12 md:w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
                {t("analysis.analysis_feature_1_title")}
              </h4>
              <p className="text-white md:text-xl">
                {t("analysis.analysis_feature_1_description")}
              </p>
            </div>

            {/* Detailed Analysis */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
                {t("analysis.analysis_feature_2_title")}
              </h4>
              <p className="text-white md:text-xl">
                {t("analysis.analysis_feature_2_description")}
              </p>
            </div>

            {/* Actionable Suggestions */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
                {t("analysis.analysis_feature_3_title")}
              </h4>
              <p className="text-white md:text-xl">
                {t("analysis.analysis_feature_3_description")}
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
              {t("analysis.analysis_summary")}
            </p>
            {/* This div contains the text and the button in their natural order */}
            <div className="mt-8 w-full">
              <h1 className="text-white text-2xl md:text-3xl py-2 font-bold">
                {t("analysis.analysis_quote_title")} {/* "Ask For Quote" */}
              </h1>
              <p className="text-white text-sm md:text-lg pb-6">
                {t("analysis.analysis_quote_subtitle")} {/* "Depends on the Project" */}
              </p>
              {/* This div is now the stop container for the button's docking logic */}
              <div
                ref={buttonStopContainerRef}
                className="relative flex justify-center pt-2"
                style={{ minHeight: '80px' }}
              >
                <button
                  ref={buttonRef}
                  onClick={() => openForm("analysis")}
                  style={buttonPositionStyle}
                  className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
                >
                  {t("analysis.analysis_get_analysis")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Analysis;