// src/components/home-sections/Coaching.jsx
import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { motion } from "framer-motion"; // Ensure motion is imported
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
  const [selectedTierObject, setSelectedTierObject] = useState(null);

  const [isButtonVisibleBasedOnSection, setIsButtonVisibleBasedOnSection] = useState(false);
  const [buttonPositionStyle, setButtonPositionStyle] = useState({
    position: 'absolute', opacity: 0, bottom: '0px', left: '50%',
    transform: 'translateX(-50%)', transition: SMOOTH_TRANSITION, zIndex: 1,
  });
  const sectionRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonStopContainerRef = useRef(null);
  const hasButtonReachedFinalPosition = useRef(false);

  // New state and ref for the description animation
  const coachingContentRef = useRef(null);
  const [coachingCalculatedHeight, setCoachingCalculatedHeight] = useState(0);

  const openCoachingForm = () => {
    const tierValueToPass = selectedTierObject ? selectedTierObject.value : "Weekly";
    setServiceWithTier("coaching", tierValueToPass);
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const coachingServiceItemsData = [
    { id: "invest", titleKey: "coaching.coaching_service_1", Icon: InvestIcon, alt: "Investment", buttonActionKey: "coaching.button_action_invest_coaching", descriptionKey: "coaching.coaching_service_1_desc" },
    { id: "trainer", titleKey: "coaching.coaching_service_2", Icon: TrainerIcon, alt: "Fitness", buttonActionKey: "coaching.button_action_trainer_coaching", descriptionKey: "coaching.coaching_service_2_desc" },
    { id: "dating", titleKey: "coaching.coaching_service_3", Icon: DatingIcon, alt: "Dating", buttonActionKey: "coaching.button_action_dating_coaching", descriptionKey: "coaching.coaching_service_3_desc" },
    { id: "onlyfans_coaching", titleKey: "coaching.coaching_service_4", Icon: OnlyFansIcon, alt: "OnlyFans Coaching", buttonActionKey: "coaching.button_action_onlyfans_coaching", descriptionKey: "coaching.coaching_service_4_desc" },
    { id: "business_advisor", titleKey: "coaching.coaching_service_5", Icon: BusinessIcon, alt: "Business Advisor", buttonActionKey: "coaching.button_action_business_coaching", descriptionKey: "coaching.coaching_service_5_desc" },
    { id: "habits", titleKey: "coaching.coaching_service_6", Icon: HabitsIcon, alt: "Habits", buttonActionKey: "coaching.button_action_habits_coaching", descriptionKey: "coaching.coaching_service_6_desc" },
    { id: "social", titleKey: "coaching.coaching_service_7", Icon: SocialIcon, alt: "Social Media", buttonActionKey: "coaching.button_action_social_coaching", descriptionKey: "coaching.coaching_service_7_desc" },
    { id: "stocks", titleKey: "coaching.coaching_service_8", Icon: StocksIcon, alt: "Stock Market", buttonActionKey: "coaching.button_action_stocks_coaching", descriptionKey: "coaching.coaching_service_8_desc" },
  ];

  const coachingServiceItems = coachingServiceItemsData.map(item => ({
    ...item,
    title: t(item.titleKey),
    description: t(item.descriptionKey) // Make sure to add these to your translation files
  }));

  const getCoachingColumns = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? 2 : 4; // md:grid-cols-4 implies 4 on medium, 2 on small
    }
    return 4; // Default to larger screen column count
  }, []);

  const [columns, setColumns] = useState(getCoachingColumns());

  useEffect(() => {
    const handleResize = () => setColumns(getCoachingColumns());
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [getCoachingColumns]);

  useEffect(() => {
    if (selectedCoachingCategory && coachingContentRef.current) {
      const timer = setTimeout(() => {
        if (coachingContentRef.current) {
          setCoachingCalculatedHeight(coachingContentRef.current.scrollHeight);
        }
      }, 0);
      return () => clearTimeout(timer);
    } else if (!selectedCoachingCategory) {
      setCoachingCalculatedHeight(0);
    }
  }, [selectedCoachingCategory]);

  const handleCoachingCategoryClick = (categoryObject) => {
    if (selectedCoachingCategory && selectedCoachingCategory.id === categoryObject.id) {
      setSelectedCoachingCategory(null);
    } else {
      setSelectedCoachingCategory(categoryObject);
    }
  };

  const handleTierClick = (tierObject) => {
    setSelectedTierObject(tierObject);
  };

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
    // Ensure refs are present and the button has a measurable height.
    if (!buttonRef.current || !buttonStopContainerRef.current || !sectionRef.current || buttonRef.current.offsetHeight === 0) {
        return;
    }

    const buttonHeight = buttonRef.current.offsetHeight;
    const effectiveSpaceFromBottomForFixed = NAVIGATION_BAR_HEIGHT + BUTTON_PADDING_ABOVE_NAV;
    const stopContainerRect = buttonStopContainerRef.current.getBoundingClientRect();

    // If container is not in viewport or has no dimensions, exit.
    // (Rects for off-screen elements can have all zeros)
    if (stopContainerRect.width === 0 && stopContainerRect.height === 0 && stopContainerRect.top === 0 && stopContainerRect.left === 0 && stopContainerRect.bottom === 0 && stopContainerRect.right === 0) {
        return;
    }

    const fixedButtonTopY = window.innerHeight - buttonHeight - effectiveSpaceFromBottomForFixed;
    const fixedButtonBottomY = window.innerHeight - effectiveSpaceFromBottomForFixed;

    const geometricallyShouldBeDocked = stopContainerRect.top <= fixedButtonTopY &&
                                      stopContainerRect.bottom <= fixedButtonBottomY;

    if (geometricallyShouldBeDocked) {
        // Determine and set DOCKED (absolute) state
        setButtonPositionStyle({
            position: 'absolute',
            bottom: '0px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 1, // Ensure button is visible
            transition: SMOOTH_TRANSITION,
            zIndex: 1,
        });
        hasButtonReachedFinalPosition.current = true;
    } else {
        // Determine and set FLOATING (fixed) state
        setButtonPositionStyle({
            position: 'fixed',
            bottom: `${effectiveSpaceFromBottomForFixed}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 1, // Ensure button is visible
            transition: SMOOTH_TRANSITION,
            zIndex: 10,
        });
        hasButtonReachedFinalPosition.current = false;
    }
}, []); // No dependencies like isButtonVisibleBasedOnSection or component state needed here

useEffect(() => {
  const buttonElement = buttonRef.current; // Good practice to use var for ref in effect
  // Ensure button has rendered and has height before attaching scroll listeners
  if (isButtonVisibleBasedOnSection && buttonElement && buttonElement.offsetHeight > 0) {
    handleScroll(); // Set initial state correctly (handles opacity: 1)
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
  } else {
    // Section is not sufficiently visible, or button not ready
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleScroll);

    // This logic now matches the Services.jsx behavior which you said is correct:
    if (hasButtonReachedFinalPosition.current) {
      // Button was DOCKED (absolute). It should remain in its absolute position
      // and OPAQUE (opacity: 1), to scroll naturally with the (now off-screen) section.
      setButtonPositionStyle((prev) => ({
        ...prev, // Preserve existing transform, left, bottom, zIndex from last 'absolute' state
        position: "absolute", // Ensure position is absolute
        opacity: 1,           // Keep it visible
        // transition: SMOOTH_TRANSITION, // Transition opacity if it was changing, otherwise not strictly needed if already 1
      }));
    } else {
      // Button was FLOATING (fixed), or its state is undetermined (initial).
      // Since the section is gone, the floating button should become transparent.
      setButtonPositionStyle((prev) => ({
        ...prev, // Preserve existing transform, left, bottom from last 'fixed' state
        opacity: 0,
        transition: SMOOTH_TRANSITION, // Apply opacity transition
      }));
    }
  }
  return () => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleScroll);
  };
}, [isButtonVisibleBasedOnSection, handleScroll]); // handleScroll is memoized
  let coachingFloatingButtonText;
  if (selectedCoachingCategory) {
    coachingFloatingButtonText = t(selectedCoachingCategory.buttonActionKey);
  } else if (selectedTierObject) {
    coachingFloatingButtonText = t("coaching.button_get_number_default");
  } else {
    coachingFloatingButtonText = t("coaching.button_get_number_default");
  }

  const coachingDescriptionVariants = {
    open: {
      opacity: 1,
      height: coachingCalculatedHeight,
      marginTop: "0.5rem",
      marginBottom: "0.5rem",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    collapsed: {
      opacity: 0,
      height: 0,
      marginTop: "0rem",
      marginBottom: "0rem",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const tiersDataRaw = [
    { id: "weekly", priceKey: "coaching.coaching_tier_basic_price", labelKey: "coaching.coaching_tier_basic_label", descKey: "coaching.coaching_tier_basic_description", value: "Weekly" },
    { id: "monthly", priceKey: "coaching.coaching_tier_standard_price", labelKey: "coaching.coaching_tier_standard_label", descKey: "coaching.coaching_tier_standard_description", value: "Monthly" },
    { id: "yearly", priceKey: "coaching.coaching_tier_premium_price", labelKey: "coaching.coaching_tier_premium_label", descKey: "coaching.coaching_tier_premium_description", value: "Yearly" }
  ];
  const renderedTiers = tiersDataRaw.map(data => ({ ...data, price: t(data.priceKey), label: t(data.labelKey), desc: t(data.descKey) }));

  const renderedCoachingItemsWithDescriptions = [];
  let rowBufferCoaching = [];
  let selectedCategoryRowIndex = -1;

  if (selectedCoachingCategory) {
    const itemIndex = coachingServiceItems.findIndex(s => s.id === selectedCoachingCategory.id);
    if (itemIndex !== -1) {
      selectedCategoryRowIndex = Math.floor(itemIndex / columns);
    }
  }

  coachingServiceItems.forEach((item, index) => {
    rowBufferCoaching.push(
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
    );

    const currentRowIndex = Math.floor(index / columns);

    if ((index + 1) % columns === 0 || index === coachingServiceItems.length - 1) {
      renderedCoachingItemsWithDescriptions.push(
        <React.Fragment key={`coaching-row-items-${currentRowIndex}`}>
          {rowBufferCoaching}
        </React.Fragment>
      );
      rowBufferCoaching = [];

      const isDescriptionVisibleForThisRow = selectedCoachingCategory !== null && currentRowIndex === selectedCategoryRowIndex;
      let categoryDescriptionItem = null;
      if (isDescriptionVisibleForThisRow) {
         categoryDescriptionItem = selectedCoachingCategory; // The selected category *is* the item
      }
      
      const descriptionColSpanClass = columns === 2 ? "col-span-2" : "col-span-4"; // md:grid-cols-4

      renderedCoachingItemsWithDescriptions.push(
        <motion.div
          layout
          transition={{ duration: 0.4, ease: "easeInOut" }}
          key={`coaching-desc-slot-for-row-${currentRowIndex}`}
          className={`${descriptionColSpanClass} overflow-hidden`}
          initial="collapsed"
          animate={isDescriptionVisibleForThisRow ? "open" : "collapsed"}
          variants={coachingDescriptionVariants}
          style={{
            pointerEvents: isDescriptionVisibleForThisRow ? "auto" : "none",
          }}
        >
          <div 
            ref={isDescriptionVisibleForThisRow ? coachingContentRef : null}
            style={{
              paddingTop: isDescriptionVisibleForThisRow ? '1rem' : '0rem',
              paddingBottom: isDescriptionVisibleForThisRow ? '1rem' : '0rem',
            }}
          >
            <div className="rounded-lg text-white text-center md:text-center"> {/* Adjusted text alignment */}
              {isDescriptionVisibleForThisRow && categoryDescriptionItem && (
                <>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-darkGold">
                    {categoryDescriptionItem.title}
                  </h3>
                  <p className="text-sm md:text-base">{categoryDescriptionItem.description}</p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      );
    }
  });

  const coachingGridLayoutClasses = columns === 2 
    ? "grid-cols-2" 
    : "grid-cols-4";


  return (
    <section ref={sectionRef} id="coaching" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold">{t("coaching.coaching_title")}</h2>
        <p className="md:text-xl">{t("coaching.coaching_description")}</p>

        <div className={`grid ${coachingGridLayoutClasses} gap-2 md:gap-6 place-items-center md:place-items-start`}>
          {renderedCoachingItemsWithDescriptions}
        </div>
      </div>

      <div className="w-full mx-auto px-4 mt-8 md:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">{t("coaching.coaching_feature_1_title")}</h4>
            <p className="text-white md:text-xl">{t("coaching.coaching_feature_1_description")}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">{t("coaching.coaching_feature_2_title")}</h4>
            <p className="text-white md:text-xl">{t("coaching.coaching_feature_2_description")}</p>
          </div>
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