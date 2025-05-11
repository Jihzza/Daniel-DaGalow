// components/Services.js
import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
// ... (all other imports remain the same) ...
import Brain from "../../assets/icons/Brain Branco.svg";
import Phone from "../../assets/icons/Phone Branco.svg";
import MoneyBag from "../../assets/icons/MoneyBag Branco.svg";
import Target from "../../assets/icons/Target Branco.svg";
import Bag from "../../assets/icons/Bag Branco.svg";
import Heart from "../../assets/icons/Heart Branco.svg";
import OnlyFans from "../../assets/icons/Onlyfans Branco.svg";
import Fitness from "../../assets/icons/Fitness Branco.svg";
import More from "../../assets/icons/More Branco.svg";
import Robot from "../../assets/icons/Robot Branco.svg";
import { useNavigate } from "react-router-dom";
import { ServiceContext } from "../../contexts/ServiceContext";
import { useTranslation } from "react-i18next";


const NAVIGATION_BAR_HEIGHT = 60; // px
const BUTTON_PADDING_ABOVE_NAV = 10; // px
const SMOOTH_TRANSITION = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';

function Services() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { service, setService } = useContext(ServiceContext);

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
  const buttonStopContainerRef = useRef(null);
  const hasButtonReachedFinalPosition = useRef(false);

  const openForm = (serviceName) => {
    setService(serviceName);
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

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
        zIndex: 1,
      });
      hasButtonReachedFinalPosition.current = false;
    }
  }, []); // Empty dependency array as constants are outside and refs are stable

  // Main effect to manage button visibility and scroll listener
  useEffect(() => {
    if (isButtonVisibleBasedOnSection) {
      handleScroll();
      window.addEventListener('scroll', handleScroll);
    } else {
      // Section is NOT visible.
      window.removeEventListener('scroll', handleScroll);

      // If the button had reached its final docked state, it MUST stay visible
      // and in its absolute position, as it's now part of the general page layout below this section.
      if (hasButtonReachedFinalPosition.current) {
        setButtonPositionStyle({ // Ensure it's the absolute docked style
          position: 'absolute',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 1, // Crucially, opacity remains 1
          transition: SMOOTH_TRANSITION, // Apply transition for smoothness if style properties change
          zIndex: 1,
        });
      } else {
        // Button was not in its final docked position when section became invisible
        // (e.g., scrolling up out of section, or section was too short for button to dock).
        // In this case, it should fade out.
        setButtonPositionStyle(prev => ({
          ...prev,
          opacity: 0,
          transition: SMOOTH_TRANSITION,
        }));
        // hasButtonReachedFinalPosition is already false or was never true.
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isButtonVisibleBasedOnSection, handleScroll]);

  return (
    <section ref={sectionRef} id="services" className="py-8 px-4 text-white">
      {/* ... rest of your JSX ... */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold">
          {t("services.services_title")}
        </h2>
        <p className="md:text-xl">{t("services.services_description")}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-white">
          {[
            {
              title: t("services.service_1"),
              icon: (
                <img
                  src={Brain}
                  alt="Brain"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_2"),
              icon: (
                <img
                  src={Phone}
                  alt="Phone"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_3"),
              icon: (
                <img
                  src={MoneyBag}
                  alt="MoneyBag"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_4"),
              icon: (
                <img
                  src={Target}
                  alt="Target"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_5"),
              icon: (
                <img
                  src={Bag}
                  alt="Bag"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_6"),
              icon: (
                <img
                  src={Heart}
                  alt="Heart"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_7"),
              icon: (
                <img
                  src={Fitness}
                  alt="Fitness"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_8"),
              icon: (
                <img
                  src={OnlyFans}
                  alt="OnlyFans"
                  className="w-10 h-8 md:w-14 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_9"),
              icon: (
                <img
                  src={Robot}
                  alt="Robot"
                  className="w-10 h-8 md:w-14 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_10"),
              icon: (
                <img
                  src={More}
                  alt="More"
                  className="w-10 h-8 md:w-14 md:h-12 object-contain"
                />
              ),
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center h-full p-6 border-2 border-darkGold rounded-lg text-center shadow-lg"
            >
              <div className="flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <div className="font-semibold text-[13px] md:text-lg">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full mx-auto px-4 mt-8 md:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Video Call Feature */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
              {t("services.services_structure_1_title")}
            </h4>
            <p className="text-white md:text-xl">
              {t("services.services_structure_1_description")}
            </p>
          </div>

          {/* Duration Feature */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
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
              {t("services.services_structure_2_title")}
            </h4>
            <p className="text-white md:text-xl">
              {t("services.services_structure_2_description")}
            </p>
          </div>

          {/* Recording Feature */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
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
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
              {t("services.services_structure_3_title")}
            </h4>
            <p className="text-white md:text-xl">
              {t("services.services_structure_3_description")}
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-lg md:text-2xl text-white max-w-3xl mx-auto">
            {t("services.services_structure_description")}
          </p>
          <div className="mt-6 w-full">
            <h1 className="text-white text-2xl md:text-3xl py-2 font-bold">
              {t("services.services_price")}
            </h1>
            <p className="text-white text-sm md:text-lg pb-6">
              {t("services.services_price_minimum_time")}
            </p>
            <div
              ref={buttonStopContainerRef}
              className="relative flex justify-center pt-2"
              style={{ minHeight: '80px' }}
            >
              <button
                ref={buttonRef}
                onClick={() => openForm("booking")}
                style={buttonPositionStyle}
                className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90"
              >
                {t("services.services_book_consultation")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;