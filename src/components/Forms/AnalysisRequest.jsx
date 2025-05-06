// src/components/AnalysisRequest.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { AuthModalContext } from "../../App";
import { useContext } from "react";
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange";
import { autoCreateAccount } from "../../utils/autoSignup";
// Import the InlineChatbotStep component
import InlineChatbotStep from "../chat/InlineChatbotStep";

// Progress Indicator
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

// Step 1: Select Analysis Type
function TypeSelectionStep({ formData, onChange }) {
  const { t } = useTranslation();
  const options = [
    { label: "Stock", value: "stock" },
    { label: "Social Media", value: "socialmedia" },
    { label: "Business", value: "business" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-6">
      {options.map((opt) => (
        <div
          key={opt.value}
          onClick={() =>
            onChange({ target: { name: "type", value: opt.value } })
          }
          className={`px-4 py-3 md:py-4 rounded-xl md:rounded-2xl cursor-pointer text-center border-2 shadow-lg transition-all text-base md:text-lg bg-oxfordBlue ${
            formData.type === opt.value
              ? "border-darkGold bg-darkGold/20 transform scale-[1.02]"
              : "border-darkGold hover:bg-darkGold/10 active:bg-darkGold/20"
          }`}
        >
          <p className="text-white font-medium">{opt.label}</p>
        </div>
      ))}
    </div>
  );
}

// Step 2: Contact Info
function ContactInfoStep({ formData, onChange }) {
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
      <div className="space-y-2">
        <label className="block text-white text-sm md:text-base font-medium">
          {t("analysis_request.form.name_label")}
        </label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder={t("analysis_request.form.name_placeholder")}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-white text-sm md:text-base font-medium">
          {t("analysis_request.form.email_label")}
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder={t("analysis_request.form.email_placeholder")}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors"
          required
        />
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

// Step 3: Chatbot (New Step)
function ChatbotStep({ requestId }) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      
      {/* Using the InlineChatbotStep with only tableName and requestId */}
      <InlineChatbotStep 
        requestId={requestId} 
        tableName="analysis_chat_messages" 
      />
    </div>
  );
}

export default function AnalysisRequest({ onBackService }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const { user } = useAuth(); // Get the current user
  const [formData, setFormData] = useState({
    type: "",
    name: user?.user_metadata?.full_name || "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [requestId, setRequestId] = useState(null); // Store the created request ID
  const formRef = useScrollToTopOnChange([step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "type" && value) setStep(2);
  };

  const STEPS = [
    { title: t("analysis_request.steps.type"), component: TypeSelectionStep },
    { title: t("analysis_request.steps.contact"), component: ContactInfoStep },
    { title: t("analysis_request.steps.chatbot", "Ask Questions"), component: ChatbotStep },
  ];

  // Now using the actual STEPS length
  const UI_STEPS = STEPS.length + 1;

  const handleStepClick = (dot) => {
    if (dot === 1) onBackService();
    else setStep(dot - 1);
  };

  const canProceed = () => {
    if (step === 1) return formData.type;
    if (step === 2) return formData.name && formData.email;
    return true;
  };

  const handleNext = async () => {
    if (step === 2) {
      setIsSubmitting(true);

      try {
        // Auto-create account if user is not logged in
        if (!user && formData.name && formData.email) {
          const accountResult = await autoCreateAccount(
            formData.name,
            formData.email
          );

          // Optional: If you're using a notification library like react-toastify
          if (accountResult.success && !accountResult.userExists) {
            // If using react-toastify:
            // toast.success("Account created! Check your email for login details.");
            console.log("Account created successfully");
          }
        }

        // Continue with your existing form submission code
        const payload = {
          name: formData.name,
          email: formData.email,
          service_type: formData.type,
        };

        if (user?.id) payload.user_id = user.id;

        const { data, error } = await supabase
          .from("analysis_requests")
          .insert(payload)
          .select("id")
          .maybeSingle();

        if (error) throw error;

        // Save the created request ID and proceed to chatbot step
        setRequestId(data.id);
        setStep(3); // Move to chatbot step
        setIsSubmitting(false);
      } catch (error) {
        console.error("Error submitting request:", error);
        setIsSubmitting(false);
      }
    } else if (step === 3) {
      // When finished with chatbot, mark as complete
      setIsComplete(true);
    } else {
      // For other steps, just move to the next step
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBackService();
  };

  return (
    <section className="py-8 px-4" ref={formRef}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          {t("analysis_request.title")}
        </h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
          {/* Step Content */}
          {!isComplete && step <= STEPS.length && (
            <>
              <h3 className="text-xl text-white mb-4">
                {STEPS[step - 1].title}
              </h3>
              {React.createElement(STEPS[step - 1].component, {
                formData,
                onChange: handleChange,
                requestId, // Pass requestId to the ChatbotStep
              })}
            </>
          )}

          {/* Success Message (shown after chatbot step is completed) */}
          {isComplete && (
            <div className="text-center py-8">
              <h3 className="text-xl text-white mb-4">
                {t("analysis_request.success_title", "Request Submitted")}
              </h3>
              <p className="text-white mb-6">
                {t(
                  "analysis_request.success_message",
                  "Thank you for your request. Our team will review it and get back to you soon."
                )}
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              className="px-4 py-2 md:px-5 md:py-3 border-2 border-darkGold text-darkGold rounded-xl hover:bg-darkGold/10 active:bg-darkGold/20 transition-colors font-medium text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-opacity-50"
            >
              {t("analysis_request.buttons.back")}
            </button>
            {!isComplete && step <= STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className={`px-4 py-2 md:px-5 md:py-3 bg-darkGold text-black rounded-xl ${
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
                ) : (
                  step === STEPS.length
                    ? t("analysis_request.buttons.finish", "Finish")
                    : t("analysis_request.buttons.next", "Next")
                )}
              </button>
            )}
            {isComplete && (
              <button
                onClick={onBackService}
                className="px-4 py-2 md:px-5 md:py-3 bg-darkGold text-black rounded-xl"
              >
                {t("analysis_request.buttons.done", "Done")}
              </button>
            )}
          </div>

          {/* Progress Dots */}
          <StepIndicator
            stepCount={UI_STEPS}
            currentStep={isComplete ? UI_STEPS : step + 1}
            onStepClick={handleStepClick}
            className="mt-6"
          />
        </div>
      </div>
    </section>
  );
}