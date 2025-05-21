// components/Services.js
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { motion } from "framer-motion";
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
import Consultation from "../../assets/icons/Consultation Preto.svg";
import { ServiceContext } from "../../contexts/ServiceContext";
import { useTranslation } from "react-i18next";

const NAVIGATION_BAR_HEIGHT = 60;
const BUTTON_PADDING_ABOVE_NAV = 10;
const SMOOTH_TRANSITION =
  "opacity 0.2s ease-in-out, transform 0.2s ease-in-out";

function Services() {
  const { t } = useTranslation();
  const { setService } = useContext(ServiceContext);
  const [selectedServiceItem, setSelectedServiceItem] = useState(null);

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

  const descriptionInnerContentRef = useRef(null);
  const [calculatedHeight, setCalculatedHeight] = useState(0);

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

  const openForm = (serviceId) => {
    setService(serviceId || "booking");
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const serviceItemsData = [
    { id: "mindset", titleKey: "services.service_1", Icon: Brain, alt: "Brain", buttonActionKey: "services.button_action_mindset", moreInfoKey: "services.service_1_moreInfo" },
    { id: "social_media", titleKey: "services.service_2", Icon: Phone, alt: "Phone", buttonActionKey: "services.button_action_social_media", moreInfoKey: "services.service_2_moreInfo" },
    { id: "finance", titleKey: "services.service_3", Icon: MoneyBag, alt: "MoneyBag", buttonActionKey: "services.button_action_finance", moreInfoKey: "services.service_3_moreInfo" },
    { id: "marketing", titleKey: "services.service_4", Icon: Target, alt: "Target", buttonActionKey: "services.button_action_marketing", moreInfoKey: "services.service_4_moreInfo" },
    { id: "business_building", titleKey: "services.service_5", Icon: Bag, alt: "Bag", buttonActionKey: "services.button_action_business_building", moreInfoKey: "services.service_5_moreInfo" },
    { id: "relationships", titleKey: "services.service_6", Icon: Heart, alt: "Heart", buttonActionKey: "services.button_action_relationships", moreInfoKey: "services.service_6_moreInfo" },
    { id: "health_fitness", titleKey: "services.service_7", Icon: Fitness, alt: "Fitness", buttonActionKey: "services.button_action_health_fitness", moreInfoKey: "services.service_7_moreInfo" },
    { id: "onlyfans_services", titleKey: "services.service_8", Icon: OnlyFans, alt: "OnlyFans", buttonActionKey: "services.button_action_onlyfans", moreInfoKey: "services.service_8_moreInfo" },
    { id: "ai_tech", titleKey: "services.service_9", Icon: Robot, alt: "Robot", buttonActionKey: "services.button_action_ai_tech", moreInfoKey: "services.service_9_moreInfo" },
    { id: "more_services", titleKey: "services.service_10", Icon: More, alt: "More", buttonActionKey: "services.button_action_more_services", moreInfoKey: "services.service_10_moreInfo" },
  ];

  const serviceItems = serviceItemsData.map((item) => ({
    ...item,
    title: t(item.titleKey),
    description: t(item.moreInfoKey),
    translatedButtonActionKey: t(item.buttonActionKey),
  }));

  useEffect(() => {
    if (selectedServiceItem && descriptionInnerContentRef.current) {
      const timer = setTimeout(() => {
        if (descriptionInnerContentRef.current) {
          setCalculatedHeight(descriptionInnerContentRef.current.scrollHeight);
        }
      }, 0);
      return () => clearTimeout(timer);
    } else if (!selectedServiceItem) {
      setCalculatedHeight(0);
    }
  }, [selectedServiceItem]);

  const handleServiceItemClick = (item) => {
    if (selectedServiceItem && selectedServiceItem.id === item.id) {
      setSelectedServiceItem(null);
    } else {
      setSelectedServiceItem(item);
    }
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
    if (isButtonVisibleBasedOnSection) {
      handleScroll();
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);
    } else {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (hasButtonReachedFinalPosition.current) {
        setButtonPositionStyle((prev) => ({
          ...prev,
          position: "absolute",
          opacity: 1,
        }));
      } else {
        setButtonPositionStyle((prev) => ({
          ...prev,
          opacity: 0,
          transition: SMOOTH_TRANSITION,
        }));
      }
    }
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isButtonVisibleBasedOnSection, handleScroll]);

  const floatingButtonText = selectedServiceItem
    ? selectedServiceItem.translatedButtonActionKey
    : t("services.button_book_consultation_default");

    const descriptionVariants = {
      open: {
        opacity: 1,
        height: calculatedHeight, // This will be the scrollHeight of the padded inner content
        // paddingTop: "1rem", // REMOVE
        // paddingBottom: "1rem", // REMOVE
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
        // paddingTop: "0rem", // REMOVE
        // paddingBottom: "0rem", // REMOVE
        marginTop: "0rem",
        marginBottom: "0rem",
        transition: {
          duration: 0.4,
          ease: "easeInOut",
        },
      },
    };

  const renderedItemsWithDescriptions = [];
  let rowBuffer = [];

  let selectedItemRowIndex = -1;
  if (selectedServiceItem) {
    const itemIndex = serviceItems.findIndex(
      (s) => s.id === selectedServiceItem.id
    );
    if (itemIndex !== -1) {
      selectedItemRowIndex = Math.floor(itemIndex / columns);
    }
  }

  serviceItems.forEach((item, index) => {
    rowBuffer.push(
      <motion.div
        key={item.id}
        onClick={() => handleServiceItemClick(item)}
        className={`
          flex flex-col items-center justify-center p-4 w-[154px] h-[108px] md:w-[200px] md:h-[140px] border-2 rounded-lg text-center shadow-lg cursor-pointer transition-all duration-200 ease-in-out
          ${
            selectedServiceItem?.id === item.id
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

    const currentRowIndex = Math.floor(index / columns);

    if ((index + 1) % columns === 0 || index === serviceItems.length - 1) {
      renderedItemsWithDescriptions.push(
        <React.Fragment key={`row-items-${currentRowIndex}`}>
          {rowBuffer.map((bufferedItem) => bufferedItem)}
        </React.Fragment>
      );
      rowBuffer = [];

      const isThisRowsDescriptionVisible =
        selectedServiceItem !== null &&
        currentRowIndex === selectedItemRowIndex;

      let rowDescriptionItem = null;
      if (isThisRowsDescriptionVisible) {
        const startIdx = currentRowIndex * columns;
        const itemsInCurrentRow = serviceItems.slice(startIdx, startIdx + columns);
        rowDescriptionItem = itemsInCurrentRow.find(si => si.id === selectedServiceItem.id) || null;
      }
      
      const descriptionColSpanClass = columns === 2 ? "col-span-2" : "col-span-3";

      renderedItemsWithDescriptions.push(
        <motion.div
          layout
          transition={{ duration: 0.4, ease: "easeInOut" }}
          key={`desc-slot-for-row-${currentRowIndex}`}
          className={`${descriptionColSpanClass} overflow-hidden`} // Keep overflow-hidden
          initial="collapsed"
          animate={isThisRowsDescriptionVisible ? "open" : "collapsed"}
          variants={descriptionVariants} // Use the modified variants
          style={{
            pointerEvents: isThisRowsDescriptionVisible ? "auto" : "none",
          }}
        >
          <div 
            ref={isThisRowsDescriptionVisible ? descriptionInnerContentRef : null}
            style={{
              paddingTop: isThisRowsDescriptionVisible ? '1rem' : '0rem',
              paddingBottom: isThisRowsDescriptionVisible ? '1rem' : '0rem',
              // The transition for these paddings appearing/disappearing will be
              // part of the overall layout animation handled by the parent motion.div
            }}
          >
            <div className="rounded-lg text-white"> {/* Your existing styling div */}
              {isThisRowsDescriptionVisible && rowDescriptionItem && (
                <>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-darkGold">
                    {rowDescriptionItem.title}
                  </h3>
                  <p className="text-sm md:text-base">{rowDescriptionItem.description}</p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      );
    }
  });

  const gridLayoutClasses = columns === 2 
    ? "grid-cols-2" 
    : "grid-cols-3 md:grid-cols-3";

  return (
    <section ref={sectionRef} id="services" className="py-8 px-4 text-white bg-oxfordBlue">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold">
          {t("services.services_title")}
        </h2>
        <p className="md:text-xl">{t("services.services_description")}</p>

        <div className={`grid ${gridLayoutClasses} gap-2 md:gap-6 place-items-center md:place-items-start`}>
          {renderedItemsWithDescriptions}
        </div>
      </div>

      <div className="w-full mx-auto px-4 mt-8 md:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">{t("services.services_structure_1_title")}</h4>
            <p className="text-white md:text-xl">{t("services.services_structure_1_description")}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">{t("services.services_structure_2_title")}</h4>
            <p className="text-white md:text-xl">{t("services.services_structure_2_description")}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">{t("services.services_structure_3_title")}</h4>
            <p className="text-white md:text-xl">{t("services.services_structure_3_description")}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">{t("services.services_structure_4_title")}</h4>
            <p className="text-white md:text-xl">{t("services.services_structure_4_description")}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <img
                src={Consultation}
                alt="Consultation"
                className="w-7 h-7 md:w-12 md:h-12 object-contain"
              />
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">{t("services.services_structure_5_title")}</h4>
            <p className="text-white md:text-xl">{t("services.services_structure_5_description")}</p>
          </div>
        </div>
        <div
          ref={buttonStopContainerRef}
          className="relative flex justify-center pt-2 mt-10"
          style={{ minHeight: "80px" }}
        >
          <button
            ref={buttonRef}
            onClick={() =>
              openForm(selectedServiceItem ? selectedServiceItem.id : "booking")
            }
            style={buttonPositionStyle}
            className="bg-darkGold w-auto min-w-[15rem] md:min-w-[20rem] max-w-[90vw] sm:max-w-xs md:max-w-sm text-black md:text-xl font-bold px-4 md:px-8 py-3 md:py-4 rounded-lg shadow-lg hover:bg-opacity-90 truncate"
          >
            {floatingButtonText}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Services;