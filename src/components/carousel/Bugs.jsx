import React, { useState, useEffect, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { AuthModalContext } from "../../App";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { validatePhoneNumber } from '../../utils/phoneValidation';

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


function BugReport() {
  const { t } = useTranslation();
  const { user, signUp } = useAuth();
  const { openAuthModal } = useContext(AuthModalContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, error: false, message: "" });
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [validatingPhone, setValidatingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const phoneValidationTimeout = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        phone: "" // Phone not needed for logged-in bug report
      }));
    } else {
        setFormData({ name: '', email: '', description: '', password: '', confirmPassword: '', phone: '' });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (newPhone) => {
    setFormData(prev => ({ ...prev, phone: newPhone }));
    setIsPhoneValid(false);
    setPhoneError("");

    if (phoneValidationTimeout.current) clearTimeout(phoneValidationTimeout.current);

    if (newPhone.replace(/\D/g, "").length < 8) return;

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
      }
    }, 800);
  };

  useEffect(() => {
    return () => { if (phoneValidationTimeout.current) clearTimeout(phoneValidationTimeout.current) };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ success: false, error: false, message: "" });
    setLoading(true);

    try {
        if (user) {
            if (!formData.description) throw new Error(t("bug_report.validation.required_fields"));
            
            const { error: bugError } = await supabase.from("bug_reports").insert({
                user_id: user.id, name: formData.name, email: formData.email, description: formData.description, status: "new",
            });
            if (bugError) throw bugError;

            setFormData(prev => ({ ...prev, description: "" }));
            setSubmitStatus({ success: true, error: false, message: t("bug_report.messages.success") });

        } else {
            if (!formData.name || !formData.email || !formData.password || !formData.phone) throw new Error("Name, email, phone, and password are required.");
            if (!isPhoneValid) throw new Error("Please enter a valid phone number.");
            if (formData.password !== formData.confirmPassword) throw new Error(t('auth.signup.errors.password_mismatch'));
            if (formData.password.length < 6) throw new Error(t('auth.signup.errors.password_length'));

            const { data, error: signUpError } = await signUp(formData.email, formData.password, { data: { full_name: formData.name } });
            if (signUpError) throw signUpError;
            
            if (data.user) {
                const { error: updateError } = await supabase.from('profiles').update({ phone_number: formData.phone }).eq('id', data.user.id);
                if (updateError) console.error("Error updating profile with phone number:", updateError.message);
            }
            
            setSubmitStatus({ success: true, error: false, message: "Account created! You can now describe the bug."});
        }
    } catch (error) {
        console.error("Bug Report/Signup Error:", error);
        setSubmitStatus({ success: false, error: true, message: error.message || t("bug_report.messages.error") });
    } finally {
        setLoading(false);
    }
  };
  
  const loadingSpinner = (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {t("hero.buttons.processing", "Processing...")}
    </span>
  );


  return (
    <section id="bug-report" className="w-full">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex flex-col pb-6">
          <h2 className="text-2xl md:text-4xl py-4 font-bold text-center text-black">
            {t("bug_report.title")}
          </h2>
          <p className="text-center text-black max-w-2xl mx-auto md:text-lg">
            {user ? t("bug_report.description") : "Please create an account or log in to report a bug."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-oxfordBlue rounded-xl p-6 space-y-4">
          
          {user ? (
            <>
              {/* === LOGGED-IN VIEW === */}
              <div>
                <label htmlFor="name" className="block mb-1 text-sm text-white">{t("bug_report.form.name_label")}</label>
                <input type="text" id="name" name="name" value={formData.name} readOnly className="w-full bg-white/10 border border-darkGold rounded-xl px-4 py-2 text-white/80 cursor-not-allowed"/>
              </div>
              <div>
                <label htmlFor="email" className="block mb-1 text-sm text-white">{t("bug_report.form.email_label")}</label>
                <input type="email" id="email" name="email" value={formData.email} readOnly className="w-full bg-white/10 border border-darkGold rounded-xl px-4 py-2 text-white/80 cursor-not-allowed"/>
              </div>
              <div>
                <label htmlFor="description" className="block mb-1 text-sm text-white">{t("bug_report.form.description_label")}</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" required placeholder={t('bug_report.form.description_placeholder')} className="w-full bg-white/5 border border-darkGold rounded-xl px-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"></textarea>
              </div>
            </>
          ) : (
            <>
              {/* === GUEST VIEW (SIGNUP) === */}
              <h3 className="text-xl md:text-2xl font-medium text-left text-white mb-4">
                Create an Account
              </h3>
              <div>
                  <label htmlFor="name-guest" className="block mb-1 text-sm text-white">{t("auth.signup.full_name.label")}</label>
                  <input type="text" id="name-guest" name="name" value={formData.name} onChange={handleChange} required placeholder={t('auth.signup.full_name.placeholder')} className="w-full bg-white/5 border border-darkGold rounded-xl px-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"/>
              </div>
              <div>
                  <label htmlFor="email-guest" className="block mb-1 text-sm text-white">{t("auth.signup.email.label")}</label>
                  <input type="email" id="email-guest" name="email" value={formData.email} onChange={handleChange} required placeholder={t('auth.signup.email.placeholder')} className="w-full bg-white/5 border border-darkGold rounded-xl px-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"/>
              </div>
              <div>
                <label htmlFor="phone-bug-report" className="block text-sm font-medium text-white mb-1.5">{t("coaching_request.form.phone_label")}</label>
                <div className="relative">
                  <PhoneInput
                    inputProps={{ name: 'phone', required: true, id: 'phone-bug-report' }}
                    containerClass="!w-full"
                    inputClass="!w-full !px-3 !py-2.5 !text-sm !bg-white/5 !border !border-darkGold !rounded-xl !text-white !placeholder-white/50 focus:!ring-2 focus:!ring-darkGold"
                    buttonClass="!bg-white/5 !border-y !border-l !border-darkGold !rounded-l-xl"
                    dropdownClass="!bg-oxfordBlue"
                    searchClass="!bg-white !text-black !placeholder-gray-500 !rounded-md !my-2"
                    country={'es'}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    enableSearch={true}
                  />
                   {formData.phone && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                      {validatingPhone ? ( <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : isPhoneValid ? ( <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      ) : ( <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      )}
                    </div>
                  )}
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
              </div>
              <div>
                  <label htmlFor="password-guest" className="block text-sm font-medium text-white mb-1.5">{t('auth.signup.password.label')}</label>
                  <div className="relative">
                      <input id="password-guest" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required placeholder={t('auth.signup.password.placeholder')} className="w-full px-3 py-2.5 bg-white/5 border border-darkGold rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"/>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70" aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                  </div>
              </div>
              <div>
                  <label htmlFor="confirmPassword-guest" className="block text-sm font-medium text-white mb-1.5">{t('auth.signup.confirm_password.label')}</label>
                  <div className="relative">
                      <input id="confirmPassword-guest" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} required placeholder={t('auth.signup.confirm_password.placeholder')} className="w-full px-3 py-2.5 bg-white/5 border border-darkGold rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"/>
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                  </div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <p className="text-white/80 text-sm">{t("booking.login_prompt_simple", "Already have an account?")}</p>
                  <button type="button" onClick={openAuthModal} className="inline-flex items-center justify-center bg-darkGold text-black font-semibold py-1.5 px-4 rounded-lg hover:bg-opacity-90 transition-colors text-sm">
                      {t("booking.login_button", "Log In Here")}
                  </button>
              </div>
            </>
          )}

          <div>
              <button type="submit" disabled={loading} className="w-full bg-darkGold text-black font-bold py-3 rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50">
                  {loading ? loadingSpinner : (user ? t("bug_report.form.submit_button") : t("auth.signup.submit.default", "Sign Up"))}
              </button>
          </div>

          {(submitStatus.success || submitStatus.error) && (
            <div className={`p-3 rounded-xl text-center text-sm ${
                submitStatus.success ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"}`}>
              {submitStatus.message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default BugReport;