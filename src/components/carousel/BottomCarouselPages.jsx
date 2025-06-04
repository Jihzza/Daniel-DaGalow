import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SocialMedia from "./SocialMedia";
import FAQs from "./FAQs";
import Bugs from "./Bugs";

export default function PageCarousel() {
  const { t } = useTranslation();
  const pages = [
    { label: t("bottom_carousel.pages.social_media"), Component: SocialMedia },
    { label: t("bottom_carousel.pages.faqs"), Component: FAQs },
    { label: t("bottom_carousel.pages.bugs"), Component: Bugs },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const ActiveComponent = pages[activeIdx].Component;

  return (
    <section id="bottom-carousel" className="py-8 overflow-visible px-4">
      {" "}
      <div className="flex overflow-x-auto hide-scrollbar space-x-4 -mx-4 px-4">
        {pages.map((p, i) => (
          <button
            key={p.label}
            type="button" // ← no form‑submit!
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
