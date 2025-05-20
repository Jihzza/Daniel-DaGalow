// src/components/home-sections/Coaching.jsx
import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
// ... (Import your icons as before)
import InvestIcon from "../../assets/icons/Stocks Branco.svg";
import TrainerIcon from "../../assets/icons/PersonalTrainer Branco.svg";
import DatingIcon from "../../assets/icons/Dating Branco.svg";
import OnlyFansIcon from "../../assets/icons/Onlyfans Branco.svg";
import BusinessIcon from "../../assets/icons/Business Branco.svg";
import HabitsIcon from "../../assets/icons/Habits Branco.svg";
import SocialIcon from "../../assets/icons/Phone Branco.svg";
import StocksIcon from "../../assets/icons/MoneyBag Branco.svg";

import { ServiceContext } from "../../contexts/ServiceContext";
import { useTranslation } from "react-i18next";

const NAVIGATION_BAR_HEIGHT = 60;
const BUTTON_PADDING_ABOVE_NAV = 10;
const SMOOTH_TRANSITION = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';

function DirectCoaching() {
  const { setServiceWithTier } = useContext(ServiceContext);
  const { t } = useTranslation();

  const [selectedCoachingCategory, setSelectedCoachingCategory] = useState(null);
  const [selectedTierObject, setSelectedTierObject] = useState(null); // Keep this for tier selection

  const [isButtonVisibleBasedOnSection, setIsButtonVisibleBasedOnSection] = useState(false);
  const [buttonPositionStyle, setButtonPositionStyle] = useState({
    position: 'absolute', opacity: 0, bottom: '0px', left: '50%',
    transform: 'translateX(-50%)', transition: SMOOTH_TRANSITION, zIndex: 1,
  });
  const sectionRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonStopContainerRef = useRef(null);
  const hasButtonReachedFinalPosition = useRef(false);

  const openCoachingForm = () => {
    const tierValueToPass = selectedTierObject ? selectedTierObject.value : "Weekly";
    setServiceWithTier("coaching", tierValueToPass);
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // UPDATED: Add buttonActionKey for each coaching category
  const coachingServiceItemsData = [
    { id: "invest", titleKey: "coaching.coaching_service_1", Icon: InvestIcon, alt: "Investment", buttonActionKey: "coaching.button_action_invest_coaching" },
    { id: "trainer", titleKey: "coaching.coaching_service_2", Icon: TrainerIcon, alt: "Fitness", buttonActionKey: "coaching.button_action_trainer_coaching" },
    { id: "dating", titleKey: "coaching.coaching_service_3", Icon: DatingIcon, alt: "Dating", buttonActionKey: "coaching.button_action_dating_coaching" },
    { id: "onlyfans_coaching", titleKey: "coaching.coaching_service_4", Icon: OnlyFansIcon, alt: "OnlyFans Coaching", buttonActionKey: "coaching.button_action_onlyfans_coaching" },
    { id: "business_advisor", titleKey: "coaching.coaching_service_5", Icon: BusinessIcon, alt: "Business Advisor", buttonActionKey: "coaching.button_action_business_coaching" },
    { id: "habits", titleKey: "coaching.coaching_service_6", Icon: HabitsIcon, alt: "Habits", buttonActionKey: "coaching.button_action_habits_coaching" },
    { id: "social", titleKey: "coaching.coaching_service_7", Icon: SocialIcon, alt: "Social Media", buttonActionKey: "coaching.button_action_social_coaching" },
    { id: "stocks", titleKey: "coaching.coaching_service_8", Icon: StocksIcon, alt: "Stock Market", buttonActionKey: "coaching.button_action_stocks_coaching" },
  ];
  const coachingServiceItems = coachingServiceItemsData.map(item => ({ ...item, title: t(item.titleKey) }));

  // Define tiersDataRaw with example tiers
  const tiersDataRaw = [
    {
      id: "weekly",
      priceKey: "coaching.coaching_tier_basic_price",
      labelKey: "coaching.coaching_tier_basic_label",
      descKey: "coaching.coaching_tier_basic_description",
      value: "Weekly"
    },
    {
      id: "monthly",
      priceKey: "coaching.coaching_tier_standard_price",
      labelKey: "coaching.coaching_tier_standard_label",
      descKey: "coaching.coaching_tier_standard_description",
      value: "Monthly"
    },
    {
      id: "yearly",
      priceKey: "coaching.coaching_tier_premium_price",
      labelKey: "coaching.coaching_tier_premium_label",
      descKey: "coaching.coaching_tier_premium_description",
      value: "Yearly"
    }
  ];
  const renderedTiers = tiersDataRaw.map(data => ({ ...data, price: t(data.priceKey), label: t(data.labelKey), desc: t(data.descKey) }));

  const handleCoachingCategoryClick = (categoryObject) => {
    if (selectedCoachingCategory && selectedCoachingCategory.id === categoryObject.id) {
      setSelectedCoachingCategory(null);
    } else {
      setSelectedCoachingCategory(categoryObject);
      // setSelectedTierObject(null); // Optional: Reset tier when category changes
    }
  };

  const handleTierClick = (tierObject) => {
    setSelectedTierObject(tierObject);
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
          transform: 'translateX(-50%)', opacity: 0, transition: SMOOTH_TRANSITION, zIndex: 1,
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


  // UPDATED: Dynamic button text for coaching
  let coachingFloatingButtonText;
  if (selectedCoachingCategory) {
    coachingFloatingButtonText = t(selectedCoachingCategory.buttonActionKey);
    // Optionally, if a tier is also selected, you could append its name or a generic indicator
    // For max conciseness, the category-specific text might be enough.
    // if (selectedTierObject) {
    //   coachingFloatingButtonText += ` (${selectedTierObject.label})`; // Example
    // }
  } else if (selectedTierObject) {
    // If only a tier is selected, but no category (less likely in the new flow if category is primary)
    // You might fall back to a generic "Proceed with Tier" or the default.
    // For this example, let's prioritize category selection for button text.
    coachingFloatingButtonText = t("coaching.button_get_number_default"); // Or a specific "Proceed with selected Tier"
  } else {
    coachingFloatingButtonText = t("coaching.button_get_number_default");
  }


  return (
    <section ref={sectionRef} id="coaching" className="py-8 px-4 text-white">
      {/* Coaching categories grid */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold">{t("coaching.coaching_title")}</h2>
        <p className="md:text-xl">{t("coaching.coaching_description")}</p>

        <div className="grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-4 text-white">
          {coachingServiceItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCoachingCategoryClick(item)}
              className={`
                flex flex-col items-center justify-center p-4 w-[156px] h-[108px] md:w-[200px] md:h-[140px] border-2 rounded-lg text-center shadow-lg transition-all duration-200 ease-in-out cursor-pointer
                ${selectedCoachingCategory?.id === item.id
                  ? 'border-darkGold scale-105'
                  : 'border-darkGold hover:scale-102'
                }
              `}
            >
              <div className="flex items-center justify-center mb-2 md:mb-3">
                <img src={item.Icon} alt={item.alt} className="w-8 h-8 md:w-10 md:h-10 object-contain"/>
              </div>
              <div className="font-semibold text-xs md:text-base">{item.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ... (Features section) ... */}
      <div className="w-full mx-auto px-4 mt-8 md:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Anytime Communication Feature */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">{t("coaching.coaching_feature_1_title")}</h4>
            <p className="text-white md:text-xl">{t("coaching.coaching_feature_1_description")}</p>
          </div>
           {/* Multi-format Responses */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">{t("coaching.coaching_feature_2_title")}</h4>
            <p className="text-white md:text-xl">{t("coaching.coaching_feature_2_description")}</p>
          </div>
           {/* Personalized Classes */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">{t("coaching.coaching_feature_3_title")}</h4>
            <p className="text-white md:text-xl">{t("coaching.coaching_feature_3_description")}</p>
          </div>
        </div>
      {/* Tier selection grid and button */}
      <div className="max-w-3xl mx-auto text-center space-y-6">

          <div className="grid grid-cols-3 gap-3 md:gap-4 pt-2 mt-2">
            {renderedTiers.map(tierItem => (
              <div
                key={tierItem.id}
                onClick={() => handleTierClick(tierItem)}
                className={`
                  cursor-pointer border-2 rounded-lg py-4 px-2 flex flex-col items-center justify-between transition-all duration-200 h-full min-h-[120px] md:min-h-[150px]
                  ${selectedTierObject?.id === tierItem.id
                    ? 'border-darkGold transform scale-105 z-10 shadow-lg'
                    : 'border-darkGold'
                  }
                `}
              >
                <span className="text-lg md:text-2xl xl:text-3xl font-extrabold mb-1">{tierItem.price}</span>
                <span className="text-sm md:text-lg font-medium mb-2">{tierItem.label}</span>
                <span className="text-xs text-gray-300 md:text-sm">{tierItem.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-sm md:text-lg font-normal">{t("coaching.coaching_limited_spots")}</p>
          <div
            ref={buttonStopContainerRef}
            className="relative flex justify-center"
            style={{ minHeight: '80px' }}
          >
            <button
                ref={buttonRef}
                onClick={openCoachingForm}
                style={buttonPositionStyle}
                disabled={!selectedCoachingCategory && !selectedTierObject}
                className={`
                  bg-darkGold w-auto min-w-[15rem] md:min-w-[20rem] max-w-[90vw] sm:max-w-xs md:max-w-sm text-black md:text-xl font-bold
                  px-4 md:px-8 py-3 md:py-4 rounded-lg shadow-lg hover:bg-opacity-90 truncate
                  ${(!selectedCoachingCategory && !selectedTierObject) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {coachingFloatingButtonText}
              </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DirectCoaching;