// components/ExpertAnalysis.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
// You'll need to create or import these SVG icons
// For now I'll use placeholder references
import SocialIcon from "../../assets/icons/Phone Branco.svg";
import StocksIcon from "../../assets/icons/MoneyBag Branco.svg";
import PortfolioIcon from "../../assets/icons/Target Branco.svg";
import BusinessIcon from "../../assets/icons/Bag Branco.svg";
import { ServiceContext } from "../contexts/ServiceContext";
import { useContext } from "react";

function ExpertAnalysis() {
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
      analysis: "#analysis-request",
    };
    navigate(`/?service=${service}${mapping[service]}`);
    setTimeout(() => {
      const id = mapping[service].slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <section id="expert-analysis" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold">Expert Analysis</h2>
        <p className="">
          Get professional, in-depth analysis of your investments, business, or social media 
          presence with actionable insights to help you make better decisions and achieve 
          your goals.
        </p>
        
        <div className="grid grid-cols-2 gap-6 md:grid-cols-2 text-white">
          {[
            {
              title: "Social Media Analysis",
              icon: (
                <img
                  src={SocialIcon}
                  alt="Social Media"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "Individual Stock Analysis",
              icon: (
                <img
                  src={StocksIcon}
                  alt="Stocks"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "Portfolio Evaluation",
              icon: (
                <img
                  src={PortfolioIcon}
                  alt="Portfolio"
                  className="w-8 h-8 object-contain"
                />
              ),
            },
            {
              title: "Business/Company Analysis",
              icon: (
                <img
                  src={BusinessIcon}
                  alt="Business"
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
          {/* Quick Consultations Feature */}
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
              Three Quick Consultations
            </h4>
            <p className="text-white">
              Includes three brief sessions to gather basic information, ask follow-up questions, 
              and provide any additional context needed for a comprehensive analysis of your situation.
            </p>
          </div>

          {/* Detailed Analysis */}
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h4 className="text-xl font-medium text-white mb-2">
              Detailed Analysis Report
            </h4>
            <p className="text-white">
              Receive a thorough examination of your current situation, market conditions, 
              competitive landscape, and historical performance. This context helps frame the 
              analysis and recommendations in the most relevant way.
            </p>
          </div>

          {/* Actionable Suggestions */}
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <h4 className="text-xl font-medium text-white mb-2">
              Strategic Recommendations
            </h4>
            <p className="text-white">
              Get clear, actionable suggestions based on the analysis findings. Each recommendation 
              is prioritized and explained, with specific steps you can take to implement changes 
              and improve your outcomes.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-lg text-white max-w-3xl mx-auto">
            My expert analysis services provide you with professional insights backed by years of 
            experience. Whether you're looking to optimize your social media presence, evaluate 
            investment opportunities, or improve your business strategy, I deliver thorough analysis 
            with practical recommendations you can implement immediately.
          </p>
          <div className="mt-8 w-full">
          <h1 className="text-white text-2xl py-2 font-bold">
              Ask For Quote
            </h1>
            <p className="text-white text-sm pb-6">Depends on the Project</p>
          <button
              onClick={() => openForm("analysis")}
              className="bg-darkGold w-60 text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
            >
              Get My Analysis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExpertAnalysis;