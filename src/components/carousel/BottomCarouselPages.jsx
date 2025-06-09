// src/components/carousel/BottomCarouselPages.jsx

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom"; // Import hooks
import SocialMedia from "./SocialMedia";
import FAQs from "./FAQs";
import Bugs from "./Bugs";

export default function PageCarousel() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Add a stable 'id' to each page object for reliable lookups
  const pages = [
    { id: 'social_media', label: t("bottom_carousel.pages.social_media"), Component: SocialMedia },
    { id: 'faqs', label: t("bottom_carousel.pages.faqs"), Component: FAQs },
    { id: 'bugs', label: t("bottom_carousel.pages.bugs"), Component: Bugs },
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  // This new useEffect hook listens for the navigation state change
  useEffect(() => {
    // Check if state was passed from the Header
    if (location.state?.activeCarouselPage) {
      const pageId = location.state.activeCarouselPage;
      const targetIndex = pages.findIndex(p => p.id === pageId);

      // If we found a matching page, update the active index
      if (targetIndex !== -1 && activeIdx !== targetIndex) {
        setActiveIdx(targetIndex);
      }
      
      // IMPORTANT: Clear the state to prevent it from being "sticky".
      // This ensures that if the user refreshes the page, it won't re-trigger this effect.
      navigate(location.pathname + location.hash, { replace: true, state: {} });
    }
  }, [location.state, navigate, pages, activeIdx]); // Dependencies for the effect

  const ActiveComponent = pages[activeIdx].Component;

  return (
    <section id="bottom-carousel" className="py-8 overflow-visible px-4">
      <div className="flex overflow-x-auto hide-scrollbar space-x-4 -mx-4 px-4">
        {pages.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setActiveIdx(i)}
            className={`
              px-3 py-1 md:px-4 md:py-2 rounded-lg whitespace-nowrap font-medium md:text-xl
              ${
                i === activeIdx
                  ? "bg-darkGold text-black border-2 border-darkGold"
                  : " text-black border-darkGold border-2"
              }
            `}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <ActiveComponent />
      </div>
    </section>
  );
}