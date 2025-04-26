import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import InlineChatbotStep from "./InlineChatbotStep";
import { useAuth } from "../contexts/AuthContext";
// Progress Indicator Component
function StepIndicator({
  stepCount,
  currentStep,
  onStepClick = () => {},
  className = "",
}) {
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
                  : "bg-white/20 border-white/50 text-white/50 hover:border-darkGold hover:text-white cursor-pointer"
              } ${stepNum > currentStep ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label={`Go to step ${stepNum}`}
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

// Step1: Project Selection
function ProjectSelectionStep({ formData, onChange }) {
  const projects = [
    { label: "Perspectiv", value: "perspectiv" },
    { label: "Galow.Club", value: "galow" },
    { label: "Pizzaria", value: "pizzaria" },
  ];
  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      {projects.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange({ target: { name: "project", value: p.value } })}
          className={`px-3 py-2 rounded-2xl cursor-pointer text-center border-2 border-darkGold shadow-lg text-sm bg-oxfordBlue ${
            formData.project === p.value ? "border-darkGold shadow-lg" : "border-darkGold"
          }`}
        >
          <span className="text-white font-medium">{p.label}</span>
        </button>
      ))}
    </div>
  );
}

// Step2: Contact Info
function ContactInfoStep({ formData, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2">Your Name</label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder="John Doe"
          required
          className="w-full text-sm px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2">Email Address</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="john@example.com"
          required
          className="w-full text-sm px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white font-medium mb-2">Phone Number</label>
        <PhoneInput
          containerClass="!w-full !h-[38px] bg-oxfordBlue rounded-xl overflow-hidden border border-white/30"
          buttonClass="!bg-white/5 !border-none h-full"
          inputClass="!bg-white/5 !border-none p-4 !h-full !w-full text-white placeholder-white/50"
          country="es"
          enableSearch
          searchPlaceholder="Search country..."
          value={formData.phone}
          inputProps={{ name: 'phone', required: true }}
          onChange={(phone) => onChange({ target: { name: "phone", value: phone } })}
          dropdownClass="!bg-oxfordBlue text-white rounded-2xl"
          searchClass="!bg-oxfordBlue !text-white placeholder-white/50 rounded-md p-2"
        />
      </div>
    </div>
  );
}



export default function PitchDeckRequest({ onBackService }) {
  const STEPS = [
    { title: "Select your project", component: ProjectSelectionStep },
    { title: "Your contact information", component: ContactInfoStep },
    { title: "Chat with our assistant", component: InlineChatbotStep },
  ];

  const UI_STEPS = STEPS.length + 1;
  const { user } = useAuth(); // Get the current user
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
  project: "",
  name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
  phone: ""
});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((fd) => ({ ...fd, [name]: type === "checkbox" ? checked : value }));
    if (step === 1 && name === "project" && value) setStep(2);
  };

  const canProceed = () => {
    if (step === 1) return !!formData.project;
    if (step === 2) return formData.name && formData.email && formData.phone;
    return true;
  };

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("phone_number")
          .eq("id", user.id)
          .single();
        
        if (!error && data) {
          setFormData(prev => ({
            ...prev,
            phone: data.phone_number || ""
          }));
        }
      };
      
      fetchUserProfile();
    }
  }, [user]);

  const handleNext = async () => {
    if (step === 2) {
      setIsSubmitting(true);
      try {
        const { data, error } = await supabase
          .from("pitch_requests")
          .insert({
            project: formData.project,
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          })
          .select("id")
          .single();
        
        if (error) throw error;
        
        setRequestId(data.id);
        setStep(3);
      } catch (error) {
        console.error("Error submitting pitch request:", error);
        alert("Failed to submit your request. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBackService();
  };

  const handleStepClick = (dot) => {
    if (dot === 1) onBackService();
    else setStep(dot - 1);
  };

  const Current = STEPS[step - 1].component;

  return (
    <section className="py-8 px-4" id="pitch-deck-request">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          Request a Pitch Deck
        </h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl text-white mb-4">{STEPS[step - 1].title}</h3>
          {step < 3 ? (
            <Current formData={formData} onChange={handleChange} />
          ) : (
            <InlineChatbotStep
              requestId={requestId}
              tableName="pitchdeck_chat_messages"
            />
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-3 py-1 border-2 border-darkGold text-darkGold rounded-xl"
            >
              Back
            </button>
            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="px-3 py-1 bg-darkGold text-black rounded-xl disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>

          <StepIndicator
            stepCount={UI_STEPS}
            currentStep={step + 1}
            onStepClick={handleStepClick}
            className="pt-6"
          />
        </div>
      </div>
    </section>
  );
}
