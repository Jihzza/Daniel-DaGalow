// src/components/AnalysisRequest.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../utils/supabaseClient";
import InlineChatbotStep from "../chat/InlineChatbotStep";
import { useAuth } from "../../contexts/AuthContext";
import { AuthModalContext } from "../../App";
import { useContext } from "react";
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange";
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

export default function AnalysisRequest({ onBackService }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const { user } = useAuth(); // Get the current user
  const [formData, setFormData] = useState({
    type: "",
    name: user?.user_metadata?.full_name || "",
    email: "",
  });
  const [requestId, setRequestId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useScrollToTopOnChange([step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "type" && value) setStep(2);
  };

  const STEPS = [
    { title: t("analysis_request.steps.type"), component: TypeSelectionStep },
    { title: t("analysis_request.steps.contact"), component: ContactInfoStep },
  ];

  const UI_STEPS = STEPS.length + 2;

  const handleStepClick = (dot) => {
    if (dot === 1) onBackService();
    else setStep(dot - 1);
  };

  const canProceed = () => {
    if (step === 2) return formData.name && formData.email;
    return true;
  };

  const handleNext = async () => {
    if (step === 2) {
      setIsSubmitting(true);

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
      if (error) {
        console.error(error);
        setIsSubmitting(false);
        return;
      }
      setRequestId(data.id);
      setIsSubmitting(false);
      setStep(3);
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
          {step <= 2 && (
            <>
              <h3 className="text-xl text-white mb-4">
                {STEPS[step - 1].title}
              </h3>
              {React.createElement(STEPS[step - 1].component, {
                formData,
                onChange: handleChange,
              })}
            </>
          )}

          {/* Inline Chat Step */}
          {step === 3 && requestId && (
            <>
              <h3 className="text-xl text-white mb-4">
                {t("analysis_request.steps.chat")}
              </h3>
              <InlineChatbotStep
                requestId={requestId}
                tableName="analysis_chat_messages"
              />
            </>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              className="px-4 py-2 md:px-5 md:py-3 border-2 border-darkGold text-darkGold rounded-xl hover:bg-darkGold/10 active:bg-darkGold/20 transition-colors font-medium text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-opacity-50"
            >
              {t("analysis_request.buttons.back")}
            </button>
            {step <= 2 && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="px-4 py-2 md:px-5 md:py-3 bg-darkGold text-black rounded-xl "
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
                    {t("analysis_request.buttons.next")}
                  </span>
                ) : (
                  t("analysis_request.buttons.next")
                )}
              </button>
            )}
            {step >= 3 && (
              <button
                onClick={onBackService}
                className="px-4 py-2 md:px-5 md:py-3 bg-darkGold text-black rounded-xl"
              >
                {t("analysis_request.buttons.done")}
              </button>
            )}
          </div>

          {/* Progress Dots */}
          <StepIndicator
            stepCount={UI_STEPS}
            currentStep={step + 1}
            onStepClick={handleStepClick}
            className="mt-6"
          />
        </div>
      </div>
    </section>
  );
}
