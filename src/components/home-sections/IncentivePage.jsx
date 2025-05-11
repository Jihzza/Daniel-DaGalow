// src/components/home-sections/IncentivePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthModal from "../Auth/AuthModal";

// You might want to add relevant icons here if you choose to use them
// import AccountIcon from '../../assets/icons/AccountIcon.svg'; // Example
// import ChatbotIcon from '../../assets/icons/ChatbotIcon.svg'; // Example

function IncentivePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignUp = () => {
    setShowAuthModal(true);
  };

  // Common styling for the benefit boxes
  const boxStyle = " text-black p-6 rounded-xl border-2 border-darkGold";
  const benefitItemStyle = "flex items-start text-sm md:text-lg"; // Adjusted for brevity
  const checkIcon = <span className="text-darkGold mr-2 text-lg">✓</span>; // Larger check

  return (
    <section id="account-incentive" className="py-8 px-4 text-black">
      <div className="max-w-3xl mx-auto text-center space-y-10"> {/* Increased space-y for separation */}

        {/* Section 1: Create Your Account */}
        <div className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-black">
            {t('incentive.account.title', "Create Your Account")}
          </h3>
          <p className="md:text-lg text-black">
            {t('incentive.account.description_simple', "Create an account in moments to schedule services and keep track of your journey with me. It's essential for all bookings and automatically created if you schedule a service.")}
          </p>
          <div className={boxStyle}>
            <ul className="space-y-3 text-left">
              <li className={benefitItemStyle}>
                {checkIcon}
                {t('incentive.account.benefit_schedule', "Schedule all services like consultations & coaching.")}
              </li>
              <li className={benefitItemStyle}>
                {checkIcon}
                {t('incentive.account.benefit_history', "Access your appointment history and saved chatbot conversations.")}
              </li>
              <li className={benefitItemStyle}>
                {checkIcon}
                {t('incentive.account.benefit_updates', "Stay informed with service updates")}
              </li>
            </ul>
          </div>
          <button
            onClick={handleSignUp}
            className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
          >
            {t('incentive.cta.button', "Create Your Free Account")}
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
          <h3 className="text-xl md:text-3xl font-bold text-black"> {/* Adjusted to text-xl like your other h3 for chatbot */}
            {t('incentive.chatbot.title_simple', "Smart Assistance: Our AI Chatbot")}
          </h3>
          <p className="md:text-lg text-black">
            {t('incentive.chatbot.description_simple', "Our AI assistant helps you find the right services and prepares us for your consultations, saving you time and money.")}
          </p>
          <div className={boxStyle}>
            <ul className="space-y-3 text-left">
              <li className={benefitItemStyle}>
                <span className="text-darkGold mr-2 text-lg">•</span>
                {t('incentive.chatbot.benefit_navigate', "Guides you to the best service for your needs.")}
              </li>
              <li className={benefitItemStyle}>
                <span className="text-darkGold mr-2 text-lg">•</span>
                {t('incentive.chatbot.benefit_prepare', "Gathers key info before sessions for a focused consultation.")}
              </li>
              <li className={benefitItemStyle}>
                <span className="text-darkGold mr-2 text-lg">•</span>
                {t('incentive.chatbot.benefit_info', "Provides instant answers about our services.")}
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