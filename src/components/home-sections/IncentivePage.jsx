// src/components/home-sections/IncentivePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext"; // Needed for signUp
import { supabase } from "../../utils/supabaseClient"; // Needed for direct Supabase operations if any, or by useAuth
import chatbotIcon from '../../assets/icons/Dagalow Preto.svg';

function IncentivePage({ onChatbotOpen }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signUp } = useAuth(); // Get the signUp function

  // State for the simplified signup form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDirectSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError(t('auth.signup.errors.password_mismatch'));
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError(t('auth.signup.errors.password_length'));
      setLoading(false);
      return;
    }
    if (!fullName.trim()) {
      setError(t('auth.signup.errors.full_name_required')); // Assuming you add this translation
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await signUp(email, password, {
        data: { full_name: fullName }, // Supabase specific: pass additional user metadata
        emailRedirectTo: window.location.origin
      });

      if (signUpError) throw signUpError;

      setMessage(t('auth.signup.success.message_incentive_page', "Check your email for the confirmation link!")); 
      // Clear form
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (signUpError) {
      setError(signUpError.message || t('auth.signup.errors.default'));
    } finally {
      setLoading(false);
    }
  };

  const handleChatbotClick = () => {
    if (typeof onChatbotOpen === 'function') {
      onChatbotOpen();
    } else {
      console.warn("IncentivePage: onChatbotOpen prop is not a function or not provided.");
    }
  };

  return (
    <section id="account-incentive" className="py-8 px-4 text-black">
      {/* Reduced space-y from 10 to 6 to decrease gap between sections */}
      <div className="max-w-3xl mx-auto text-center space-y-6">

        <div className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-black">
            {t('incentivePage.account.title')}
          </h3>
          <p className="md:text-lg text-black">
            {t('incentivePage.account.description')}
          </p>

          {/* Simplified Signup Form Integrated Directly */}
          <form onSubmit={handleDirectSignup} className="mt-6 max-w-md mx-auto space-y-4 text-left">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                {message}
              </div>
            )}
            <div>
              <label htmlFor="fullNameIncentive" className="block text-sm font-medium text-black mb-1">
                {t('auth.signup.full_name.label')}
              </label>
              <input
                id="fullNameIncentive"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder={t('auth.signup.full_name.placeholder')}
                className="w-full px-3 py-2 bg-transparent border border-darkGold placeholder:text-black/50 rounded-md shadow-sm focus:outline-none focus:ring-darkGold focus:border-darkGold sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="emailIncentive" className="block text-sm font-medium text-black mb-1">
                {t('auth.signup.email.label')}
              </label>
              <input
                id="emailIncentive"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('auth.signup.email.placeholder')}
                className="w-full px-3 py-2 bg-transparent border border-darkGold placeholder:text-black/50 rounded-md shadow-sm focus:outline-none focus:ring-darkGold focus:border-darkGold sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="passwordIncentive" className="block text-sm font-medium text-black mb-1">
                {t('auth.signup.password.label')}
              </label>
              <input
                id="passwordIncentive"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('auth.signup.password.placeholder')}
                className="w-full px-3 py-2 bg-transparent border border-darkGold placeholder:text-black/50 rounded-md shadow-sm focus:outline-none focus:ring-darkGold focus:border-darkGold sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPasswordIncentive" className="block text-sm font-medium text-black mb-1">
                {t('auth.signup.confirm_password.label')}
              </label>
              <input
                id="confirmPasswordIncentive"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder={t('auth.signup.confirm_password.placeholder')}
                className="w-full px-3 py-2 bg-transparent border border-darkGold placeholder:text-black/50 rounded-md shadow-sm focus:outline-none focus:ring-darkGold focus:border-darkGold sm:text-sm"
              />
            </div>
            {/* Wrapped button in a div with text-center to center it */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-150 inline-flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {loading ? t('auth.signup.submit.loading') : t('incentivePage.account.ctaDirect', 'Create Account')}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Use Our Chatbot */}
        {/* pt-6 on this div also contributes to the space. Adjusted parent space-y already. */}
        <div className="space-y-6 pt-6"> 
          <h3 className="text-xl md:text-3xl font-bold text-black">
            {t('incentivePage.chatbot.title')}
          </h3>
          <p className="md:text-lg text-black">
            {t('incentivePage.chatbot.description')}
          </p>
          <button
            onClick={handleChatbotClick}
            className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-150 inline-flex items-center justify-center space-x-3"
          >
            <img src={chatbotIcon} alt={t("navigation.chatbot")} className="w-6 h-6" />
            <span>{t('incentivePage.chatbot.cta', 'Chatbot')}</span>
          </button>
        </div>

      </div>
    </section>
  );
}

export default IncentivePage;