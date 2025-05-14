import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../utils/supabaseClient";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import InlineChatbotStep from "../chat/InlineChatbotStep";
import { useAuth } from "../../contexts/AuthContext";
import { AuthModalContext } from "../../App";
import { useContext } from "react";
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange";
import { autoCreateAccount } from "../../utils/autoSignup";
import { validatePhoneNumber } from "../../utils/phoneValidation";

// Progress Indicator Component - Standardized
function StepIndicator({
  stepCount,
  currentStep,
  onStepClick = () => {},
  className = "", // Keep className prop for potential specific overrides
}) {
  return (
    <div className={`flex items-center justify-center py-2 gap-1 md:gap-2 ${className}`}> {/* Standardized: py-2, gap-1 md:gap-2 */}
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

// Step1: Contact Info
function ContactInfoStep({ formData, onChange, onPhoneValidation }) {
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);

  const [validatingPhone, setValidatingPhone] = useState(false);
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const phoneValidationTimeout = useRef(null);

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
          setPhoneError(t("pitch_deck_request.form.phone_validation_error"));
        }
      } catch (error) {
        setValidatingPhone(false);
        setPhoneError("Validation service unavailable");
        if (onPhoneValidation) onPhoneValidation(false);
        console.error("Phone validation error:", error);
      }
    }, 800);
  };

  useEffect(() => {
    if (formData.phone && formData.phone.replace(/\D/g, "").length >= 8) {
        handlePhoneChange(formData.phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
    };
  }, []);

  return (
    // Standardized spacing for inputs: gap-3 and mb-2 (similar to CoachingRequest FrequencyStep and ContactStep grid)
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2"> {/* Changed gap-6 mb-6 to gap-3 mb-2 */}
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white text-sm sm:text-base md:text-lg"> {/* Standardized label style */}
          {t("pitch_deck_request.form.name_label")}
        </label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder={t("pitch_deck_request.form.name_placeholder")}
          // Standardized input style from Booking.jsx InfoStep
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-xs sm:text-sm md:text-base"
          required
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <label className="block text-white text-sm sm:text-base md:text-lg"> {/* Standardized label style */}
          {t("pitch_deck_request.form.email_label")}
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder={t("pitch_deck_request.form.email_placeholder")}
          // Standardized input style from Booking.jsx InfoStep
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-xs sm:text-sm md:text-base"
          required
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <label className="block text-white text-sm sm:text-base md:text-lg"> {/* Standardized label style */}
          {t("coaching_request.form.phone_label")}
        </label>
        <div className="relative">
          <PhoneInput
            // Standardized PhoneInput classes from CoachingRequest ContactStep
            containerClass="!w-full !h-[48px] md:!h-[52px] lg:!h-[46px] bg-oxfordBlue rounded-xl overflow-hidden border border-white/30"
            buttonClass="!bg-white/5 !border-none h-full"
            inputClass={`!bg-white/5 !w-full !border-none px-2 md:px-4 !h-full text-white placeholder-white/50 text-base md:text-lg ${
              phoneError ? "!border !border-red-500" : ""
            }`}
            country="es"
            enableSearch
            searchPlaceholder={t(
              "coaching_request.form.phone_search_placeholder"
            )}
            value={formData.phone}
            onChange={handlePhoneChange}
            dropdownClass="!bg-oxfordBlue text-white rounded-xl shadow-lg"
            searchClass="!bg-oxfordBlue !text-white placeholder-white/50 rounded-md p-2 my-2"
          />
          {formData.phone && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
              {validatingPhone && (
                <svg
                  className="animate-spin h-5 w-5 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {!validatingPhone && phoneValidated && (
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              )}
              {!validatingPhone &&
                !phoneValidated &&
                formData.phone &&
                formData.phone.replace(/\D/g, "").length >= 8 && (
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                )}
            </div>
          )}
        </div>
        {phoneError && (
          <p className="text-red-500 text-sm mt-1">{phoneError}</p>
        )}
      </div>

      <div className="text-white text-sm text-right sm:text-base md:text-lg"> {/* Standardized login/signup button style */}
        <button
          type="button"
          onClick={openAuthModal}
          className="text-xs text-white underline"
        >
          {t("services.common_login_signup")}
        </button>
      </div>
    </div>
  );
}

