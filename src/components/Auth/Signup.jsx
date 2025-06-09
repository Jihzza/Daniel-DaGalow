// components/Auth/Signup.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { validatePhoneNumber } from '../../utils/phoneValidation';
import { supabase } from '../../utils/supabaseClient';

const EyeIcon = ({ color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = ({ color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const Signup = ({ isModal = false, onSuccess = () => {}, onSwitchToLogin = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [validatingPhone, setValidatingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const phoneValidationTimeout = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { t } = useTranslation();

  const handlePhoneChange = (newPhone) => {
    setPhone(newPhone);
    setIsPhoneValid(false);
    setPhoneError("");

    if (phoneValidationTimeout.current) {
      clearTimeout(phoneValidationTimeout.current);
    }

    if (newPhone.replace(/\D/g, "").length < 8) {
      return;
    }

    phoneValidationTimeout.current = setTimeout(async () => {
      setValidatingPhone(true);
      try {
        const result = await validatePhoneNumber(newPhone);
        setValidatingPhone(false);
        setIsPhoneValid(result.isValid);
        if (!result.isValid) {
          setPhoneError(t("coaching_request.form.phone_validation_error"));
        }
      } catch (error) {
        setValidatingPhone(false);
        setPhoneError("Validation service unavailable");
        console.error("Phone validation error:", error);
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!isPhoneValid) {
        setError("Please enter a valid phone number.");
        return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.signup.errors.password_mismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.signup.errors.password_length'));
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(email, password, {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ phone_number: phone })
          .eq('id', data.user.id);
          
        if (updateError) {
          console.error("Error updating profile with phone number:", updateError.message);
        }
      }

      if (isModal) {
        onSuccess();
      } else {
        setMessage(t('auth.signup.success.message'));
      }
    } catch (error) {
      setError(error.message || t('auth.signup.errors.default'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">   
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1">
            {t('auth.signup.full_name.label')}
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder={t('auth.signup.full_name.placeholder')}
            className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            {t('auth.signup.email.label')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('auth.signup.email.placeholder')}
            className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
          />
        </div>

        <div>
            <label htmlFor="phone-signup" className="block text-gray-700 font-medium mb-1">
                {t("coaching_request.form.phone_label", "Phone Number")}
            </label>
            <div className="relative">
                <PhoneInput
                  inputProps={{
                    name: 'phone',
                    required: true,
                    id: 'phone-signup'
                  }}
                  containerClass="!w-full"
                  inputClass={`!w-full !px-3 !py-2 !text-base !bg-gentleGray !border !border-oxfordBlue !rounded-lg focus:!ring-2 focus:!ring-oxfordBlue !placeholder:text-black/50`}
                  buttonClass="!bg-gentleGray !border-y !border-l !border-oxfordBlue !rounded-l-lg"
                  dropdownClass="!bg-oxfordBlue"
                  searchClass="!text-black !placeholder-gray-500 !rounded-md !my-2"
                  country={'es'}
                  value={phone}
                  onChange={handlePhoneChange}
                  enableSearch={true}
                />
                 {phone && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                    {validatingPhone ? (
                      <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : isPhoneValid ? (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    )}
                  </div>
                )}
            </div>
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            {t('auth.signup.password.label')}
          </label>
          <div className="relative w-full">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('auth.signup.password.placeholder')}
              className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
            {t('auth.signup.confirm_password.label')}
          </label>
          <div className="relative w-full">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder={t('auth.signup.confirm_password.placeholder')}
              className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || (phone && !isPhoneValid)}
          className="w-full bg-oxfordBlue rounded-lg text-white py-2 px-4 hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? t('auth.signup.submit.loading') : t('auth.signup.submit.default')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-black/50">
          {t('auth.signup.login_prompt')}{' '}
          <button 
            onClick={onSwitchToLogin}
            className="text-oxfordBlue hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            {t('auth.signup.login_link')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;