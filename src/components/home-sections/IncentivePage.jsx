// src/components/home-sections/IncentivePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation
import AuthModal from "../Auth/AuthModal";

// You might want to add relevant icons here if you choose to use them
// import AccountIcon from '../../assets/icons/AccountIcon.svg'; // Example
// import ChatbotIcon from '../../assets/icons/ChatbotIcon.svg'; // Example

function IncentivePage() {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize the t function
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignUp = () => {
    setShowAuthModal(true);
  };

  // Common styling for the benefit boxes
  const boxStyle = " text-black p-6 rounded-xl";
  const benefitItemStyle = "flex items-start text-sm md:text-lg"; // Adjusted for brevity
  const checkIcon = <span className="text-darkGold mr-2 text-lg">✓</span>; // Larger check
  const bulletIcon = <span className="text-darkGold mr-2 text-lg">•</span>; // Using a bullet for the second list for differentiation

  return (
    <section id="account-incentive" className="py-8 px-4 text-black">
      <div className="max-w-3xl mx-auto text-center space-y-10"> {/* Increased space-y for separation */}

        {/* Section 1: Create Your Account */}
        <div className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-black">
            {t('incentivePage.account.title')}
          </h3>
          <p className="md:text-lg text-black">
            {t('incentivePage.account.description')}
          </p>
          <div className={boxStyle}>
            <ul className="space-y-3 text-left">
              <li className={benefitItemStyle}>
                {checkIcon}
                {t('incentivePage.account.benefit1')}
              </li>
              <li className={benefitItemStyle}>
                {checkIcon}
                {t('incentivePage.account.benefit2')}
              </li>
              <li className={benefitItemStyle}>
                {checkIcon}
                {t('incentivePage.account.benefit3')}
              </li>
            </ul>
          </div>
          <button
            onClick={handleSignUp}
            className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
          >
            {t('incentivePage.account.cta')}
          </button>
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            initialView="signup"
          />
        </div>

        {/* Optional: Divider for better visual separation if desired */}
        {/* <hr className="border-darkGold/50 my-8 md:my-12" /> */}

        {/* Section 2: Use Our Chatbot */}
        <div className="space-y-6">
          <h3 className="text-xl md:text-3xl font-bold text-black">
            {t('incentivePage.chatbot.title')}
          </h3>
          <p className="md:text-lg text-black">
            {t('incentivePage.chatbot.description')}
          </p>
          <div className={boxStyle}>
            <ul className="space-y-3 text-left">
              <li className={benefitItemStyle}>
                {bulletIcon}
                {t('incentivePage.chatbot.benefit1')}
              </li>
              <li className={benefitItemStyle}>
                {bulletIcon}
                {t('incentivePage.chatbot.benefit2')}
              </li>
              <li className={benefitItemStyle}>
                {bulletIcon}
                {t('incentivePage.chatbot.benefit3')}
              </li>
            </ul>
          </div>
          {/* No separate CTA for chatbot as it's integrated into the service flow */}
        </div>

      </div>
    </section>
  );
}

export default IncentivePage;