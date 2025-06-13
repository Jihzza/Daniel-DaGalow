import React, { useState, useEffect, useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../utils/supabaseClient";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import InlineChatbotStep from "../chat/InlineChatbotStep";
import { useAuth } from "../../contexts/AuthContext"; // Ensure useAuth is imported
import { AuthModalContext } from "../../App"; // Ensure AuthModalContext is imported
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange";
import { validatePhoneNumber } from "../../utils/phoneValidation";

// Progress Indicator Component - Standardized
function StepIndicator({
  stepCount,
  currentStep,
  onStepClick = () => {},
  className = "",
}) {
  return (
    <div className={`flex items-center justify-center py-2 gap-1 md:gap-2 ${className}`}>
      {Array.from({ length: stepCount }).map((_, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;

        return (
          <React.Fragment key={stepNum}>
            <button
              type="button"
              onClick={() => onStepClick(stepNum)}
              disabled={stepNum > currentStep}
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 transition-colors text-sm md:text-base ${
                isActive
                  ? "bg-darkGold border-darkGold text-white transform scale-110"
                  : "bg-white/20 border-white/50 text-white/80 hover:border-darkGold hover:text-white"
              } ${
                stepNum > currentStep
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              aria-label={`Go to step ${stepNum}`}
            >
              {stepNum}
            </button>
            {idx < stepCount - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 md:mx-2 transition-colors ${
                  currentStep > stepNum ? "bg-darkGold" : "bg-white/20"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Step1: Contact Info / Signup - MODIFIED ContactInfoStep
function ContactInfoStep({ formData, onChange, onPhoneValidation, user }) { // Added user prop
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);

  const [validatingPhone, setValidatingPhone] = useState(false);
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const phoneValidationTimeout = useRef(null);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const EyeIcon = ({ color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
  
  const EyeOffIcon = ({ color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  const handlePhoneChange = (phone) => {
    onChange({ target: { name: "phone", value: phone } });
    setPhoneValidated(false);
    setPhoneError("");

    if (phoneValidationTimeout.current) {
      clearTimeout(phoneValidationTimeout.current);
    }

    if (phone.replace(/\D/g, "").length < 8) {
      if (onPhoneValidation) onPhoneValidation(false);
      return;
    }

    phoneValidationTimeout.current = setTimeout(async () => {
      setValidatingPhone(true);
      try {
        const result = await validatePhoneNumber(phone);
        setValidatingPhone(false);
        setPhoneValidated(result.isValid);
        if (onPhoneValidation) onPhoneValidation(result.isValid);

        if (!result.isValid) {
          setPhoneError(t("pitch_deck_request.form.phone_validation_error", "Invalid phone number."));
        }
      } catch (error) {
        setValidatingPhone(false);
        setPhoneError("Validation service unavailable");
        if (onPhoneValidation) onPhoneValidation(false);
      }
    }, 800);
  };

  useEffect(() => {
    if (formData.phone && formData.phone.replace(/\D/g, "").length >= 8) {
        handlePhoneChange(formData.phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.phone]);


  useEffect(() => {
    return () => {
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6 mb-4 max-w-md mx-auto w-full">
      <div className="space-y-4 text-left">
        <div>
          <label htmlFor="pitchdeck-name" className="block text-white text-sm font-medium mb-1.5">
            {t("pitch_deck_request.form.name_label", "Full Name")}
          </label>
          <input
            id="pitchdeck-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onChange}
            placeholder={t("pitch_deck_request.form.name_placeholder", "Enter your full name")}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="pitchdeck-email" className="block text-white text-sm font-medium mb-1.5">
            {t("pitch_deck_request.form.email_label", "Email Address")}
          </label>
          <input
            id="pitchdeck-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            placeholder={t("pitch_deck_request.form.email_placeholder", "Enter your email")}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
            required
            readOnly={!!user}
          />
          {!!user && <p className="text-xs text-white/60 mt-1">{t("edit_profile.form.email.cannot_change", "Email cannot be changed")}</p>}
        </div>

        <div>
          <label htmlFor="pitchdeck-phone" className="block text-white text-sm font-medium mb-1.5">
            {t("pitch_deck_request.form.phone_label", "Phone Number")}
          </label>
          <div className="relative">
            <PhoneInput
              inputProps={{ name: 'phone', required: true, id: 'pitchdeck-phone' }}
              containerClass="!w-full"
              inputClass={`!w-full !px-3 !py-2.5 !text-sm !bg-white/5 !border !border-white/10 !rounded-xl !text-white !placeholder-white/50 focus:!ring-2 focus:!ring-darkGold${phoneError ? ' !border-red-500' : ''}`}
              buttonClass="!bg-white/5 !border-y !border-l !border-white/10 !rounded-l-xl"
              dropdownClass="!bg-oxfordBlue"
              searchClass="!bg-white !text-black !placeholder-gray-500 !rounded-md !my-2"
              country={'es'}
              value={formData.phone}
              onChange={handlePhoneChange}
              enableSearch={true}
            />
            {formData.phone && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                {validatingPhone ? (
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : phoneValidated ? (
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                )}
              </div>
            )}
          </div>
          {phoneError && (
            <p className="text-red-500 text-xs mt-1">{phoneError}</p>
          )}
        </div>

        {!user && (
          <>
            <div>
              <label htmlFor="pitchdeck-password" className="block text-white text-sm font-medium mb-1.5">
                {t('auth.signup.password.label')}
              </label>
              <div className="relative">
                <input
                  id="pitchdeck-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={onChange}
                  placeholder={t('auth.signup.password.placeholder')}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
                  required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="pitchdeck-confirmPassword" className="block text-white text-sm font-medium mb-1.5">
                {t('auth.signup.confirm_password.label')}
              </label>
              <div className="relative">
                <input
                  id="pitchdeck-confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={onChange}
                  placeholder={t('auth.signup.confirm_password.placeholder')}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
                  required
                />
                 <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {!user && (
        <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 space-y-3 mt-6">
          <div className="pt-2">
            <p className="text-white/80 text-sm mb-2">
              {t("booking.login_prompt_simple", "Already have an account?")}
            </p>
            <button
              type="button"
              onClick={openAuthModal}
              className="inline-flex items-center justify-center bg-darkGold text-black font-semibold py-2 px-5 rounded-lg hover:bg-opacity-90 transition-colors text-sm"
            >
              {t("booking.login_button", "Log In Here")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PitchDeckRequest({ onBackService }) {
  const { t } = useTranslation();
  const { user, signUp: contextSignUp } = useAuth(); // Get signUp from context
  const [step, setStep] = useState(1);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "", // New field
    confirmPassword: "" // New field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);
  
  const formRef = useScrollToTopOnChange([step]);

  // --- START: MODIFICATIONS FOR STATE PERSISTENCE ---

  // Effect to RESTORE state on mount, conditional on the OAuth flag.
  useEffect(() => {
    const isOAuthRedirect = sessionStorage.getItem('oauth_redirect_in_progress');

    if (isOAuthRedirect === 'true') {
      sessionStorage.removeItem('oauth_redirect_in_progress');

      const savedStateJSON = sessionStorage.getItem('pitchDeckFormState');
      if (savedStateJSON) {
        try {
          const savedState = JSON.parse(savedStateJSON);
          setStep(savedState.step || 1);
          setFormData(savedState.formData || { name: "", email: "", phone: "", password: "", confirmPassword: "" });
          setRequestId(savedState.requestId || null);
        } catch (e) {
          console.error("Failed to restore pitch deck form state:", e);
        }
      }
    }
  }, []);

  // Effect to SAVE state whenever it changes.
  useEffect(() => {
    // Step 2 is the final "Chat" step.
    if (step >= 2) {
      return;
    }
    const stateToSave = {
      step,
      formData,
      requestId,
    };
    sessionStorage.setItem('pitchDeckFormState', JSON.stringify(stateToSave));
  }, [step, formData, requestId]);

  // Effect to CLEAN UP state from sessionStorage on completion.
  useEffect(() => {
    const savedStateJSON = sessionStorage.getItem('pitchDeckFormState');
    if (savedStateJSON) {
      try {
        const savedState = JSON.parse(savedStateJSON);
        setStep(savedState.step || 1);
        setFormData(savedState.formData || { name: "", email: "", phone: "", password: "", confirmPassword: "" });
        setRequestId(savedState.requestId || null);
      } catch (e) {
        console.error("Failed to restore pitch deck form state:", e);
      }
    }
  }, []); // Empty dependency array ensures this runs only on mount.

  // This effect clears the state on completion. It remains unchanged.
  useEffect(() => {
    if (step === 2) { // Step 2 is the Chat step
      sessionStorage.removeItem('serviceSelectionState');
      sessionStorage.removeItem('pitchDeckFormState');
    }
  }, [step]);

  // --- END: MODIFICATIONS FOR STATE PERSISTENCE ---

  const STEPS = [
    {
      title: t("pitch_deck_request.steps.contact"),
      component: ContactInfoStep,
    },
    { title: t("pitch_deck_request.steps.chat"), component: InlineChatbotStep },
  ];
  const UI_STEPS = STEPS.length + 1; // +1 for the initial implicit "service selected" step


  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
            const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("phone_number, full_name")
            .eq("id", user.id)
            .single();

            if (profileError && profileError.code !== 'PGRST116') { 
                console.warn("Error fetching profile for autofill (PitchDeck):", profileError.message);
            }

            setFormData(prevFormData => ({
                ...prevFormData,
                name: user.user_metadata?.full_name || profileData?.full_name || "",
                email: user.email || "",
                phone: profileData?.phone_number || "",
                password: '', 
                confirmPassword: '',
            }));
            
            if (profileData?.phone_number) {
                 const validationResult = await validatePhoneNumber(profileData.phone_number);
                 setIsPhoneValid(validationResult.isValid);
            } else {
                setIsPhoneValid(false);
            }

        } catch (error) {
            console.error("Error in fetchUserProfile (PitchDeck):", error);
            setFormData(prev => ({ ...prev, name: user.user_metadata?.full_name || "", email: user.email || "", password: '', confirmPassword: ''}));
            setIsPhoneValid(false);
        }
      };
      fetchUserProfile();
    } else {
      // User is not logged in, clear all fields for signup
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
      });
      setIsPhoneValid(false); 
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handlePhoneValidation = (isValid) => {
    setIsPhoneValid(isValid);
  };

  const canProceed = () => {
    if (step === 1) { // Contact/Signup step
      const isNameValid = formData.name && formData.name.trim().length >= 2;
      const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      let passwordChecks = true;
      if (!user) { // Only check passwords if user is not logged in (i.e., signing up)
        passwordChecks = formData.password && formData.password.length >= 6 && formData.password === formData.confirmPassword;
      }
      // For PitchDeck, phone might be optional, adjust if it's required
      // For now, assuming if phone is provided, it must be valid. If not provided, it's okay.
      const phoneCheck = formData.phone ? isPhoneValid : true; 
      return isNameValid && isEmailValid && phoneCheck && passwordChecks;
    }
    return true; // For chat step
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    setIsSubmitting(true);

    if (step === 1) { // Contact Info / Signup Step
      try {
        let currentUserId = user?.id;
        let currentEmail = user?.email || formData.email;

        if (!user) { // User is not logged in, sign them up
          if (formData.password !== formData.confirmPassword) {
            alert(t('auth.signup.errors.password_mismatch'));
            setIsSubmitting(false);
            return;
          }
          if (formData.password.length < 6) {
            alert(t('auth.signup.errors.password_length'));
            setIsSubmitting(false);
            return;
          }

          const { data: signUpData, error: signUpError } = await contextSignUp(
            formData.email,
            formData.password,
            {
              data: { full_name: formData.name } 
            }
          );

          if (signUpError) {
            alert(signUpError.message || t('auth.signup.errors.default'));
            setIsSubmitting(false);
            return;
          }
          
          currentUserId = signUpData.user.id;
          currentEmail = signUpData.user.email;

          if (signUpData.user && formData.phone) {
              const { error: profileUpdateError } = await supabase
                  .from('profiles')
                  .update({ phone_number: formData.phone })
                  .eq('id', signUpData.user.id);
              if (profileUpdateError) {
                  console.warn('Failed to update profile with phone number after signup:', profileUpdateError.message);
              }
          }
          alert("Account created! Please check your email for confirmation. Your request is being processed.");
        } else { // User is logged in, update profile if details changed
            let profileUpdates = {};
            const {data: currentProfileData} = await supabase.from('profiles').select('full_name, phone_number').eq('id', user.id).single();

            if (formData.name !== (currentProfileData?.full_name || user.user_metadata?.full_name)) {
                profileUpdates.full_name = formData.name;
            }
            if (formData.phone && formData.phone !== currentProfileData?.phone_number) {
                profileUpdates.phone_number = formData.phone;
            }

            if (Object.keys(profileUpdates).length > 0) {
                const { error: profileUpdateError } = await supabase
                    .from('profiles')
                    .update(profileUpdates)
                    .eq('id', user.id);
                if (profileUpdateError) console.warn('Failed to update profile for existing user (PitchDeck):', profileUpdateError.message);
            }
        }
        
        // Create pitch request
        const payload = {
            name: formData.name,
            email: currentEmail,
            phone: formData.phone,
            // project: formData.project, // Assuming project selection was a previous step or is static for now
        };
        if (currentUserId) payload.user_id = currentUserId;

        const { data: pitchRequestData, error: pitchError } = await supabase
          .from("pitch_requests")
          .insert(payload)
          .select("id")
          .single();

        if (pitchError) {
            console.error("Error submitting pitch request:", pitchError.message);
            alert("Failed to submit request: " + pitchError.message);
            throw pitchError;
        }

        setRequestId(pitchRequestData.id);
        setStep(2); // Proceed to Chat Step
      } catch (error) {
        // Error already handled by specific alerts or console logs
      } finally {
        setIsSubmitting(false);
      }
    } 
    // If there was another step like payment before chat, it would be:
    // else if (step === X && paymentDone) { setStep(Y); setIsSubmitting(false); }
    else {
        setIsSubmitting(false); // For any other case
    }
  };


  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBackService();
  };

  const handleStepClick = (clickedStepNum) => {
    const targetInternalStep = clickedStepNum - 1;
    if (targetInternalStep < step && !isSubmitting) {
      if (targetInternalStep === 0) { 
        onBackService();
      } else {
        setStep(targetInternalStep);
      }
    }
  };

  const loadingSpinner = (
    <span className="flex items-center">
      <svg
        className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {t("hero.buttons.processing", "Processing...")}
    </span>
  );

  return (
    <section className="py-4 sm:py-6 md:py-8 px-4 sm:px-4" id="pitch-deck-request" ref={formRef}>
      <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-black">
          {t("pitch_deck_request.title")}
        </h2>
        <div className="bg-oxfordBlue rounded-xl p-4 sm:p-6 md:p-8 shadow-xl"> {/* Adjusted padding */}
          <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-4 font-semibold">
            {STEPS[step - 1].title}
          </h3>
          
          <div className="flex flex-col">
            {step === 1 && 
              <ContactInfoStep 
                  formData={formData} 
                  onChange={handleChange} 
                  onPhoneValidation={handlePhoneValidation}
                  user={user} // Pass user prop
              />
            }
            {step === 2 && requestId && (
              <InlineChatbotStep 
                requestId={requestId} 
                tableName="pitchdeck_chat_messages"
                // workflowKey="pitch_deck_finalization" // Keep if you use it
              />
            )}
            {step === 2 && !requestId && (
               <div className="text-center text-red-400 p-4">
                Preparing chat... If this persists, please go back and try again.
              </div>
            )}

            <StepIndicator
              stepCount={UI_STEPS}
              currentStep={step + 1} // UI step is internal step + 1
              onStepClick={handleStepClick}
              className="pt-6" // Added padding top
            />

            <div className="flex justify-between mt-4 sm:mt-6"> {/* Adjusted margin-top */}
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2 sm:px-6 sm:py-2.5 border-2 border-darkGold text-darkGold rounded-xl hover:bg-darkGold/10 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {t("pitch_deck_request.buttons.back")}
              </button>
              {step < STEPS.length && (
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 bg-darkGold text-black font-semibold rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {isSubmitting ? loadingSpinner : (
                    // Display the title of the *next* step
                    STEPS[step] ? STEPS[step].title : t("pitch_deck_request.buttons.next")
                  )}
                </button>
              )}
              {step === STEPS.length && ( // This is the "Done" button on the Chat step
                <button
                  onClick={onBackService} // Or navigate to profile, etc.
                  className="px-4 py-2 sm:px-6 sm:py-2.5 bg-darkGold text-black font-semibold rounded-xl hover:bg-opacity-90 transition-colors text-sm sm:text-base"
                >
                  {t("pitch_deck_request.buttons.done")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}