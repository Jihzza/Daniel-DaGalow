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

const NAVIGATION_BAR_HEIGHT = 60;
const BUTTON_PADDING_ABOVE_NAV = 10;
const SMOOTH_TRANSITION = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';

function Services() {
  const { t } = useTranslation();
  const { service, setService } = useContext(ServiceContext);
  const [selectedServiceItem, setSelectedServiceItem] = useState(null);

  const [isButtonVisibleBasedOnSection, setIsButtonVisibleBasedOnSection] = useState(false);
  const [buttonPositionStyle, setButtonPositionStyle] = useState({
    position: 'absolute', opacity: 0, bottom: '0px', left: '50%',
    transform: 'translateX(-50%)', transition: SMOOTH_TRANSITION, zIndex: 1,
  });
  const sectionRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonStopContainerRef = useRef(null);
  const hasButtonReachedFinalPosition = useRef(false);

  const openForm = (serviceId) => {
    setService(serviceId || "booking"); // Use the passed serviceId or default
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // UPDATED: Add buttonActionKey to each service item
  const serviceItemsData = [
    { id: "mindset", titleKey: "services.service_1", Icon: Brain, alt: "Brain", buttonActionKey: "services.button_action_mindset" },
    { id: "social_media", titleKey: "services.service_2", Icon: Phone, alt: "Phone", buttonActionKey: "services.button_action_social_media" },
    { id: "finance", titleKey: "services.service_3", Icon: MoneyBag, alt: "MoneyBag", buttonActionKey: "services.button_action_finance" },
    { id: "marketing", titleKey: "services.service_4", Icon: Target, alt: "Target", buttonActionKey: "services.button_action_marketing" },
    { id: "business_building", titleKey: "services.service_5", Icon: Bag, alt: "Bag", buttonActionKey: "services.button_action_business_building" },
    { id: "relationships", titleKey: "services.service_6", Icon: Heart, alt: "Heart", buttonActionKey: "services.button_action_relationships" },
    { id: "health_fitness", titleKey: "services.service_7", Icon: Fitness, alt: "Fitness", buttonActionKey: "services.button_action_health_fitness" },
    { id: "onlyfans_services", titleKey: "services.service_8", Icon: OnlyFans, alt: "OnlyFans", buttonActionKey: "services.button_action_onlyfans" },
    { id: "ai_tech", titleKey: "services.service_9", Icon: Robot, alt: "Robot", buttonActionKey: "services.button_action_ai_tech" },
    { id: "more_services", titleKey: "services.service_10", Icon: More, alt: "More", buttonActionKey: "services.button_action_more_services" },
  ];

  const serviceItems = serviceItemsData.map(item => ({
    ...item,
    title: t(item.titleKey)
  }));

  const handleServiceItemClick = (item) => {
    if (selectedServiceItem && selectedServiceItem.id === item.id) {
      setSelectedServiceItem(null);
    } else {
      setSelectedServiceItem(item);
    }
  };

  const handleClearServiceSelection = (e) => {
    e.stopPropagation();
    setSelectedServiceItem(null);
  };

  // ... (useEffect for IntersectionObserver and handleScroll function - keep as is)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsButtonVisibleBasedOnSection(entry.isIntersecting),
      { root: null, threshold: 0.1 }
    );
    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) observer.observe(currentSectionRef);
    return () => {
      if (currentSectionRef) observer.unobserve(currentSectionRef);
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (!buttonRef.current || !buttonStopContainerRef.current || !sectionRef.current) return;
    const stopContainerRect = buttonStopContainerRef.current.getBoundingClientRect();
    const buttonHeight = buttonRef.current.offsetHeight;
    const effectiveSpaceFromBottomForFixed = NAVIGATION_BAR_HEIGHT + BUTTON_PADDING_ABOVE_NAV;
    const dockTriggerY = window.innerHeight - buttonHeight - effectiveSpaceFromBottomForFixed;

    if (stopContainerRect.top <= dockTriggerY) {
      setButtonPositionStyle({
        position: 'absolute', bottom: '0px', left: '50%',
        transform: 'translateX(-50%)', opacity: 1, transition: SMOOTH_TRANSITION, zIndex: 1,
      });
      hasButtonReachedFinalPosition.current = true;
    } else {
      setButtonPositionStyle({
        position: 'fixed', bottom: `${effectiveSpaceFromBottomForFixed}px`, left: '50%',
        transform: 'translateX(-50%)', opacity: 1, transition: SMOOTH_TRANSITION, zIndex: 10,
      });
      hasButtonReachedFinalPosition.current = false;
    }
  }, []);

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
          position: 'absolute', bottom: '0px', left: '50%',
          transform: 'translateX(-50%)', opacity: 1, transition: SMOOTH_TRANSITION, zIndex: 1,
        });
      } else {
        setButtonPositionStyle(prev => ({ ...prev, opacity: 0, transition: SMOOTH_TRANSITION }));
      }
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isButtonVisibleBasedOnSection, handleScroll]);


  // UPDATED: Dynamic button text using the specific buttonActionKey
  const floatingButtonText = selectedServiceItem
    ? t(selectedServiceItem.buttonActionKey) // Use the specific action key
    : t("services.button_book_consultation_default"); // Default text

  return (
    <section ref={sectionRef} id="services" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold">
          {t("services.services_title")}
        </h2>
        <p className="md:text-xl">{t("services.services_description")}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-white">
          {serviceItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleServiceItemClick(item)}
              className={`
                flex flex-col items-center justify-center h-full p-6 border-2 rounded-lg text-center shadow-lg cursor-pointer transition-all duration-200 ease-in-out
                ${selectedServiceItem?.id === item.id
                  ? 'border-darkGold scale-105'
                  : 'border-darkGold hover:scale-102'
                }
              `}
            >
              <div className="flex items-center justify-center mb-3">
                <img
                  src={item.Icon}
                  alt={item.alt}
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-[13px] md:text-lg">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ... (Rest of the Services component: features, price, button container) ... */}
      <div className="w-full mx-auto px-4 mt-8 md:mt-16">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Video Call Feature */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
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
      <div
          ref={buttonStopContainerRef}
          className="relative flex justify-center pt-2 mt-10" // Added mt-10 for spacing
          style={{ minHeight: '80px' }}
        >
          <button
            ref={buttonRef}
            onClick={() => openForm(selectedServiceItem ? selectedServiceItem.id : "booking")}
            style={buttonPositionStyle}
            className="bg-darkGold w-auto min-w-[15rem] md:min-w-[20rem] max-w-[90vw] sm:max-w-xs md:max-w-sm text-black md:text-xl font-bold px-4 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 truncate"
            // Added truncate and max-w classes for better text handling
          >
            {floatingButtonText}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Services;