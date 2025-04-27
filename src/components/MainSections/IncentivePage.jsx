// components/SimpleAccountIncentive.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function SimpleAccountIncentive() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <section id="account-incentive" className="py-8 px-4 text-black">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        {/* Main Heading */}
        <h2 className="text-2xl md:text-3xl font-bold">
          {t('incentive.title')}
        </h2>
        
        <p className="">
          {t('incentive.description')}
        </p>
        
        {/* Benefits */}
        <div className="bg-oxfordBlue text-white p-6 rounded-xl border-2 border-darkGold mb-8">
          <h3 className="text-xl font-bold mb-4">{t('incentive.benefits.title')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start">
              <span className="text-darkGold mr-2">✓</span>
              <p>{t('incentive.benefits.items.consultation')}</p>
            </div>
            <div className="flex items-start">
              <span className="text-darkGold mr-2">✓</span>
              <p>{t('incentive.benefits.items.history')}</p>
            </div>
            <div className="flex items-start">
              <span className="text-darkGold mr-2">✓</span>
              <p>{t('incentive.benefits.items.content')}</p>
            </div>
            <div className="flex items-start">
              <span className="text-darkGold mr-2">✓</span>
              <p>{t('incentive.benefits.items.dashboard')}</p>
            </div>
          </div>
        </div>
        
        {/* Chatbot Info */}
        <div className="bg-oxfordBlue text-white p-6 rounded-xl border-2 border-darkGold mb-10">
          <h3 className="text-xl font-bold mb-4">{t('incentive.chatbot.title')}</h3>
          <p className="mb-4">
            {t('incentive.chatbot.description')}
          </p>
          
          <div className="text-left max-w-md mx-auto">
            <p className="mb-2">{t('incentive.chatbot.capabilities.title')}</p>
            <div className="flex items-start mb-2">
              <span className="text-darkGold mr-2">•</span>
              <p>{t('incentive.chatbot.capabilities.info')}</p>
            </div>
            <div className="flex items-start mb-2">
              <span className="text-darkGold mr-2">•</span>
              <p>{t('incentive.chatbot.capabilities.recommendations')}</p>
            </div>
            <div className="flex items-start">
              <span className="text-darkGold mr-2">•</span>
              <p>{t('incentive.chatbot.capabilities.preparation')}</p>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <button
          onClick={handleSignUp}
          className="bg-darkGold text-black font-bold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300"
        >
          {t('incentive.cta.button')}
        </button>
      </div>
    </section>
  );
}

export default SimpleAccountIncentive;