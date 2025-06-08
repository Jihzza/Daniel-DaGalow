// src/components/home-sections/Coaching.jsx
// Updated to replicate the layout, responsiveness and box/topic styles of Services.jsx
// -----------------------------------------------------------------------------------
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { motion } from "framer-motion";

// *** Icons ***
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

// -----------------------------------------------------------------------------
// Shared constants ― kept identical to Services.jsx for 1‑to‑1 behaviour
// -----------------------------------------------------------------------------
const NAVIGATION_BAR_HEIGHT = 60;
const BUTTON_PADDING_ABOVE_NAV = 10;
const SMOOTH_TRANSITION =
  "opacity 0.2s ease-in-out, transform 0.2s ease-in-out";

function DirectCoaching() {
  const { setServiceWithTier } = useContext(ServiceContext);
  const { t } = useTranslation();

  // ---------------------------------------------------------------------------------
  // State — mirrors Services.jsx philosophy (selected item + selected tier)
  // ---------------------------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);

  // ---------------------------------------------------------------------------------
  // Floating CTA button positioning logic (copied from Services.jsx)
  // ---------------------------------------------------------------------------------
  const [isButtonVisibleBasedOnSection, setIsButtonVisibleBasedOnSection] =
    useState(false);
  const [buttonPositionStyle, setButtonPositionStyle] = useState({
    position: "absolute",
    opacity: 0,
    bottom: "0px",
    left: "50%",
    transform: "translateX(-50%)",
    transition: SMOOTH_TRANSITION,
    zIndex: 1,
  });

  const sectionRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonStopContainerRef = useRef(null);
  const hasButtonReachedFinalPosition = useRef(false);

  // ---------------------------------------------------------------------------------
  // Animated description height logic (identical to Services)
  // ---------------------------------------------------------------------------------
  const descriptionInnerContentRef = useRef(null);
  const [calculatedHeight, setCalculatedHeight] = useState(0);

  // ---------------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------------
  const categoriesData = [
    {
      id: "invest",
      titleKey: "coaching.coaching_service_1",
      Icon: InvestIcon,
      alt: "Investment",
      buttonActionKey: "coaching.button_action_invest_coaching",
      descriptionKey: "coaching.coaching_service_1_desc",
    },
    {
      id: "trainer",
      titleKey: "coaching.coaching_service_2",
      Icon: TrainerIcon,
      alt: "Fitness",
      buttonActionKey: "coaching.button_action_trainer_coaching",
      descriptionKey: "coaching.coaching_service_2_desc",
    },
    {
      id: "dating",
      titleKey: "coaching.coaching_service_3",
      Icon: DatingIcon,
      alt: "Dating",
      buttonActionKey: "coaching.button_action_dating_coaching",
      descriptionKey: "coaching.coaching_service_3_desc",
    },
    {
      id: "onlyfans_coaching",
      titleKey: "coaching.coaching_service_4",
      Icon: OnlyFansIcon,
      alt: "OnlyFans Coaching",
      buttonActionKey: "coaching.button_action_onlyfans_coaching",
      descriptionKey: "coaching.coaching_service_4_desc",
    },
    {
      id: "business_advisor",
      titleKey: "coaching.coaching_service_5",
      Icon: BusinessIcon,
      alt: "Business Advisor",
      buttonActionKey: "coaching.button_action_business_coaching",
      descriptionKey: "coaching.coaching_service_5_desc",
    },
    {
      id: "habits",
      titleKey: "coaching.coaching_service_6",
      Icon: HabitsIcon,
      alt: "Habits",
      buttonActionKey: "coaching.button_action_habits_coaching",
      descriptionKey: "coaching.coaching_service_6_desc",
    },
    {
      id: "social",
      titleKey: "coaching.coaching_service_7",
      Icon: SocialIcon,
      alt: "Social Media",
      buttonActionKey: "coaching.button_action_social_coaching",
      descriptionKey: "coaching.coaching_service_7_desc",
    },
    {
      id: "stocks",
      titleKey: "coaching.coaching_service_8",
      Icon: StocksIcon,
      alt: "Stock Market",
      buttonActionKey: "coaching.button_action_stocks_coaching",
      descriptionKey: "coaching.coaching_service_8_desc",
    },
  ];

  const categories = categoriesData.map((c) => ({
    ...c,
    title: t(c.titleKey),
    description: t(c.descriptionKey),
  }));

  // -----------------------------------------------------------------------------
  // Column helpers ― EXACT match with Services.jsx (2 cols <768px, else 3)
  // -----------------------------------------------------------------------------
  const getColumns = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? 2 : 3;
    }
    return 3;
  }, []);

  const [columns, setColumns] = useState(getColumns());

  useEffect(() => {
    const handleResize = () => setColumns(getColumns());
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [getColumns]);

  // -----------------------------------------------------------------------------
  // Tier cards (kept, but styling tweaked to mirror Service topic cards)
  // -----------------------------------------------------------------------------
  const rawTiers = [
    {
      id: "weekly",
      priceKey: "coaching.coaching_tier_basic_price",
      labelKey: "coaching.coaching_tier_basic_label",
      descKey: "coaching.coaching_tier_basic_description",
      value: "Weekly",
    },
    {
      id: "monthly",
      priceKey: "coaching.coaching_tier_standard_price",
      labelKey: "coaching.coaching_tier_standard_label",
      descKey: "coaching.coaching_tier_standard_description",
      value: "Daily",
    },
    {
      id: "yearly",
      priceKey: "coaching.coaching_tier_premium_price",
      labelKey: "coaching.coaching_tier_premium_label",
      descKey: "coaching.coaching_tier_premium_description",
      value: "Priority",
    },
  ];

  const tiers = rawTiers.map((tItem) => ({
    ...tItem,
    price: t(tItem.priceKey),
    label: t(tItem.labelKey),
    desc: t(tItem.descKey),
  }));

  // -----------------------------------------------------------------------------
  // Effects: animated description height (like Services)
  // -----------------------------------------------------------------------------
  useEffect(() => {
    if (selectedCategory && descriptionInnerContentRef.current) {
      const timer = setTimeout(() => {
        if (descriptionInnerContentRef.current) {
          setCalculatedHeight(descriptionInnerContentRef.current.scrollHeight);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
    setCalculatedHeight(0);
  }, [selectedCategory]);

  // -----------------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------------
  const handleCategoryClick = (categoryObj) => {
    if (selectedCategory?.id === categoryObj.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryObj);
      // Reset tier selection when changing category to mirror behaviour in Services
      setSelectedTier(null);
    }
  };

  const handleTierClick = (tierObj) => {
    setSelectedTier(tierObj);
    // Clear category selection to make tiers primary when chosen
    setSelectedCategory(null);
  };

  const openCoachingForm = () => {
    const tierValue = selectedTier ? selectedTier.value : "Weekly";
    setServiceWithTier("coaching", tierValue);
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // -----------------------------------------------------------------------------
  // Intersection + scroll listeners — verbatim copy from Services.jsx
  // -----------------------------------------------------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsButtonVisibleBasedOnSection(entry.isIntersecting),
      { root: null, threshold: 0.1 }
    );

    const currentSection = sectionRef.current;
    if (currentSection) observer.observe(currentSection);

    return () => {
      if (currentSection) observer.unobserve(currentSection);
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (
      !buttonRef.current ||
      !buttonStopContainerRef.current ||
      buttonRef.current.offsetHeight === 0
    )
      return;

    const buttonHeight = buttonRef.current.offsetHeight;
    const effectiveSpaceFromBottomForFixed =
      NAVIGATION_BAR_HEIGHT + BUTTON_PADDING_ABOVE_NAV;

    const stopRect =
      buttonStopContainerRef.current.getBoundingClientRect();

    if (
      stopRect.width === 0 &&
      stopRect.height === 0 &&
      stopRect.top === 0 &&
      stopRect.left === 0 &&
      stopRect.bottom === 0 &&
      stopRect.right === 0
    )
      return;

    const fixedButtonTopY =
      window.innerHeight - buttonHeight - effectiveSpaceFromBottomForFixed;
    const fixedButtonBottomY =
      window.innerHeight - effectiveSpaceFromBottomForFixed;

    const shouldDock =
      stopRect.top <= fixedButtonTopY && stopRect.bottom <= fixedButtonBottomY;

    if (shouldDock) {
      setButtonPositionStyle({
        position: "absolute",
        bottom: "0px",
        left: "50%",
        transform: "translateX(-50%)",
        opacity: 1,
        transition: SMOOTH_TRANSITION,
        zIndex: 1,
      });
      hasButtonReachedFinalPosition.current = true;
    } else {
      setButtonPositionStyle({
        position: "fixed",
        bottom: `${effectiveSpaceFromBottomForFixed}px`,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: 1,
        transition: SMOOTH_TRANSITION,
        zIndex: 10,
      });
      hasButtonReachedFinalPosition.current = false;
    }
  }, []);

  useEffect(() => {
    if (isButtonVisibleBasedOnSection) {
      handleScroll();
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);
    } else {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (hasButtonReachedFinalPosition.current) {
        // Keep button absolute and visible once docked
        setButtonPositionStyle((prev) => ({ ...prev, position: "absolute", opacity: 1 }));
      } else {
        setButtonPositionStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    }
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isButtonVisibleBasedOnSection, handleScroll]);

  // -----------------------------------------------------------------------------
  // Derived button label
  // -----------------------------------------------------------------------------
  const floatingButtonText = selectedTier
    ? `${t("coaching.button_get_number_default")} - ${selectedTier.price}/m`
    : selectedCategory
    ? t(selectedCategory.buttonActionKey)
    : t("coaching.button_get_number_default");

  // -----------------------------------------------------------------------------
  // Motion variants (copy of Services)
  // -----------------------------------------------------------------------------
  const descriptionVariants = {
    open: {
      opacity: 1,
      height: calculatedHeight,
      marginTop: "0.5rem",
      marginBottom: "0.5rem",
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    collapsed: {
      opacity: 0,
      height: 0,
      marginTop: "0rem",
      marginBottom: "0rem",
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  // -----------------------------------------------------------------------------
  // Rendered category items with in‑row description (exact technique from Services)
  // -----------------------------------------------------------------------------
  const renderedItemsWithDescriptions = [];
  let rowBuffer = [];
  let selectedRowIndex = -1;

  if (selectedCategory) {
    const idx = categories.findIndex((c) => c.id === selectedCategory.id);
    if (idx !== -1) selectedRowIndex = Math.floor(idx / columns);
  }

  categories.forEach((item, idx) => {
    rowBuffer.push(
      <motion.div
        key={item.id}
        onClick={() => handleCategoryClick(item)}
        className={`
          flex flex-col items-center justify-center p-4 w-full aspect-[4/3] border-2 rounded-lg text-center shadow-lg cursor-pointer transition-all duration-200 ease-in-out
          ${
            selectedCategory?.id === item.id
              ? "border-darkGold scale-105"
              : "border-darkGold hover:scale-102"
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
        <div className="font-semibold text-xs md:text-lg">{item.title}</div>
      </motion.div>
    );

    const currentRow = Math.floor(idx / columns);

    if ((idx + 1) % columns === 0 || idx === categories.length - 1) {
      // Push buffered items
      renderedItemsWithDescriptions.push(
        <React.Fragment key={`row-items-${currentRow}`}>{rowBuffer}</React.Fragment>
      );
      rowBuffer = [];

      // Description slot
      const showDesc = selectedCategory && currentRow === selectedRowIndex;
      const descColSpanClass = columns === 2 ? "col-span-2" : "col-span-3";

      renderedItemsWithDescriptions.push(
        <motion.div
          key={`desc-slot-${currentRow}`}
          layout
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`${descColSpanClass} overflow-hidden`}
          initial="collapsed"
          animate={showDesc ? "open" : "collapsed"}
          variants={descriptionVariants}
          style={{ pointerEvents: showDesc ? "auto" : "none" }}
        >
          <div
            ref={showDesc ? descriptionInnerContentRef : null}
            style={{
              paddingTop: showDesc ? "1rem" : "0rem",
              paddingBottom: showDesc ? "1rem" : "0rem",
            }}
          >
            {showDesc && (
              <>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-darkGold">
                  {selectedCategory.title}
                </h3>
                <p className="text-sm md:text-base">
                  {selectedCategory.description}
                </p>
              </>
            )}
          </div>
        </motion.div>
      );
    }
  });

  const gridLayoutClasses =
    columns === 2 ? "grid-cols-2" : "grid-cols-3 md:grid-cols-3";

  // -----------------------------------------------------------------------------
  // JSX
  // -----------------------------------------------------------------------------
  return (
    <section
      ref={sectionRef}
      id="coaching"
      className="py-8 px-4 text-white"
    >
      {/* --- Header --- */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold">
          {t("coaching.coaching_title")}
        </h2>
        <p className="md:text-xl">{t("coaching.coaching_description")}</p>

        {/* --- Category grid --- */}
        <div
          className={`grid ${gridLayoutClasses} gap-4 md:gap-6 lg:gap-8 justify-items-center`}
        >
          {renderedItemsWithDescriptions}
        </div>
      </div>

      {/* --- Tiers --- */}
      <div className="w-full mx-auto px-4 mt-8 md:mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Features / topics (3) → keep existing but style already matches Services */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 md:h-12 md:w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
              {t("coaching.coaching_feature_1_title")}
            </h4>
            <p className="text-white md:text-xl">
              {t("coaching.coaching_feature_1_description")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 md:h-12 md:w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
              {t("coaching.coaching_feature_2_title")}
            </h4>
            <p className="text-white md:text-xl">
              {t("coaching.coaching_feature_2_description")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 md:h-12 md:w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
              {t("coaching.coaching_feature_3_title")}
            </h4>
            <p className="text-white md:text-xl">
              {t("coaching.coaching_feature_3_description")}
            </p>
          </div>
        </div>

        {/* --- Tier cards grid --- */}
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="grid grid-cols-3 gap-3 md:gap-4 pt-8">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                onClick={() => handleTierClick(tier)}
                className={`
                  cursor-pointer border-2 rounded-lg py-4 px-2 flex flex-col items-center justify-between transition-all duration-200 h-full min-h-[120px] md:min-h-[150px]
                  ${
                    selectedTier?.id === tier.id
                      ? "border-darkGold transform scale-105 z-10 shadow-lg"
                      : "border-darkGold hover:scale-102"
                  }
                `}
              >
                <span className="text-lg md:text-2xl xl:text-3xl font-extrabold mb-1">
                  {tier.price}
                </span>
                <span className="text-sm md:text-lg font-medium mb-2">
                  {tier.label}
                </span>
                <span className="text-xs text-gray-300 md:text-sm">
                  {tier.desc}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm md:text-lg font-normal">
            {t("coaching.coaching_limited_spots")}
          </p>

          {/* --- Floating CTA button --- */}
          <div
            ref={buttonStopContainerRef}
            className="relative flex justify-center pt-2 mt-2"
            style={{ minHeight: "80px" }}
          >
            <button
              ref={buttonRef}
              onClick={openCoachingForm}
              style={buttonPositionStyle}
              disabled={!selectedCategory && !selectedTier}
              className={`
                bg-darkGold w-auto min-w-[15rem] md:min-w-[20rem] max-w-[90vw] sm:max-w-xs md:max-w-sm text-black md:text-xl font-bold px-4 md:px-8 py-3 md:py-4 rounded-lg shadow-lg hover:bg-opacity-90 truncate
                ${!selectedCategory && !selectedTier ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {floatingButtonText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DirectCoaching;