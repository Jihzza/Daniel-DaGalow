import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import InlineChatbotStep from "../chat/InlineChatbotStep";
import { addMonths } from "date-fns";

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
              } ${
                stepNum > currentStep ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label={`Go to step ${stepNum}`}
            >
              {stepNum}
            </button>
            {idx < stepCount - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 transition-colors duration-300 ${
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
  const { t } = useTranslation();
  const options = [
    { label: t("coaching_request.frequency_options.weekly"), value: "weekly" },
    { label: t("coaching_request.frequency_options.daily"), value: "daily" },
    { label: t("coaching_request.frequency_options.priority"), value: "priority" },
  ];
  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-2 rounded-2xl cursor-pointer text-center border-2 border-darkGold shadow-lg text-sm bg-oxfordBlue ${
            formData.frequency === opt.value
              ? "border-darkGold shadow-lg"
              : "border-darkGold"
          }`}
          onClick={() =>
            onChange({ target: { name: "frequency", value: opt.value } })
          }
        >
          <p className="text-white font-medium">{opt.label}</p>
        </button>
      ))}
    </div>
  );
}

// Step 2: Contact Info
function ContactStep({ formData, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2">{t("coaching_request.form.name_label")}</label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder={t("coaching_request.form.name_placeholder")}
          required
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold text-sm"
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2">{t("coaching_request.form.email_label")}</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder={t("coaching_request.form.email_placeholder")}
          required
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold text-sm"
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2">{t("coaching_request.form.phone_label")}</label>
        <PhoneInput
          containerClass="!w-full !h-[42px] bg-oxfordBlue rounded-xl overflow-hidden border border-white/30"
          buttonClass="!bg-white/5 !border-none h-full"
          inputClass="!bg-white/5 !border-none p-4 !h-full text-white placeholder-white/50"
          country="es"
          enableSearch
          searchPlaceholder={t("coaching_request.form.phone_search_placeholder")}
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

// Step 3: Payment
function PaymentStep({ formData, onPaid }) {
  const { t } = useTranslation();
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
    <div className="text-center mb-6">
      <p className="text-white mb-4 text-sm">
        {t("coaching_request.payment.selected_tier")} <strong>{tier.label}</strong>.<br />
        {t("coaching_request.payment.complete_payment")} <strong>{tier.price}</strong> {t("coaching_request.payment.to_continue")}
      </p>
      <a
        href={tier.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onPaid}
      >
        <button className="px-3 py-1 bg-darkGold text-black font-bold rounded-xl hover:bg-darkGold/90">
          {t("coaching_request.payment.pay_with_stripe")}
        </button>
      </a>
    </div>
  );
}

// Main Coaching Request Component
export default function CoachingRequest({ onBackService }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    frequency: "",
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
  });
  const [requestId, setRequestId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

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
    { title: t("coaching_request.steps.frequency"), component: FrequencyStep },
    { title: t("coaching_request.steps.contact"), component: ContactStep },
    { title: t("coaching_request.steps.payment"), component: PaymentStep },
    { title: t("coaching_request.steps.chat"), component: InlineChatbotStep },
  ];

  const Current = STEPS[step - 1].component;
  const UI_STEPS = STEPS.length + 1;

  const canProceed = () => {
    if (step === 2) return formData.name && formData.email && formData.phone;
    if (step === 3) return paymentDone;
    return true;
  };

  const handleNext = async () => {
    if (step === 2) {
      setIsSubmitting(true);
      
      // Calculate membership dates
      const membershipStartDate = new Date(); // Today's date
      const membershipEndDate = addMonths(membershipStartDate, 1); // 1 month duration
  
      const { data, error } = await supabase
        .from("coaching_requests")
        .insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service_type: formData.frequency,
          membership_start_date: membershipStartDate.toISOString(),
          membership_end_date: membershipEndDate.toISOString(),
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
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else onBackService();
  };

  const handleStepClick = (dot) => {
    if (dot === 1) onBackService();
    else setStep(dot - 1);
  };

  return (
    <section className="py-8 px-4" id="coaching-journey">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          {t("coaching_request.title")}
        </h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl text-white mb-4">{STEPS[step - 1].title}</h3>
          {step < 4 ? (
            <Current
              formData={formData}
              onChange={handleChange}
              onPaid={() => setPaymentDone(true)}
            />
          ) : (
            <InlineChatbotStep
              requestId={requestId}
              tableName="coaching_chat_messages"
            />
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-3 py-1 border-2 border-darkGold text-darkGold rounded-xl"
            >
              {t("coaching_request.buttons.back")}
            </button>
            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="px-3 py-1 bg-darkGold text-black rounded-xl disabled:opacity-50"
              >
                {t("coaching_request.buttons.next")}
              </button>
            )}
            {step === STEPS.length && (
              <button
                onClick={onBackService}
                className="px-3 py-1 bg-darkGold text-black rounded-xl hover:bg-darkGold/90"
              >
                {t("coaching_request.buttons.done")}
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
