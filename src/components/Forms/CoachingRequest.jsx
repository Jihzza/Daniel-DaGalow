import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { supabase } from "../../utils/supabaseClient";

// Progress Indicator Component
function StepIndicator({ stepCount, currentStep, onStepClick = () => {}, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>      {
      Array.from({ length: stepCount }).map((_, idx) => {
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
              }${stepNum > currentStep ? " opacity-50 cursor-not-allowed" : ""}`}
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

// Step 1: Frequency Selection
function FrequencyStep({ formData, onChange }) {
  const options = [
    { label: "Once per Week", value: "weekly" },
    { label: "Every Day", value: "daily" },
    { label: "Priority Coaching", value: "priority" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`p-6 rounded-2xl cursor-pointer text-center transition-shadow duration-300 border-2 focus:outline-none ${
            formData.frequency === opt.value
              ? "border-darkGold bg-darkGold/10 shadow-md"
              : "border-white/20 bg-oxfordBlue hover:border-darkGold"
          }`}
          onClick={() => onChange({ target: { name: "frequency", value: opt.value } })}
        >
          <span className="block text-white font-semibold text-lg">
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// Step 2: Contact Info
function ContactStep({ formData, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div>
        <label className="block text-white font-medium mb-2">Your Name</label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder="John Doe"
          required
          className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        />
      </div>
      <div>
        <label className="block text-white font-medium mb-2">Email Address</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="john@example.com"
          required
          className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-white font-medium mb-2">Phone Number</label>
        <PhoneInput
          country="us"
          enableSearch
          searchPlaceholder="Search country..."
          value={formData.phone}
          onChange={(phone) => onChange({ target: { name: "phone", value: phone } })}
          inputClass="w-full p-4 !bg-white/5 border !border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold"
          buttonClass="!bg-white/5 border !border-white/20 rounded-l-2xl h-full"
          dropdownClass="!bg-oxfordBlue text-white rounded-2xl"
          containerClass="rounded-2xl bg-oxfordBlue"
          searchClass="!bg-oxfordBlue !text-white placeholder-white/50 rounded-md p-2"
        />
      </div>
    </div>
  );
}

// Step 3: Payment
function PaymentStep({ formData, onPaid }) {
  const tiers = {
    weekly: {
      label: "Basic Tier",
      price: "40 € / month",
      link: "https://buy.stripe.com/3csdRBdlU9hL6dy4gh",
    },
    daily: {
      label: "Mid Tier",
      price: "90 € / month",
      link: "https://buy.stripe.com/5kAaFpepY8dH59u146",
    },
    priority: {
      label: "VIP Tier",
      price: "230 € / month",
      link: "https://buy.stripe.com/6oEcNx2Hg1PjfO88wz",
    },
  };
  const tier = tiers[formData.frequency] || {};
  return (
    <div className="text-center mb-8">
      <p className="text-white mb-4">
        You selected <strong>{tier.label}</strong>.<br />
        Please complete the payment of <strong>{tier.price}</strong> to continue.
      </p>
      <a
        href={tier.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onPaid}
      >
        <button className="px-6 py-3 bg-darkGold text-black font-bold rounded-xl hover:bg-yellow-500">
          Pay with Stripe
        </button>
      </a>
    </div>
  );
}

// Step 4: Chat Interface
function ChatbotStep({ requestId }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setHistory] = useState([]);
  const sendMessage = async () => {
    if (!message.trim()) return;
    await supabase
      .from("coaching_chat_messages")
      .insert({ request_id: requestId, sender: "user", message });
    setHistory((h) => [...h, { sender: "user", message }]);
    setMessage("");
  };
  return (
    <div className="bg-white/10 rounded-2xl p-6 mb-8 space-y-4 max-h-96 overflow-y-auto">
      {chatHistory.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`px-4 py-2 rounded-2xl max-w-xs break-words $
              {msg.sender === "user" ? "bg-darkGold text-white" : "bg-white text-black"}
            `}
          >
            {msg.message}
          </div>
        </div>
      ))}
      <div className="relative mt-4">
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold resize-none"
        />
        <button
          onClick={sendMessage}
          className="absolute right-4 bottom-4 p-3 bg-darkGold text-white rounded-full hover:bg-yellow-500 transition-colors duration-200"
        >
          <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Main Coaching Request Component
export default function CoachingRequest({ onBackService }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ frequency: "", name: "", email: "", phone: "" });
  const [requestId, setRequestId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Prevent accessing chat without payment
  useEffect(() => {
    if (step === 4 && !paymentDone) {
      setStep(3);
    }
  }, [step, paymentDone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "frequency" && value) setStep(2);
  };

  const STEPS = [
    { title: "Frequency", component: FrequencyStep },
    { title: "Your Info", component: ContactStep },
    { title: "Payment", component: PaymentStep },
    { title: "Chat", component: ChatbotStep },
  ];

  const Current = STEPS[step - 1].component;

  const canProceed = () => {
    if (step === 2) return formData.name && formData.email && formData.phone;
    if (step === 3) return paymentDone;
    return true;
  };

  const handleNext = async () => {
    if (step === 2) {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from("coaching_requests")
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service_type: formData.frequency,
        })
        .select("id")
        .single();
      if (error) {
        console.error(error);
        alert("Failed to create coaching request.");
        setIsSubmitting(false);
        return;
      }
      setRequestId(data.id);
      setIsSubmitting(false);
      setStep(3);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <section id="coaching-journey" className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8 text-black">
          Start Your Coaching Journey
        </h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-3xl p-10 shadow-2xl">
          <Current
            formData={formData}
            onChange={handleChange}
            requestId={requestId}
            onPaid={() => setPaymentDone(true)}
          />

          {step === 1 && onBackService && (
            <button
              onClick={onBackService}
              className="px-4 py-1 border-2 border-darkGold text-darkGold font-bold rounded-xl mb-4"
            >
              Change Service
            </button>
          )}

          {step > 1 && (
            <div className="flex justify-between mt-8">
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

          <StepIndicator
            stepCount={STEPS.length + 1}
            currentStep={step + 1}
            onStepClick={(dot) => {
              if (dot === 1) {
                onBackService();            // go back to “choose service”
              } else {
                setStep(dot - 1);           // step 2→internal 1, 3→2, etc.
              }
            }}            className={step === 1 ? "pt-0" : "pt-6"}
          />
        </div>
      </div>
    </section>
  );
}
