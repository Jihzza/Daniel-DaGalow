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

// Progress Indicator Component
function StepIndicator({
  stepCount,
  currentStep,
  onStepClick = () => {},
  className = "",
}) {
  return (
    <div className="flex items-center justify-center gap-1 md:gap-2 mt-6 md:mt-8">
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

// Step1: Project Selection
function ProjectSelectionStep({ formData, onChange }) {
  const { t } = useTranslation();
  const projects = [
    { label: "Perspectiv", value: "perspectiv" },
    { label: "Galow.Club", value: "galow" },
    { label: "Pizzaria", value: "pizzaria" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      {projects.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() =>
            onChange({ target: { name: "project", value: p.value } })
          }
          className={`px-3 py-3 rounded-xl md:rounded-2xl cursor-pointer text-center border-2 shadow-lg text-base md:text-lg bg-oxfordBlue transition-all ${
            formData.project === p.value
              ? "border-darkGold bg-darkGold/20 transform scale-[1.01]"
              : "border-darkGold hover:bg-darkGold/10 active:bg-darkGold/20"
          }`}
        >
          <span className="text-white font-medium">{p.label}</span>
        </button>
      ))}
    </div>
  );
}

// Step2: Contact Info
function ContactInfoStep({ formData, onChange, onPhoneValidation }) { // Added onPhoneValidation
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);

  // Phone validation state
  const [validatingPhone, setValidatingPhone] = useState(false);
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Debounce phone validation
  const phoneValidationTimeout = useRef(null);

  const handlePhoneChange = (phone) => {
    // Update parent form state
    onChange({ target: { name: "phone", value: phone } });

    // Reset validation states
    setPhoneValidated(false);
    setPhoneError("");

    // Clear any existing timeout
    if (phoneValidationTimeout.current) {
      clearTimeout(phoneValidationTimeout.current);
    }

    // Only validate if sufficient digits are entered
    if (phone.replace(/\D/g, "").length < 8) {
        if (onPhoneValidation) onPhoneValidation(false);
      return;
    }

    // Debounce the validation call
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
    }, 800); // Validate after 800ms of inactivity
  };

  // Effect to pre-validate phone if it's already filled
  useEffect(() => {
    if (formData.phone && formData.phone.replace(/\D/g, "").length >= 8) {
        handlePhoneChange(formData.phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once if formData.phone is present

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2">
          {t("pitch_deck_request.form.name_label")}
        </label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder={t("pitch_deck_request.form.name_placeholder")}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors"
          required
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2">
          {t("pitch_deck_request.form.email_label")}
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder={t("pitch_deck_request.form.email_placeholder")}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors"
          required
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2 font-medium">
          {t("coaching_request.form.phone_label")} {/* Assuming same label as coaching */}
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
              "coaching_request.form.phone_search_placeholder" // Assuming same placeholder
            )}
            value={formData.phone}
            onChange={handlePhoneChange} // Use the enhanced handler
            dropdownClass="!bg-oxfordBlue text-white rounded-xl shadow-lg"
            searchClass="!bg-oxfordBlue !text-white placeholder-white/50 rounded-md p-2 my-2"
          />

          {/* Validation indicator */}
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

        {/* Phone validation error message */}
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
    </div>
  );
}

export default function PitchDeckRequest({ onBackService }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isPhoneValid, setIsPhoneValid] = useState(false); // Track phone validity

  const STEPS = [
    {
      title: t("pitch_deck_request.steps.project"),
      component: ProjectSelectionStep,
    },
    {
      title: t("pitch_deck_request.steps.contact"),
      component: ContactInfoStep,
    },
    { title: t("pitch_deck_request.steps.chat"), component: InlineChatbotStep },
  ];

  const UI_STEPS = STEPS.length + 1;
  const formRef = useScrollToTopOnChange([step]);

  const [formData, setFormData] = useState({
    project: "",
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "", // Initialize phone as empty
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);

  // Effect to fetch phone number and update form data
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
    if (step === 1 && name === "project" && value) setStep(2);
  };

  const handlePhoneValidation = (isValid) => {
    setIsPhoneValid(isValid);
  };

  const canProceed = () => {
    if (step === 1) return !!formData.project;
    if (step === 2) {
      const isNameValid = formData.name && formData.name.trim().length >= 2;
      const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      return isNameValid && isEmailValid && isPhoneValid; // Use state for phone validity
    }
    return true; // For step 3 (chat)
  };


  const handleNext = async () => {
    if (!canProceed()) return;

    if (step === 2) { // Submitting contact info
      setIsSubmitting(true);
      try {
        if (!user && formData.name && formData.email) {
          const accountResult = await autoCreateAccount(formData.name, formData.email);
          if (accountResult.success && !accountResult.userExists) {
            console.log("Account created successfully");
          }
        }
        
        const payload = {
            project: formData.project,
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
        setStep(3); // Move to chat step
      } catch (error) {
        console.error("Error submitting pitch request:", error.message);
        // alert("Failed to submit your request. Please try again."); // User-friendly error
      } finally {
        setIsSubmitting(false);
      }
    } else if (step < STEPS.length) { // For step 1 to 2
        setStep(step + 1);
    }
    // No action for step 3 (chat step) next button, as it's handled by "Done"
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBackService();
  };

  const handleStepClick = (dot) => {
    if (dot === 1) onBackService();
    else if (dot -1 < step) setStep(dot - 1); // Allow navigation to previous, completed steps
  };

  const CurrentStepComponent = STEPS[step - 1].component;

  return (
    <section className="py-8 px-4" id="pitch-deck-request" ref={formRef}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          {t("pitch_deck_request.title")}
        </h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl text-white mb-4">{STEPS[step - 1].title}</h3>
          
          {step === 1 && <ProjectSelectionStep formData={formData} onChange={handleChange} />}
          {step === 2 && 
            <ContactInfoStep 
                formData={formData} 
                onChange={handleChange} 
                onPhoneValidation={handlePhoneValidation}
            />
          }
          {step === 3 && requestId && <InlineChatbotStep requestId={requestId} tableName="pitchdeck_chat_messages" />}
          {step === 3 && !requestId && (
             <div className="text-center text-red-400 p-4">
              There was an issue preparing the chat. Please go back and try again.
            </div>
          )}


          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-3 py-1 border-2 border-darkGold text-darkGold rounded-xl"
            >
              {t("pitch_deck_request.buttons.back")}
            </button>
            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className={`px-3 py-1 bg-darkGold text-black rounded-xl ${
                  !canProceed()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-yellow-500 transition-colors"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    {t("hero.buttons.processing", "Processing...")}
                  </span>
                ) : ( // Show the title of the *next* step
                  STEPS[step] ? STEPS[step].title : t("pitch_deck_request.buttons.next")
                )}
              </button>
            )}
            {step === STEPS.length && ( // "Done" button on the last step
              <button
                onClick={onBackService}
                className="px-3 py-1 bg-darkGold text-black rounded-xl hover:bg-darkGold/90"
              >
                {t("pitch_deck_request.buttons.done")}
              </button>
            )}
          </div>

          <StepIndicator
            stepCount={UI_STEPS}
            currentStep={step + 1} // For display purposes
            onStepClick={handleStepClick}
            className="pt-6"
          />
        </div>
      </div>
    </section>
  );
}
