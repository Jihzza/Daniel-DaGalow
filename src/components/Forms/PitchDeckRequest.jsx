import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

// Progress Indicator Component
function StepIndicator({ stepCount, currentStep, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>      
      {Array.from({ length: stepCount }).map((_, idx) => (
        <React.Fragment key={idx}>
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors duration-300 mx-1 text-sm font-medium ${
              currentStep === idx + 1
                ? 'bg-darkGold border-darkGold text-white'
                : 'bg-white/20 border-white/50 text-white/50'
            }`}
          >
            {idx + 1}
          </div>
          {idx < stepCount - 1 && (
            <div
              className={`flex-1 h-px mx-2 ${
                currentStep > idx + 1 ? 'bg-darkGold' : 'bg-white/20'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Step1: Project Selection
function ProjectSelectionStep({ formData, onChange }) {
  const projects = [
    { label: "Project Alpha", value: "alpha" },
    { label: "Project Beta", value: "beta" },
    { label: "Project Gamma", value: "gamma" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {projects.map(p => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange({ target: { name: 'project', value: p.value } })}
          className={`p-6 rounded-2xl text-center border-2 shadow-lg transition-colors ${
            formData.project === p.value
              ? 'border-darkGold bg-darkGold/10'
              : 'border-white/20 bg-oxfordBlue hover:border-darkGold'
          }`}
        >
          <span className="text-white font-semibold text-lg block">{p.label}</span>
        </button>
      ))}
    </div>
  );
}

// Step2: Contact Info
function ContactInfoStep({ formData, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label className="block text-white mb-2">Full Name</label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          required
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        />
      </div>
      <div>
        <label className="block text-white mb-2">Email Address</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          required
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        />
      </div>
      <div>
        <label className="block text-white mb-2">Company / Organization</label>
        <input
          name="company"
          type="text"
          value={formData.company}
          onChange={onChange}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        />
      </div>
      <div>
        <label className="block text-white mb-2">Phone Number</label>
        <input
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={onChange}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        />
      </div>
    </div>
  );
}

// Step3: Investor Profile
function InvestorProfileStep({ formData, onChange }) {
  return (
    <div className="space-y-6 mb-6">
      <div>
        <label className="block text-white mb-2">Investor Type</label>
        <select
          name="investorType"
          value={formData.investorType}
          onChange={onChange}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        >
          <option value="">Select…</option>
          <option value="angel">Angel Investor</option>
          <option value="vc">Venture Capital Firm</option>
          <option value="corporate">Corporate Investor</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-white mb-2">Target Check Size</label>
        <select
          name="checkSize"
          value={formData.checkSize}
          onChange={onChange}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        >
          <option value="">Select…</option>
          <option value="<50k">£10k–£50k</option>
          <option value="50-250">£50k–£250k</option>
          <option value="250-1m">£250k–£1m</option>
          <option value=">1m">£1m+</option>
        </select>
      </div>
      <div>
        <label className="block text-white mb-2">Investment Timeline</label>
        <select
          name="timeline"
          value={formData.timeline}
          onChange={onChange}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        >
          <option value="">Select…</option>
          <option value="immediate">Immediate (0–3 months)</option>
          <option value="short">Short‑term (3–6 months)</option>
          <option value="long">Long‑term (6+ months)</option>
        </select>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          name="nda"
          id="nda"
          checked={formData.nda}
          onChange={onChange}
          className="h-4 w-4 text-darkGold bg-white/5 border-white/10 rounded focus:ring-darkGold"
        />
        <label htmlFor="nda" className="ml-2 text-white">
          I agree to sign an NDA before receiving the deck
        </label>
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
        {isSubmitting ? 'Sending…' : 'Request Pitch Deck'}
      </button>
    </form>
  );
}

export default function PitchDeckRequest({ onBackService }) {
  const STEPS = [ProjectSelectionStep, ContactInfoStep, InvestorProfileStep, NotesStep];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    project: '', name: '', email: '', company: '', phone: '',
    investorType: '', checkSize: '', timeline: '', nda: false, notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(fd => ({ ...fd, [name]: type === 'checkbox' ? checked : value }));
    if (step === 1 && name === 'project' && value) setStep(2);
  };

  const canProceed = () => {
    if (step === 1) return !!formData.project;
    if (step === 2) return formData.name && formData.email;
    return true;
  };

  const handleNext = () => {
    if (canProceed() && step < STEPS.length) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    // submit data
    await supabase.from('pitch_requests').insert(formData);
    setIsSubmitting(false);
    // TODO: show thank you or scroll
  };

  const Current = STEPS[step - 1];

  return (
    <section id="pitch-deck-request" className="py-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-black">Request a Pitch Deck</h2>
      <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
      {onBackService && (
            <button
              onClick={onBackService}
              className="mb-4 text-sm font-medium text-darkGold"
            >
              ← Change Service
            </button>
          )}
        <Current
          formData={formData}
          onChange={handleChange}
          onSubmit={step === STEPS.length ? handleSubmit : undefined}
          isSubmitting={isSubmitting}
        />

        {step > 1 ? (
          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-6 py-3 border-2 border-darkGold text-darkGold font-bold rounded-xl hover:bg-darkGold hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              Back
            </button>
            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-3 bg-darkGold text-black font-bold rounded-xl hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        ) : (
          step < STEPS.length && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-3 bg-darkGold text-black font-bold rounded-xl hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )
        )}

        <div className="mt-8">
          <StepIndicator stepCount={STEPS.length} currentStep={step} />
        </div>
      </div>
    </section>
  );
}
