import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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
              disabled={
                stepNum > currentStep /* optional: disable future steps */
              }
              className={`
                w-8 h-8 flex items-center justify-center rounded-full border-2
                transition-colors duration-300
                ${
                  isActive
                    ? "bg-darkGold border-darkGold text-white"
                    : "bg-white/20 border-white/50 text-white/50"
                }
                focus:outline-none
                ${
                  !isActive &&
                  "hover:border-darkGold hover:text-white cursor-pointer"
                }
                ${stepNum > currentStep && "opacity-50 cursor-not-allowed"}
              `}
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
          onClick={() =>
            onChange({ target: { name: "project", value: p.value } })
          }
          className={`px-4 py-2 rounded-2xl cursor-pointer text-center border-2 border-darkGold shadow-lg ${
            formData.project === p.value
              ? "border-darkGold shadow-lg"
              : "border-darkGold"
          }`}
        >
          <span className="text-white font-medium text-center">
            {p.label}
          </span>
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
          className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50"
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
          className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50"
        />
      </div>
      <div>
        <label className="block text-white mb-2">Company / Organization</label>
        <input
          name="company"
          type="text"
          value={formData.company}
          placeholder="Company Name"
          onChange={onChange}
          className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50"
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white font-medium mb-2">
          Phone Number
        </label>
        <PhoneInput
          // 1) Outer container has the only border + rounding
          containerClass="!w-full !h-[42px] bg-oxfordBlue rounded-xl overflow-hidden border border-white/30"
          // 2) Children: no borders of their own
          buttonClass="!bg-white/5 !border-none h-full"
          inputClass="!bg-white/5 !border-none p-4 !h-full !w-full text-white placeholder-white/50"
          country="es"
          enableSearch
          searchPlaceholder="Search country..."
          value={formData.phone}
          onChange={(phone) =>
            onChange({ target: { name: "phone", value: phone } })
          }
          dropdownClass="!bg-oxfordBlue text-white rounded-2xl"
          searchClass="!bg-oxfordBlue !text-white placeholder-white/50 rounded-md p-2"
        />
      </div>
    </div>
  );
}

// Step4: Notes & Submit
function NotesStep({ formData, onChange, onSubmit, isSubmitting }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-white mb-2">Additional Notes</label>
        <textarea
          name="notes"
          rows={4}
          value={formData.notes}
          onChange={onChange}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-darkGold text-black font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
      >
        {isSubmitting ? "Sending…" : "Request Pitch Deck"}
      </button>
    </form>
  );
}

export default function PitchDeckRequest({ onBackService }) {
  const STEPS = [
    { title: "Select your project", component: ProjectSelectionStep },
    { title: "Your contact information", component: ContactInfoStep },
    { title: "Additional notes", component: NotesStep },
  ];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    project: "",
    name: "",
    email: "",
    company: "",
    phone: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((fd) => ({
      ...fd,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (step === 1 && name === "project" && value) setStep(2);
  };

  const canProceed = () => {
    if (step === 1) return !!formData.project;
    if (step === 2) return formData.name && formData.email;
    return true;
  };

  const handleNext = () => {
    if (canProceed() && step < STEPS.length) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // submit data
    await supabase.from("pitch_requests").insert(formData);
    setIsSubmitting(false);
    // TODO: show thank you or scroll
  };

  const Current = STEPS[step - 1].component;

  return (
    <section id="pitch-deck-request" className="py-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-black">
        Request a Pitch Deck
      </h2>
      <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl text-white mb-6">{STEPS[step - 1].title}</h3>
        <Current
          formData={formData}
          onChange={handleChange}
          onSubmit={step === STEPS.length ? handleSubmit : undefined}
          isSubmitting={isSubmitting}
        />

        {step > 1 && (
          <div className="flex justify-between mt-4">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-1 border-2 border-darkGold text-darkGold font-bold rounded-xl"
            >
              Back
            </button>
            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="px-4 py-1 bg-darkGold text-white font-bold rounded-xl disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        )}

        <div className="mt-8">
          <StepIndicator
            stepCount={STEPS.length + 1}
            currentStep={step + 1}
            onStepClick={(dot) => {
              if (dot === 1) {
                onBackService(); // go back to “choose service”
              } else {
                setStep(dot - 1); // step 2→internal 1, 3→2, etc.
              }
            }}
            className={step === 1 ? "pt-0" : "pt-6"}
          />{" "}
        </div>
      </div>
    </section>
  );
}
