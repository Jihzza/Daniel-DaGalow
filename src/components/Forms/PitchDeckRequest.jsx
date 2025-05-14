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

// Step1: Contact Info
function ContactInfoStep({ formData, onChange, onPhoneValidation }) {
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);

  const [validatingPhone, setValidatingPhone] = useState(false);
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const phoneValidationTimeout = useRef(null);

  const handlePhoneChange = (phone) => {
    // Propagate change to parent form data
    onChange({ target: { name: "phone", value: phone } });

    // Reset local validation display
    setPhoneValidated(false);
    setPhoneError("");

    if (phoneValidationTimeout.current) {
      clearTimeout(phoneValidationTimeout.current);
    }

    // Basic check: if phone number is too short, mark as invalid immediately
    if (phone.replace(/\D/g, "").length < 8) {
      if (onPhoneValidation) onPhoneValidation(false); // Update parent's validity state
      return;
    }

    // Debounced validation
    phoneValidationTimeout.current = setTimeout(async () => {
      setValidatingPhone(true);
      try {
        const result = await validatePhoneNumber(phone);
        setValidatingPhone(false);
        setPhoneValidated(result.isValid);
        if (onPhoneValidation) onPhoneValidation(result.isValid); // Update parent's validity state

        if (!result.isValid) {
          setPhoneError(t("pitch_deck_request.form.phone_validation_error"));
        }
      } catch (error) {
        setValidatingPhone(false);
        setPhoneError("Validation service unavailable");
        if (onPhoneValidation) onPhoneValidation(false); // Update parent's validity state
        console.error("Phone validation error:", error);
      }
    }, 800);
  };

  // ***** MODIFIED useEffect *****
  // This effect now listens to formData.phone to react to autofill
  useEffect(() => {
    if (formData.phone && formData.phone.replace(/\D/g, "").length >= 8) {
      // Call handlePhoneChange to trigger visual validation if phone is pre-filled and long enough
      // This ensures the green check or red cross appears correctly after autofill.
      handlePhoneChange(formData.phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.phone]); // Dependency: re-run when formData.phone changes (e.g., from autofill)

  useEffect(() => {
    // Cleanup timeout on component unmount
    return () => {
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white text-sm sm:text-base md:text-lg">
          {t("pitch_deck_request.form.name_label")}
        </label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder={t("pitch_deck_request.form.name_placeholder")}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-xs sm:text-sm md:text-base"
          required
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <label className="block text-white text-sm sm:text-base md:text-lg">
          {t("pitch_deck_request.form.email_label")}
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder={t("pitch_deck_request.form.email_placeholder")}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-xs sm:text-sm md:text-base"
          required
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <label className="block text-white text-sm sm:text-base md:text-lg">
          {t("coaching_request.form.phone_label")}
        </label>
        <div className="relative">
          <PhoneInput
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
            value={formData.phone} // Value comes from parent's formData
            onChange={handlePhoneChange} // Use the modified handlePhoneChange
            dropdownClass="!bg-oxfordBlue text-white rounded-xl shadow-lg"
            searchClass="!bg-oxfordBlue !text-white placeholder-white/50 rounded-md p-2 my-2"
          />
          {/* Validation indicators */}
          {formData.phone && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
              {validatingPhone && (
                <svg
                  className="animate-spin h-5 w-5 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {!validatingPhone && phoneValidated && (
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
              {!validatingPhone && !phoneValidated && formData.phone && formData.phone.replace(/\D/g, "").length >= 8 && (
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
            </div>
          )}
        </div>
        {phoneError && (
          <p className="text-red-500 text-sm mt-1">{phoneError}</p>
        )}
      </div>

      <div className="text-white text-sm text-right sm:text-base md:text-lg">
        <button
          type="button"
          onClick={openAuthModal}
          className="text-xs text-white underline"
        >
          {t("services.common_login_signup")}
        </button>
      </div>
      {/* SUBTLE WARNING MESSAGE - Option 1 */}
<div className="md:col-span-2 text-center md:text-left">
  <p className="text-xs text-gray-400"> {/* Lighter gray text */}
    {t("pitch_deck_request.form.auto_account_warning", "An account will automatically be created with the info you provide.")}
  </p>
</div>
    </div>
  );
}

export default function PitchDeckRequest({ onBackService }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isPhoneValid, setIsPhoneValid] = useState(false); // Parent's phone validity state

  const STEPS = [
    {
      title: t("pitch_deck_request.steps.contact"),
      component: ContactInfoStep,
    },
    { title: t("pitch_deck_request.steps.chat"), component: InlineChatbotStep },
  ];

  const UI_STEPS = STEPS.length + 1; // +1 for the "back to service" conceptual step
  const formRef = useScrollToTopOnChange([step]);

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "", // Initialized as empty, to be autofilled
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);

  // useEffect for autofilling user profile data (including phone)
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
            const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("phone_number, full_name") // Ensure these column names are correct
            .eq("id", user.id)
            .single();

            if (profileError) {
                // Don't throw an error, just log it, as profile might not exist yet
                console.warn("Error fetching profile for autofill (PitchDeck):", profileError.message);
            }

            setFormData(prevFormData => ({
                ...prevFormData,
                name: user.user_metadata?.full_name || profileData?.full_name || prevFormData.name || "",
                email: user.email || prevFormData.email || "",
                phone: profileData?.phone_number || prevFormData.phone || "", // Autofill phone
            }));

            // If phone number is fetched, validate it and update parent's state
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
  }, [user]); // Dependency: user object

  // ***** MODIFIED handleChange *****
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevFormData) => {
      const newFormData = {
        ...prevFormData,
        [name]: type === "checkbox" ? checked : value,
      };

      // If the phone field is being changed, update parent's isPhoneValid state directly
      if (name === "phone") {
        validatePhoneNumber(value).then(result => {
          setIsPhoneValid(result.isValid);
        });
      }
      return newFormData;
    });
  };

  // Callback for ContactInfoStep to update parent's isPhoneValid state
  // This is still useful if ContactInfoStep's internal logic calls it.
  const handlePhoneValidation = (isValid) => {
    setIsPhoneValid(isValid);
  };

  const canProceed = () => {
    if (step === 1) {
      const isNameValid = formData.name && formData.name.trim().length >= 2;
      const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      // Use the parent's isPhoneValid state for the condition
      return isNameValid && isEmailValid && isPhoneValid;
    }
    // For other steps, assume proceedable unless specific conditions are added
    return true;
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (step === 1) { // From Contact Info to Chat
      setIsSubmitting(true);
      try {
        if (!user && formData.name && formData.email) {
          const accountResult = await autoCreateAccount(formData.name, formData.email);
          if (accountResult.success && !accountResult.userExists) {
            console.log("Account created successfully for PitchDeck request.");
          }
        }
        
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            // user_id will be set if user is logged in
        };
        if (user?.id) payload.user_id = user.id;

        const { data, error } = await supabase
          .from("pitch_requests") // Ensure this is your correct table name
          .insert(payload)
          .select("id")
          .single();

        if (error) {
            console.error("Error submitting pitch request:", error.message);
            // Potentially set an error message state to display to user
            alert("Failed to submit request: " + error.message);
            throw error; // Rethrow to be caught by outer catch if necessary
        }

        setRequestId(data.id);
        setStep(2); // Move to chat step
      } catch (error) {
        // Error already logged, setIsSubmitting will be handled in finally
      } finally {
        setIsSubmitting(false);
      }
    } else if (step < STEPS.length) { // For any other intermediate steps if added later
        setStep(step + 1);
    }
    // If step === STEPS.length, the "Done" button handles action
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBackService(); // If on first step, go back to service selection
  };

  const handleStepClick = (clickedStepNum) => {
    // clickedStepNum is 1-based from the UI
    // Allow navigation to previous, completed steps if not submitting.
    if (clickedStepNum < step +1 && !isSubmitting) { // step is 1-based, currentStep in indicator is step+1
      if (clickedStepNum === 1 && step === 1) { // Clicking first dot on first step
        onBackService();
      } else {
        setStep(clickedStepNum - 1); // STEPS is 0-indexed, step state is 1-based
      }
    } else if (clickedStepNum === 1 && step ===1 && !isSubmitting) {
        onBackService();
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
        <div className="bg-oxfordBlue rounded-xl p-8 sm:p-6 shadow-xl">
          <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-4 font-semibold">
            {STEPS[step - 1].title}
          </h3>
          
          <div className="flex flex-col">
            {step === 1 && 
              <ContactInfoStep 
                  formData={formData} 
                  onChange={handleChange} 
                  onPhoneValidation={handlePhoneValidation} // Pass validation handler to child
              />
            }
            {step === 2 && requestId && (
              <InlineChatbotStep 
                requestId={requestId} 
                tableName="pitchdeck_chat_messages" // Ensure this is your correct chat table
                workflowKey="pitch_deck_finalization" // Optional: if you use different n8n workflows
              />
            )}
            {step === 2 && !requestId && ( // Show message if chat step is reached without requestId
               <div className="text-center text-red-400 p-4">
                There was an issue preparing the chat. Please go back and try again.
              </div>
            )}

            <StepIndicator
              stepCount={UI_STEPS} // Total conceptual steps including "back"
              currentStep={step + 1} // UI step number is current step state + 1
              onStepClick={handleStepClick}
            />

            <div className="flex justify-between mt-2">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-3 py-1 border-2 border-darkGold text-darkGold rounded-xl disabled:opacity-50"
              >
                {t("pitch_deck_request.buttons.back")}
              </button>
              {step < STEPS.length && ( // "Next" button, if not on the last defined step
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className={`px-3 py-1 bg-darkGold text-black rounded-xl disabled:opacity-50`}
                >
                  {isSubmitting ? loadingSpinner : (
                    // Display title of the *next* step or a generic "Next"
                    STEPS[step] ? STEPS[step].title : t("pitch_deck_request.buttons.next")
                  )}
                </button>
              )}
              {step === STEPS.length && ( // "Done" button, if on the last defined step (e.g., Chat step)
                <button
                  onClick={onBackService} // Or a specific completion handler
                  className="px-3 py-1 bg-darkGold text-black rounded-xl disabled:opacity-50"
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