// components/home-sections/VentureInvestment.jsx
import React, { useRef, useState, useEffect, useCallback, useContext } from "react"; // Added useContext
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import perspectiv from "../../assets/logos/Perspectiv Banner.svg";
import galow from "../../assets/logos/Galow Banner.png";
import { ServiceContext } from "../../contexts/ServiceContext"; // Ensure this path is correct

// Floating button constants (copied from Coaching/Services)
const NAVIGATION_BAR_HEIGHT = 60;
const BUTTON_PADDING_ABOVE_NAV = 10;
const SMOOTH_TRANSITION = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';

export default function VentureInvestmentAndProjects() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setService } = useContext(ServiceContext); // Get setService from context

  // Floating button state/refs
  const [isButtonVisibleBasedOnSection, setIsButtonVisibleBasedOnSection] = useState(false);
  const [buttonPositionStyle, setButtonPositionStyle] = useState({
    position: 'absolute', opacity: 0, bottom: '0px', left: '50%',
    transform: 'translateX(-50%)', transition: SMOOTH_TRANSITION, zIndex: 1,
  });
  const sectionRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonStopContainerRef = useRef(null);
  const hasButtonReachedFinalPosition = useRef(false);

  // Floating button logic ( 그대로 유지 )
  useEffect(() => {
    const observer = new window.IntersectionObserver(
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
  const handleServiceClick = (serviceId) => {
    // 1. Set the service in context
    setService(serviceId); // serviceId will be "pitchdeck"

    // 2. Navigate to the root path where MergedServiceForm resides.
    // MergedServiceForm will detect the service from context and render PitchDeckRequest.
    // We also add a hash to help the browser scroll, though manual scroll is more reliable.
    const targetFormId = "pitch-deck-request"; // ID of the section in PitchDeckRequest.jsx
    navigate(`/#${targetFormId}`);

    // 3. Scroll to the MergedServiceForm container first, then to the specific form.
    // MergedServiceForm's own scroll hook will likely handle scrolling "service-selection" into view.
    // This timeout ensures that after MergedServiceForm has updated and rendered PitchDeckRequest,
    // we attempt to scroll to the actual form.
    setTimeout(() => {
      const formElement = document.getElementById(targetFormId);
      if (formElement) {
        const headerElement = document.querySelector('header'); // Assuming your header is a <header> tag
        const headerOffset = headerElement ? headerElement.offsetHeight : 70; // Default offset
        
        const elementPosition = formElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      } else {
        // Fallback scroll to the main service form container if the specific form ID isn't found immediately
        const serviceSelectionElement = document.getElementById("service-selection");
        if (serviceSelectionElement) {
           serviceSelectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }, 150); // Adjust delay if necessary, 150ms is usually a good starting point
  };

  const projects = [
    {
      name: t("projects.project_1_name"),
      description: t("projects.project_1_description"),
      image: perspectiv,
    },
    {
      name: t("projects.project_2_name"),
      description: t("projects.project_2_description"),
      image: galow,
    },
    // Add more projects as needed…
  ];

  return (
    <>
      <section ref={sectionRef} id="venture-investment" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-2xl md:text-4xl font-bold">
            {t("projects.projects_title")}
          </h2>
          <div className="space-y-8 flex flex-col items-center">
            {projects.map((project, index) => (
              <div key={index} className="flex flex-col md:w-[60vw] items-center gap-6 border-2 border-darkGold rounded-lg py-8 px-8">
                <img src={project.image} alt={project.name} className="w-[200px] md:w-[300px] h-auto object-cover rounded"/>
                <div className="text-left md:text-center md:space-y-4">
                  <h3 className="text-xl md:text-3xl font-semibold">{project.name}</h3>
                  <p className="text-sm md:text-lg">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-8 max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold">{t("venture_investment.venture_title")}</h2>
          <p className="text-white text-center mx-auto md:text-lg">
            {t("venture_investment.venture_description")}
          </p>
          <div
            ref={buttonStopContainerRef}
            className="relative flex justify-center"
            style={{ minHeight: '80px' }}
          >
            <button
              ref={buttonRef}
              onClick={() => handleServiceClick("pitchdeck")} // Updated onClick handler
              style={buttonPositionStyle}
              className="bg-darkGold w-auto min-w-[15rem] md:min-w-[20rem] max-w-[90vw] sm:max-w-xs md:max-w-sm text-black md:text-xl font-bold px-4 md:px-8 py-3 md:py-4 rounded-lg shadow-lg hover:bg-opacity-90 truncate"
            >
              {t("venture_investment.venture_request_pitch")}
            </button>
          </div>
        </div>
      </section>
      
    </>
  );
}