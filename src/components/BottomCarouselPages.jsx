import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FAQs from './BottomPages/FAQs';
import Bugs from './BottomPages/Bugs';
import SocialMedia from './BottomPages/SocialMedia';

export default function PageCarousel() {
    const { t } = useTranslation();
    const pages = [
        { label: t("bottom_carousel.pages.faqs"), Component: FAQs },
        { label: t("bottom_carousel.pages.bugs"), Component: Bugs },
        { label: t("bottom_carousel.pages.social_media"), Component: SocialMedia },
    ];
    
    const [activeIdx, setActiveIdx] = useState(0);
    const ActiveComponent = pages[activeIdx].Component;

    return (
        <section id="bottom-carousel" className="py-8 px-4">
            <div className="flex overflow-x-auto space-x-4">
                {pages.map((p, i) => (
                    <button
                    key={p.label}
                    type="button"                                  // ← no form‑submit!
                    onClick={() => setActiveIdx(i)}
                    className={`
                      px-3 py-1 rounded-lg whitespace-nowrap font-medium
                      ${i === activeIdx
                        ? 'bg-darkGold text-black border-2 border-darkGold'
                        : ' text-black border-darkGold border-2'}
                    `}
                  >{p.label}
                  </button>
                ))}
            </div>
            <div className="mt-6">
                <ActiveComponent />
            </div>
        </section>
    );
}