export default function PitchDeckRequest({ onBackService }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const STEPS = [
    {
      title: t("pitch_deck_request.steps.contact"),
      component: ContactInfoStep,
    },
    { title: t("pitch_deck_request.steps.chat"), component: InlineChatbotStep },
  ];

  const UI_STEPS = STEPS.length + 1;
  const formRef = useScrollToTopOnChange([step]);

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
            const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("phone_number, full_name")
            .eq("id", user.id)
            .single();

            if (profileError) {
                console.warn("Error fetching profile for autofill (PitchDeck):", profileError.message);
            }

            setFormData(prevFormData => ({
                ...prevFormData,
                name: user.user_metadata?.full_name || profileData?.full_name || prevFormData.name || "",
                email: user.email || prevFormData.email || "",
                phone: profileData?.phone_number || prevFormData.phone || "",
            }));

            if (profileData?.phone_number) {
                const validationResult = await validatePhoneNumber(profileData.phone_number);
                setIsPhoneValid(validationResult.isValid);
            }
        } catch (error) {
            console.error("Error in fetchUserProfile (PitchDeck):", error);
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((fd) => ({
      ...fd,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneValidation = (isValid) => {
    setIsPhoneValid(isValid);
  };

  const canProceed = () => {
    if (step === 1) {
      const isNameValid = formData.name && formData.name.trim().length >= 2;
      const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      return isNameValid && isEmailValid && isPhoneValid;
    }
    return true;
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (step === 1) {
      setIsSubmitting(true);
      try {
        if (!user && formData.name && formData.email) {
          const accountResult = await autoCreateAccount(formData.name, formData.email);
          if (accountResult.success && !accountResult.userExists) {
            console.log("Account created successfully");
          }
        }
        
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
        };
        if (user?.id) payload.user_id = user.id;

        const { data, error } = await supabase
          .from("pitch_requests")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;

        setRequestId(data.id);
        setStep(2);
      } catch (error) {
        console.error("Error submitting pitch request:", error.message);
      } finally {
        setIsSubmitting(false);
      }
    } else if (step < STEPS.length) {
        setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBackService();
  };

  const handleStepClick = (dot) => {
    if (dot === 1) { // Clicking the "Back to Service" or first step dot
        onBackService(); // Always go back to service selection as per Booking/Coaching
    } else if (dot -1 < step) { // Allow navigation to previous, completed steps
        setStep(dot - 1); // dot-1 because STEPS is 0-indexed, and dot is UI step
    }
  };

  const loadingSpinner = ( // Standardized spinner
    <span className="flex items-center">
      <svg
        className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {t("hero.buttons.processing", "Processing...")} {/* Changed from booking.processing for context */}
    </span>
  );

  return (
    // Standardized section padding from Booking.jsx
    <section className="py-4 sm:py-6 md:py-8 px-4 sm:px-4" id="pitch-deck-request" ref={formRef}>
      {/* Standardized max-width from Booking.jsx */}
      <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
        {/* Standardized title style from Booking.jsx */}
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-black">
          {t("pitch_deck_request.title")}
        </h2>
        {/* Standardized container style from Booking.jsx / CoachingRequest.jsx */}
        <div className="bg-oxfordBlue rounded-xl p-8 sm:p-6 shadow-xl"> {/* Matched Booking.jsx */}
          {/* Standardized step title style from Booking.jsx */}
          <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-4 font-semibold">
            {STEPS[step - 1].title}
          </h3>
          
          <div className="flex flex-col"> {/* Common wrapper like in Booking.jsx */}
            {/* Step Content */}
            {step === 1 && 
              <ContactInfoStep 
                  formData={formData} 
                  onChange={handleChange} 
                  onPhoneValidation={handlePhoneValidation}
              />
            }
            {step === 2 && requestId && <InlineChatbotStep requestId={requestId} tableName="pitchdeck_chat_messages" workflowKey="pitch_deck_finalization" />} {/* Added workflowKey for consistency if needed */}
            {step === 2 && !requestId && (
               <div className="text-center text-red-400 p-4">
                There was an issue preparing the chat. Please go back and try again.
              </div>
            )}

            {/* Step Indicator - Standardized, ensure className is applied correctly if needed or use default */}
            <StepIndicator
              stepCount={UI_STEPS}
              currentStep={step + 1} 
              onStepClick={handleStepClick}
             // className="pt-6" // Retained specific spacing from original PitchDeck if desired, or remove for full py-2 default
            />

            {/* Navigation Buttons - Standardized structure and spacing from Booking.jsx */}
            <div className="flex justify-between mt-2"> {/* mt-2 from Booking.jsx */}
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                // Standardized button style from Booking.jsx
                className="px-3 py-1 border-2 border-darkGold text-darkGold rounded-xl disabled:opacity-50"
              >
                {t("pitch_deck_request.buttons.back")}
              </button>
              {step < STEPS.length && (
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  // Standardized button style from Booking.jsx
                  className={`px-3 py-1 bg-darkGold text-black rounded-xl disabled:opacity-50`}
                >
                  {isSubmitting ? loadingSpinner : (
                    // Show the title of the *next* step, similar to CoachingRequest
                    STEPS[step] ? STEPS[step].title : t("pitch_deck_request.buttons.next")
                  )}
                </button>
              )}
              {step === STEPS.length && (
                <button
                  onClick={onBackService}
                  // Standardized button style from Booking.jsx
                  className="px-3 py-1 bg-darkGold text-black rounded-xl disabled:opacity-50" // Added disabled:opacity-50
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