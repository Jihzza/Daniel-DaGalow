// components/DirectCoaching.jsx
import React, { useState } from "react";
import InvestIcon from "../../assets/icons/Stocks Branco.svg";
import TrainerIcon from "../../assets/icons/PersonalTrainer Branco.svg";
import DatingIcon from "../../assets/icons/Dating Branco.svg";
import OnlyFansIcon from "../../assets/icons/Onlyfans Branco.svg";
import BusinessIcon from "../../assets/icons/Business Branco.svg";
import HabitsIcon from "../../assets/icons/Habits Branco.svg";
import { ServiceContext } from "../../contexts/ServiceContext";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

function DirectCoaching() {
  const { setService } = useContext(ServiceContext);
  const [tier, setTier] = useState("basic");
  const { t } = useTranslation();

  const openForm = (service) => {
    setService(service);
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const tiers = [
    {
      id: "basic",
      price: t("coaching.coaching_tier_basic_price"),
      label: t("coaching.coaching_tier_basic_label"),
      desc: t("coaching.coaching_tier_basic_description"),
    },
    {
      id: "standard",
      price: t("coaching.coaching_tier_standard_price"),
      label: t("coaching.coaching_tier_standard_label"),
      desc: t("coaching.coaching_tier_standard_description"),
    },
    {
      id: "premium",
      price: t("coaching.coaching_tier_premium_price"),
      label: t("coaching.coaching_tier_premium_label"),
      desc: t("coaching.coaching_tier_premium_description"),
    },
  ];

  return (
    <section id="coaching" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold">{t("coaching.coaching_title")}</h2>
        <p className="text-sm md:text-xl">{t("coaching.coaching_description")}</p>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 text-white">
          {[
            {
              title: t("coaching.coaching_service_1"),
              icon: (
                <img
                  src={InvestIcon}
                  alt="Investment"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("coaching.coaching_service_2"),
              icon: (
                <img
                  src={TrainerIcon}
                  alt="Fitness"
                  className="w-10 h-8 md:w-14 md:h-14 object-contain"
                />
              ),
            },
            {
              title: t("coaching.coaching_service_3"),
              icon: (
                <img
                  src={DatingIcon}
                  alt="Dating"
                  className="w-10 h-8 md:w-14 md:h-14 object-contain"
                />
              ),
            },
            {
              title: t("coaching.coaching_service_4"),
              icon: (
                <img
                  src={OnlyFansIcon}
                  alt="OnlyFans"
                  className="w-10 h-8 md:w-14 md:h-14 object-contain"
                />
              ),
            },
            {
              title: t("coaching.coaching_service_5"),
              icon: (
                <img
                  src={BusinessIcon}
                  alt="Business"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("coaching.coaching_service_6"),
              icon: (
                <img
                  src={HabitsIcon}
                  alt="Habits"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center h-full p-6 border-2 border-darkGold rounded-lg text-center shadow-lg"
            >
              <div className="flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <div className="font-semibold text-[13px] md:text-lg">{item.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full mx-auto px-4 mt-8 md:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Anytime Communication Feature */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 md:h-12 md:w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
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

          {/* Multi-format Responses */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 md:h-12 md:w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
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

          {/* Personalized Classes */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 md:h-12 md:w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
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

        <div className="max-w-3xl mt-8 mx-auto text-center space-y-6">
          <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
            {t("coaching.coaching_summary")}
          </p>
          
          {/* Tier Selector */}
          <div className="grid grid-cols-3 gap-3 pt-2 mt-6">
            {tiers.map(t => (
              <label
                key={t.id}
                className={`cursor-pointer border-2 rounded-lg py-4 px-2 flex flex-col items-center justify-center transition-all duration-200 ${tier === t.id ? 'border-darkGold bg-darkGold bg-opacity-20' : 'border-darkGold'}`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={t.id}
                  className="hidden"
                  checked={tier === t.id}
                  onChange={() => setTier(t.id)}
                />
                <span className="text-xl md:text-3xl font-extrabold mb-1">{t.price}</span>
                <span className="text-sm md:text-lg mb-2">{t.label}</span>
                <span className="text-xs text-gray-300 md:text-base">{t.desc}</span>
              </label>
            ))}
          </div>

          <p className="text-sm md:text-lg font-normal">{t("coaching.coaching_limited_spots")}</p>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => openForm("coaching")}
              className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
            >
              {t("coaching.coaching_get_number")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DirectCoaching;
