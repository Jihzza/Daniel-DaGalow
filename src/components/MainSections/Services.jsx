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

function Services() {
  const navigate = useNavigate();
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
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold">How I Can Help You</h2>
        <p className="">
          Whether you need guidance on mindset, social media growth, finance,
          marketing, business building, or relationships – I cover it all.
        </p>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 text-white">
          {[
            {
              title: "Mindset & Psychology",
              icon: (
                <img
                  src={Brain}
                  alt="Brain"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "Social Media Growth",
              icon: (
                <img
                  src={Phone}
                  alt="Phone"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "Finance & Wealth",
              icon: (
                <img
                  src={MoneyBag}
                  alt="MoneyBag"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "Marketing & Sales",
              icon: (
                <img
                  src={Target}
                  alt="Target"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "Business Building",
              icon: (
                <img src={Bag} alt="Bag" className="w-8 h-8 object-contain" />
              ),
            },
            {
              title: "Relationships",
              icon: (
                <img
                  src={Heart}
                  alt="Heart"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "Health & Fitness",
              icon: (
                <img
                  src={Fitness}
                  alt="Fitness"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "OnlyFans",
              icon: (
                <img
                  src={OnlyFans}
                  alt="OnlyFans"
                  className="w-10 h-8 object-contain"
                />
              ),
            },
            {
              title: "AI & Tech",
              icon: (
                <img
                  src={Robot}
                  alt="Robot"
                  className="w-10 h-8 object-contain"
                />
              ),
            },
            {
              title: "Way More",
              icon: (
                <img
                  src={More}
                  alt="More"
                  className="w-10 h-8 object-contain"
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
        <h3 className="text-2xl md:text-3xl font-semibold text-center text-white mb-8">
          What to Expect From Your Consultation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Video Call Feature */}
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-medium text-white mb-2">
              Face-to-Face Video Call
            </h4>
            <p className="text-white">
              Our consultations take place via video call, allowing us to
              connect personally. You'll be able to see me throughout the
              session, creating a more engaging and personal experience.
            </p>
          </div>

          {/* Duration Feature */}
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-medium text-white mb-2">
              Minimum 45-Minute Sessions
            </h4>
            <p className="text-white">
              Each consultation lasts a minimum of 45 minutes, ensuring we have
              adequate time to explore your concerns in depth and develop
              meaningful insights and action plans.
            </p>
          </div>

          {/* Recording Feature */}
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
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-medium text-white mb-2">
              Session Recordings
            </h4>
            <p className="text-white">
              All consultations are recorded and securely stored, giving both of
              us access to review the session afterward. This allows you to
              revisit insights and recommendations without having to take notes
              during our time together.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-lg text-white max-w-3xl mx-auto">
            These features are designed to maximize the value of our time
            together and provide you with ongoing support even after our session
            ends. Your comfort and progress are my top priorities.
          </p>
          <div className="mt-6 w-full">
            <h1 className="text-white text-2xl py-2 font-bold">
              $90 / hour
            </h1>
            <p className="text-white text-sm pb-6">Minimum 45 minutes</p>
            <button
              onClick={() => handleServiceClick("booking")}
              className="bg-darkGold w-60 text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
            >
              Book a Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;
