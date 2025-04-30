import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import InlineChatbotStep from "../chat/InlineChatbotStep";
import { addMonths } from "date-fns";
import { AuthModalContext } from "../../App";
import { useContext } from "react";
import { ServiceContext } from "../../contexts/ServiceContext";
import axios from "axios";

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

// Step 1: Frequency Selection
function FrequencyStep({ formData, onChange }) {
  const { t } = useTranslation();
  const options = [
    { label: t("coaching_request.frequency_options.weekly"), value: "Weekly" },
    { label: t("coaching_request.frequency_options.daily"), value: "Daily" },
    {
      label: t("coaching_request.frequency_options.priority"),
      value: "Priority",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-3 rounded-xl md:rounded-2xl cursor-pointer text-center border-2 shadow-lg text-base md:text-lg bg-oxfordBlue transition-all ${
            formData.frequency === opt.value
              ? "border-darkGold bg-darkGold/20 transform scale-[1.01]"
              : "border-darkGold hover:bg-darkGold/10 active:bg-darkGold/20"
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
  const { openAuthModal } = useContext(AuthModalContext);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2">
          {t("coaching_request.form.name_label")}
        </label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          placeholder={t("coaching_request.form.name_placeholder")}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors"
          required
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2">
          {t("coaching_request.form.email_label")}
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder={t("coaching_request.form.email_placeholder")}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors"
          required
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label className="block text-white mb-2 font-medium">
          {t("coaching_request.form.phone_label")}
        </label>
        <PhoneInput
          containerClass="!w-full !h-[48px] md:!h-[52px] lg:!h-[46px] bg-oxfordBlue rounded-xl overflow-hidden border border-white/30"
          buttonClass="!bg-white/5 !border-none h-full"
          inputClass="!bg-white/5 !w-full !border-none px-2 md:px-4 !h-full text-white placeholder-white/50 text-base md:text-lg"
          country="es"
          enableSearch
          searchPlaceholder={t(
            "coaching_request.form.phone_search_placeholder"
          )}
          value={formData.phone}
          onChange={(phone) =>
            onChange({ target: { name: "phone", value: phone } })
          }
          dropdownClass="!bg-oxfordBlue text-white rounded-xl shadow-lg"
          searchClass="!bg-oxfordBlue !text-white placeholder-white/50 rounded-md p-2 my-2"
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

// Step 3: Payment Step
// Step 3: Payment Step
function PaymentStep({selectedTier, requestId, onPaymentConfirmed, formData}) {
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isTestBooking, setIsTestBooking] = useState(false);
  const [pollingError, setPollingError] = useState(null);
  
  // Check for pending payments when component mounts
  useEffect(() => {
    // Check if there's a pending coaching payment in localStorage
    const pendingId = localStorage.getItem('pendingCoachingId');
    
    if (pendingId && pendingId === requestId.toString()) {
      console.log("Found pending coaching payment in localStorage:", pendingId);
      setPaymentStarted(true);
      
      // Clear it to prevent repeated attempts
      localStorage.removeItem('pendingCoachingId');
    }
  }, [requestId]);
  
  const handleStripeRedirect = async () => {
    try {
      console.log("Starting payment process for coaching request ID:", requestId);
      
      const { data } = await axios.post("/.netlify/functions/createCoachingSession", {
        requestId, 
        tier: selectedTier, 
        email: formData.email,
        isTestBooking
      });
      
      // Store the coaching request ID in localStorage before redirecting
      localStorage.setItem('pendingCoachingId', requestId.toString());
      
      console.log("Received Stripe checkout URL:", data.url);
      window.open(data.url, '_blank');
      setPaymentStarted(true);
    } catch (error) {
      console.error("Error creating Stripe session:", error);
      setPollingError("Failed to start payment process");
    }
  };

  useEffect(() => {
    if (!paymentStarted || !requestId) return;

    console.log("Starting payment status polling for ID:", requestId);
    
    const interval = setInterval(async () => {
      try {
        console.log("Checking payment status...");
        
        const response = await axios.get(
          `/.netlify/functions/getCoachingStatus?id=${requestId}`
        );
        
        console.log("Payment status response:", response.data);
        
        if (response.data.paymentStatus === "paid") {
          console.log("Payment confirmed!");
          setPaymentConfirmed(true);
          onPaymentConfirmed(true);
          clearInterval(interval);
        } else if (response.data.paymentStatus === "pending") {
          // If still pending after multiple attempts, try a direct force update
          // This is a fallback mechanism in case the webhook failed
          if (Math.random() < 0.2) { // 20% chance on each poll to try a force update
            try {
              console.log("Trying direct payment verification...");
              await axios.get(`/.netlify/functions/forceUpdateCoaching?id=${requestId}`);
              
              // Check again immediately
              const verifyResponse = await axios.get(
                `/.netlify/functions/getCoachingStatus?id=${requestId}`
              );
              
              if (verifyResponse.data.paymentStatus === "paid") {
                console.log("Payment verified with fallback mechanism!");
                setPaymentConfirmed(true);
                onPaymentConfirmed(true);
                clearInterval(interval);
              }
            } catch (verifyError) {
              console.error("Fallback verification failed:", verifyError);
            }
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setPollingError("Error checking payment status");
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentStarted, requestId, onPaymentConfirmed]);

  return (
    <div className="text-white text-center space-y-4 max-w-lg mx-auto">
      {/* Dev-only manual override button */}
      {process.env.NODE_ENV === 'development' && requestId && (
        <div className="mt-4">
          <button
            onClick={async () => {
              try {
                console.log("Force updating coaching request:", requestId);
                await axios.get(`/.netlify/functions/forceUpdateCoaching?id=${requestId}`);
                setPaymentConfirmed(true);
                onPaymentConfirmed(true);
              } catch (error) {
                console.error("Manual override failed:", error);
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded-md text-xs"
          >
            Force Payment Confirmation (Dev Only)
          </button>
        </div>
      )}
      
      <p className="text-lg sm:text-xl">
        Please click the button below to pay for your {selectedTier} coaching. Once payment is confirmed,
        the "Next" button will be unlocked.
      </p>
      
      <button
        onClick={handleStripeRedirect}
        className="px-4 py-2 bg-darkGold text-black rounded-xl shadow-md hover:bg-yellow-400 transition"
      >
        {isTestBooking ? 'Proceed with Test Checkout (0€)' : 'Open Payment Checkout'}
      </button>

      {paymentStarted && !paymentConfirmed && !pollingError && (
        <p className="text-white/80 text-sm pt-2">
          Waiting for payment confirmation...
        </p>
      )}

      {pollingError && (
        <p className="text-red-400 text-sm pt-2">
          {pollingError}. Please try refreshing the page after payment.
        </p>
      )}

      {paymentConfirmed && (
        <p className="text-green-500 font-semibold pt-2">
          Payment confirmed ✅ — you can now proceed.
        </p>
      )}
      
      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && requestId && (
        <div className="mt-4 p-2 bg-black/30 rounded text-xs text-left">
          <p>Debug Info:</p>
          <p>Request ID: {requestId}</p>
          <p>Payment Started: {paymentStarted ? 'Yes' : 'No'}</p>
          <p>Payment Confirmed: {paymentConfirmed ? 'Yes' : 'No'}</p>
          <p>LocalStorage ID: {localStorage.getItem('pendingCoachingId')}</p>
        </div>
      )}
    </div>
  );
}

// Main Coaching Request Component
export default function CoachingRequest({ onBackService }) {
  const { t } = useTranslation();
  const { tier } = useContext(ServiceContext);
  const { user } = useAuth();
  const [step, setStep] = useState(tier ? 2 : 1); // Skip to step 2 if tier is selected
  const [formData, setFormData] = useState({
    frequency: tier || "", // Use the selected tier if available
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
  });

  const [requestId, setRequestId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "frequency" && value) setStep(2);
  };

  // Update steps to include the payment step
  const STEPS = [
    { title: t("coaching_request.steps.frequency"), component: FrequencyStep },
    { title: t("coaching_request.steps.contact"), component: ContactStep },
    { title: t("coaching_request.steps.payment"), component: PaymentStep }, // New payment step
    { title: t("coaching_request.steps.chat"), component: InlineChatbotStep },
  ];

  const Current = STEPS[step - 1].component;
  const UI_STEPS = STEPS.length + 1;

  const handlePaymentConfirmed = (confirmed) => {
    setPaymentDone(confirmed);
  };

  useEffect(() => {
    if (tier) {
      setFormData((prev) => ({ ...prev, frequency: tier }));
      setStep(2); // Skip to contact info step
    }
  }, [tier]);

  const canProceed = () => {
    if (step === 2) return formData.name && formData.email && formData.phone;
    if (step === 3) return paymentDone; // Only proceed if payment is done
    return true;
  };

  const handleNext = async () => {
    if (step === 2) {
      setIsSubmitting(true);

      // Calculate membership dates
      const membershipStartDate = new Date();
      const membershipEndDate = addMonths(membershipStartDate, 1);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.frequency,
        membership_start_date: membershipStartDate.toISOString(),
        membership_end_date: membershipEndDate.toISOString(),
        payment_status: "pending", // Add this field
      };
      if (user?.id) payload.user_id = user.id;

      const { data, error } = await supabase
        .from("coaching_requests")
        .insert(payload)
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
      setStep(3); // Go to payment step
    } else if (step === 3) {
      setStep(4); // Go to chatbot after payment
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

          {step === 1 ? (
            <FrequencyStep formData={formData} onChange={handleChange} />
          ) : step === 2 ? (
            <ContactStep formData={formData} onChange={handleChange} />
          ) : step === 3 ? (
            <PaymentStep
              selectedTier={formData.frequency}
              requestId={requestId}
              formData={formData}
              onPaymentConfirmed={handlePaymentConfirmed}
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
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    {t("coaching_request.buttons.processing")}
                  </span>
                ) : (
                  t("coaching_request.buttons.next")
                )}
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
