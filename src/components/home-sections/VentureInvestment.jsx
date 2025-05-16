import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import perspectiv from "../../assets/logos/Perspectiv Banner.svg";
import galow from "../../assets/logos/Galow Banner.png";

// Floating button constants (copied from Coaching/Services)
const NAVIGATION_BAR_HEIGHT = 60;
const BUTTON_PADDING_ABOVE_NAV = 10;
const SMOOTH_TRANSITION = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';

export default function VentureInvestmentAndProjects() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  // Floating button logic (copied from Coaching/Services)
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

  const handleServiceClick = (service) => {
    const mapping = {
      pitchdeck: "#pitch-deck-request",
    };
    navigate(`/?service=${service}${mapping[service]}`);
    setTimeout(() => {
      const id = mapping[service].slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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
              onClick={() => handleServiceClick("pitchdeck")}
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
