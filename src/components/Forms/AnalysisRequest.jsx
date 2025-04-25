// src/components/AnalysisRequest.jsx
import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import InlineChatbotStep from "./InlineChatbotStep";

// Progress Indicator
function StepIndicator({ stepCount, currentStep, onStepClick = () => {}, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>        
    
      {Array.from({ length: stepCount }).map((_, idx) => {
        
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        return (
          <React.Fragment key={stepNum}>
            <button
              type="button"
              onClick={() => onStepClick(stepNum)}
              disabled={stepNum > currentStep}
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                isActive
                  ? "bg-darkGold border-darkGold text-white"
                  : "bg-white/20 border-white/50 text-white/50"
              } ${!isActive && "hover:border-darkGold hover:text-white cursor-pointer"} ${stepNum > currentStep && "opacity-50 cursor-not-allowed"}`}
            >
              {stepNum}
            </button>
            {idx < stepCount - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
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
  const options = [
    { label: "Stock", value: "stock" },
    { label: "Portfolio", value: "portfolio" },
    { label: "Social Media", value: "socialmedia" },
    { label: "Business", value: "business" },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      {options.map((opt) => (
        <div
          key={opt.value}
          onClick={() => onChange({ target: { name: "type", value: opt.value } })}
          className={`px-3 py-2 rounded-2xl cursor-pointer text-center border-2 border-darkGold shadow-lg text-sm bg-oxfordBlue ${
            formData.type === opt.value ? "border-darkGold shadow-lg" : "border-darkGold"
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label className="block text-white mb-2">Your Name</label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder="John Doe"
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"
          required
        />
      </div>
      <div>
        <label className="block text-white mb-2">Email Address</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="john@example.com"
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"
          required
        />
      </div>
    </div>
  );
}

export default function AnalysisRequest({ onBackService }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ type: "", name: "", email: "" });
  const [requestId, setRequestId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "type" && value) setStep(2);
  };

  const STEPS = [
    { title: "Select analysis type", component: TypeSelectionStep },
    { title: "Your contact information", component: ContactInfoStep },
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
      const { data, error } = await supabase
        .from("analysis_requests")
        .insert({ name: formData.name, email: formData.email, service_type: formData.type })
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
    <section className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">Get My Analysis</h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
          {/* Step Content */}
          {step <= 2 && (
            <>
              <h3 className="text-xl text-white mb-4">{STEPS[step - 1].title}</h3>
              {React.createElement(STEPS[step - 1].component, {
                formData,
                onChange: handleChange,
              })}
            </>
          )}

          {/* Inline Chat Step */}
          {step === 3 && requestId && (
            <>
              <h3 className="text-xl text-white mb-4">Chat with our analyst</h3>
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
              className="px-3 py-1 border-2 border-darkGold text-darkGold rounded-xl"
            >
              Back
            </button>
            {step <= 2 && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="px-3 py-1 bg-darkGold text-black rounded-xl disabled:opacity-50"
              >
                Next
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
