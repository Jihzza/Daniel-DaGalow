// components/Services.js
import React from "react";
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
import { useNavigate } from "react-router-dom";
import { ServiceContext } from "../../contexts/ServiceContext";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

function Services() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { service, setService } = useContext(ServiceContext);

  const openForm = (service) => {
    setService(service);                          // ① tell the form which one
    document                                     // ② smooth scroll
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });   // MDN example :contentReference[oaicite:2]{index=2}
  };

  const handleServiceClick = (service) => {
    const mapping = {
      booking: "#booking",
    };
    navigate(`/?service=${service}${mapping[service]}`);
    setTimeout(() => {
      const id = mapping[service].slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <section id="services" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold">
          {t("services.services_title")}
        </h2>
        <p className="md:text-xl">
          {t("services.services_description")}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-white">
          {[
            {
              title: t("services.service_1"),
              icon: (
                <img
                  src={Brain}
                  alt="Brain"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_2"),
              icon: (
                <img
                  src={Phone}
                  alt="Phone"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_3"),
              icon: (
                <img
                  src={MoneyBag}
                  alt="MoneyBag"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_4"),
              icon: (
                <img
                  src={Target}
                  alt="Target"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_5"),
              icon: (
                <img src={Bag} alt="Bag" className="w-8 h-8 md:w-12 md:h-12 object-contain" />
              ),
            },
            {
              title: t("services.service_6"),
              icon: (
                <img
                  src={Heart}
                  alt="Heart"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_7"),
              icon: (
                <img
                  src={Fitness}
                  alt="Fitness"
                  className="w-8 h-8 md:w-12 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_8"),
              icon: (
                <img
                  src={OnlyFans}
                  alt="OnlyFans"
                  className="w-10 h-8 md:w-14 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_9"),
              icon: (
                <img
                  src={Robot}
                  alt="Robot"
                  className="w-10 h-8 md:w-14 md:h-12 object-contain"
                />
              ),
            },
            {
              title: t("services.service_10"),
              icon: (
                <img
                  src={More}
                  alt="More"
                  className="w-10 h-8 md:w-14 md:h-12 object-contain"
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
          {/* Video Call Feature */}
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
              {t("services.services_structure_1_title")}
            </h4>
            <p className="text-white md:text-xl">
              {t("services.services_structure_1_description")}
            </p>
          </div>

          {/* Duration Feature */}
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
              {t("services.services_structure_2_title")}
            </h4>
            <p className="text-white md:text-xl">
              {t("services.services_structure_2_description")}
            </p>
          </div>

          {/* Recording Feature */}
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
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h4 className="text-xl md:text-3xl font-medium text-white mb-2">
              {t("services.services_structure_3_title")}
            </h4>
            <p className="text-white md:text-xl">
              {t("services.services_structure_3_description")}
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-lg md:text-2xl text-white max-w-3xl mx-auto">
            {t("services.services_structure_description")}
          </p>
          <div className="mt-6 w-full">
            <h1 className="text-white text-2xl md:text-3xl py-2 font-bold">
              {t("services.services_price")}
            </h1>
            <p className="text-white text-sm md:text-lg pb-6">
              {t("services.services_price_minimum_time")}
            </p>
            <div className="flex justify-center pt-2">
            <button
              onClick={() => openForm("booking")}
              className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
            >
              {t("services.services_book_consultation")}
            </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;
