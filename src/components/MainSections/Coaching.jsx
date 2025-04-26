// components/DirectCoaching.jsx
import React, { useState } from "react";
// You'll need to create or import these SVG icons
// For now I'll use placeholder references
import InvestIcon from "../../assets/icons/Stocks Branco.svg";
import TrainerIcon from "../../assets/icons/PersonalTrainer Branco.svg";
import DatingIcon from "../../assets/icons/Dating Branco.svg";
import OnlyFansIcon from "../../assets/icons/Onlyfans Branco.svg";
import BusinessIcon from "../../assets/icons/Business Branco.svg";
import HabitsIcon from "../../assets/icons/Habits Branco.svg";
import { useNavigate } from "react-router-dom";
import { ServiceContext } from "../contexts/ServiceContext";
import { useContext } from "react";

function DirectCoaching() {
  const { service, setService } = useContext(ServiceContext);
  const [tier, setTier] = useState("basic");
  const navigate = useNavigate();

  const openForm = (service) => {
    setService(service);                          // ① tell the form which one
    document                                     // ② smooth scroll
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });   // MDN example :contentReference[oaicite:2]{index=2}
  };

  const tiers = [
    {
      id: "basic",
      price: 40,
      label: "Basic",
      desc: "Answers to all questions weekly",
    },
    {
      id: "standard",
      price: 90,
      label: "Standard",
      desc: "Answers to all questions in 48h",
    },
    {
      id: "premium",
      price: 230,
      label: "Premium",
      desc: "Priority answer to all questions ASAP",
    },
  ];

  const handleServiceClick = () => {
    navigate(`/?service=coaching#coaching-journey`);
    setTimeout(() => {
      const el = document.getElementById("coaching-journey");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
  return (
    <section id="coaching" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold">Direct Coaching</h2>
        <p className="">
          Personalized coaching to help you excel in specific areas of your
          life. Get direct access to expert guidance tailored to your unique
          situation and goals.
        </p>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 text-white">
          {[
            {
              title: "Learn How to Invest",
              icon: (
                <img
                  src={InvestIcon}
                  alt="Investment"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "Personal Trainer",
              icon: (
                <img
                  src={TrainerIcon}
                  alt="Fitness"
                  className="w-10 h-8 object-contain"
                />
              ),
            },
            {
              title: "Dating Coach",
              icon: (
                <img
                  src={DatingIcon}
                  alt="Dating"
                  className="w-10 h-8 object-contain"
                />
              ),
            },
            {
              title: "OnlyFans Coaching",
              icon: (
                <img
                  src={OnlyFansIcon}
                  alt="OnlyFans"
                  className="w-10 h-8 object-contain"
                />
              ),
            },
            {
              title: "Business Advisor",
              icon: (
                <img
                  src={BusinessIcon}
                  alt="Business"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "Habits & Personal Growth",
              icon: (
                <img
                  src={HabitsIcon}
                  alt="Habits"
                  className="w-8 h-8 object-contain"
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
              <div className="font-semibold text-[13px]">{item.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full mx-auto px-4 mt-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Anytime Communication Feature */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
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
            <h4 className="text-xl font-medium text-white mb-2">
              Anytime Communication
            </h4>
            <p className="text-white">
              Text or send audio messages anytime with questions, updates, or
              challenges. Get support when you need it most without waiting for
              scheduled appointments.
            </p>
          </div>

          {/* Multi-format Responses */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
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
            <h4 className="text-xl font-medium text-white mb-2">
              Flexible Response Formats
            </h4>
            <p className="text-white">
              Receive guidance through text, audio, or video responses based on
              your preference and the complexity of the topic. Visual
              demonstrations when needed, quick text answers when appropriate.
            </p>
          </div>

          {/* Personalized Classes */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
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
            <h4 className="text-xl font-medium text-white mb-2">
              Personalized Classes
            </h4>
            <p className="text-white">
              Receive custom-tailored training sessions designed specifically
              for your skill level, learning style, and goals. Each class builds
              on your progress for maximum growth and development.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mt-8 mx-auto text-center space-y-6">
        <p className="text-lg text-white max-w-3xl mx-auto">
            Direct coaching provides consistent support, accountability, and
            expertise to help you achieve transformative results in your chosen
            area. Experience the difference that personalized attention makes.
          </p>
        {/* Tier Selector */}
        <div className="grid grid-cols-3 gap-4 pt-2 mt-6">
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
              <span className="text-xl font-extrabold mb-1">{t.price}€</span>
              <span className="text-sm mb-2">{t.label}</span>
              <span className="text-xs text-gray-300">{t.desc}</span>
            </label>
          ))}
        </div>

        <p className="text-sm font-normal">Limited Spots</p>

        <div className="flex justify-center pt-2">
          <button
            onClick={() => openForm("coaching")}
            className="bg-darkGold w-60 text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 "
        >
          Get My Number
        </button>
        </div>
      </div>
      </div>
    </section>
  );
}

export default DirectCoaching;
