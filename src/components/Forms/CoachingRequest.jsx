import React, { useState, useEffect, useRef } from "react";
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
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange";
import { autoCreateAccount } from "../../utils/autoSignup";
import { validatePhoneNumber } from "../../utils/phoneValidation";
import stripe from "../../assets/icons/stripe.svg";
import ssl from "../../assets/icons/ssl-lock.svg";

// Progress Indicator Component
function StepIndicator({
  stepCount,
  currentStep,
  onStepClick = () => {},
  className = "",
}) {
  return (
    <div className="flex items-center justify-center py-2 gap-1 md:gap-2">
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
    <div className="grid grid-cols-1 gap-3 mb-2">
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
function ContactStep({ formData, onChange, onPhoneValidation }) { // Added onPhoneValidation back as it's used
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);

  const [validatingPhone, setValidatingPhone] = useState(false);
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const phoneValidationTimeout = useRef(null);

  const handlePhoneChange = (phone) => {
    onChange({ target: { name: "phone", value: phone } });
    setPhoneValidated(false);
    setPhoneError("");

    if (phoneValidationTimeout.current) {
      clearTimeout(phoneValidationTimeout.current);
    }

    if (phone.replace(/\D/g, "").length < 8) {
      if (onPhoneValidation) onPhoneValidation(false);
      return;
    }

    phoneValidationTimeout.current = setTimeout(async () => {
      setValidatingPhone(true);
      try {
        const result = await validatePhoneNumber(phone);
        setValidatingPhone(false);
        setPhoneValidated(result.isValid);
        if (onPhoneValidation) onPhoneValidation(result.isValid);

        if (!result.isValid) {
          setPhoneError(t("coaching_request.form.phone_validation_error"));
        }
      } catch (error) {
        setValidatingPhone(false);
        setPhoneError("Validation service unavailable");
        if (onPhoneValidation) onPhoneValidation(false);
        console.error("Phone validation error:", error);
      }
    }, 800);
  };

  useEffect(() => {
    if (formData.phone && formData.phone.replace(/\D/g, "").length >= 8) {
        handlePhoneChange(formData.phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.phone]);


  useEffect(() => {
    return () => {
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6 mb-4 max-w-md mx-auto w-full">
      {/* Section 1: User Details Input */}
      <div className="space-y-4 text-left">
        <div>
          <label htmlFor="coaching-name" className="block text-white text-sm font-medium mb-1.5">
            {t("coaching_request.form.name_label", "Full Name")}
          </label>
          <input
            id="coaching-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onChange}
            placeholder={t("coaching_request.form.name_placeholder", "Enter your full name")}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="coaching-email" className="block text-white text-sm font-medium mb-1.5">
            {t("coaching_request.form.email_label", "Email Address")}
          </label>
          <input
            id="coaching-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            placeholder={t("coaching_request.form.email_placeholder", "Enter your email")}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="coaching-phone" className="block text-white text-sm font-medium mb-1.5">
            {t("coaching_request.form.phone_label", "Phone Number")}
          </label>
          <div className="relative">
            <PhoneInput
              containerClass="!w-full !h-[42px] md:!h-[44px] bg-oxfordBlue rounded-xl overflow-hidden border border-white/10" // Adjusted height for consistency
              buttonClass="!bg-white/5 !border-none !h-full" // Ensure button takes full height of container
              inputClass={`!text-sm !bg-white/5 !w-full !border-none !px-3 !py-2.5 !h-full text-white placeholder-white/50 ${
                phoneError ? "!border !border-red-500" : ""
              }`} // Ensure input takes full height
              country="es"
              enableSearch
              searchPlaceholder={t("coaching_request.form.phone_search_placeholder")}
              value={formData.phone}
              onChange={handlePhoneChange} // This now correctly triggers validation that updates parent
              dropdownClass="!bg-oxfordBlue text-white rounded-xl shadow-lg"
              searchClass="!bg-oxfordBlue !text-white placeholder-white/50 rounded-md p-2 my-2"
            />
            {/* Validation indicators (optional, can be styled further) */}
            {formData.phone && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
                {validatingPhone && (
                  <svg className="animate-spin h-4 w-4 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {!validatingPhone && phoneValidated && (
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                {!validatingPhone && !phoneValidated && formData.phone && formData.phone.replace(/\D/g, "").length >= 8 && (
                  <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
              </div>
            )}
          </div>
          {phoneError && (
            <p className="text-red-500 text-xs mt-1">{phoneError}</p>
          )}
        </div>
      </div>

      {/* Section 2: Account Creation Notice & Login Option */}
      <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 space-y-3 mt-6">
        <div className="flex items-center justify-center text-yellow-200 text-xs sm:text-sm">
          <p>
            {t("coaching_request.form.auto_account_warning", "An account will be created with these details to manage your subscription.")}
          </p>
        </div>
        
        <div className="pt-2">
          <p className="text-white/80 text-sm mb-2">
            {t("booking.login_prompt_simple", "Already have an account?")} 
          </p>
          <button
            type="button"
            onClick={openAuthModal}
            className="inline-flex items-center justify-center bg-darkGold text-black font-semibold py-2 px-5 rounded-lg hover:bg-opacity-90 transition-colors text-sm"
          >
            {t("booking.login_button", "Log In Here")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 3: Payment Step
function PaymentStep({
  selectedTier,
  requestId,
  onPaymentConfirmed,
  formData,
}) {
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [pollingError, setPollingError] = useState(null);

  const getPriceForTier = (tier) => {
    const prices = {
      Weekly: "€40",
      Daily: "€90",
      Priority: "€230",
    };
    return prices[tier] || "€40";
  };

  const getPlanNameForTier = (tier) => {
    const planNames = {
      Weekly: "Basic",
      Daily: "Standard",
      Priority: "Premium",
    };
    return planNames[tier] || "Basic";
  };

  useEffect(() => {
    const pendingId = localStorage.getItem("pendingCoachingId");
    if (pendingId && pendingId === requestId?.toString()) {
      setPaymentStarted(true);
      localStorage.removeItem("pendingCoachingId");
    }
  }, [requestId]);

  const handleStripeRedirect = async () => {
    try {
      if (!requestId) {
        console.error("Request ID is not available for Stripe redirect.");
        setPollingError("Failed to start subscription: Missing request ID.");
        return;
      }
      localStorage.setItem("pendingCoachingId", requestId.toString());

      const { data } = await axios.post(
        "/.netlify/functions/createCoachingSession",
        {
          requestId,
          tier: selectedTier,
          email: formData.email,
          productId: "prod_SBC2yFeKHqFXZr",
          isTestBooking: false,
        }
      );

      window.open(data.url, "_blank");
      setPaymentStarted(true);
    } catch (error) {
      console.error("Error creating Stripe subscription:", error);
      setPollingError("Failed to start subscription process");
    }
  };

  useEffect(() => {
    if (!paymentStarted || !requestId) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `/.netlify/functions/getCoachingStatus?id=${requestId}`
        );

        if (response.data.paymentStatus === "paid") {
          setPaymentConfirmed(true);
          onPaymentConfirmed(true);
          clearInterval(interval);
        } else if (
          response.data.paymentStatus === "pending" &&
          Math.random() < 0.2
        ) {
          try {
            await axios.get(
              `/.netlify/functions/forceUpdateCoaching?id=${requestId}`
            );
            const verifyResponse = await axios.get(
              `/.netlify/functions/getCoachingStatus?id=${requestId}`
            );

            if (verifyResponse.data.paymentStatus === "paid") {
              setPaymentConfirmed(true);
              onPaymentConfirmed(true);
              clearInterval(interval);
            }
          } catch (verifyError) {
            console.error("Fallback verification failed:", verifyError);
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setPollingError("Error checking subscription status");
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentStarted, requestId, onPaymentConfirmed]);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden mb-6">
        <div className="bg-darkGold/10 p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-center">
            Subscription Details
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Selected Plan:</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">
                {getPlanNameForTier(selectedTier)}
              </span>
              <span className="bg-darkGold/20 text-white text-xs px-2 py-0.5 rounded">
                {selectedTier}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Price:</span>
            <div className="text-darkGold font-bold text-lg">
              {getPriceForTier(selectedTier)}
              <span className="text-white/50 text-sm font-normal">/month</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Billing:</span>
            <span className="text-white">Monthly</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Renewal:</span>
            <span className="text-white">Automatic</span>
          </div>
          <div className="border-t border-white/10 my-2"></div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">Email for billing:</span>
            <span className="text-white break-all">{formData.email}</span>
          </div>
        </div>
        <div className="bg-white/5 p-3 text-xs text-white/60 text-center border-t border-white/10">
          You can cancel your subscription at any time from your account
          settings
        </div>
      </div>
      <div className="space-y-4">
        {!paymentStarted ? (
          <button
            onClick={handleStripeRedirect}
            className="w-full py-3 bg-gradient-to-r from-darkGold to-amber-400 text-black font-medium rounded-lg hover:from-amber-400 hover:to-amber-300 transition-all shadow-lg"
          >
            Start Subscription
          </button>
        ) : paymentConfirmed ? (
          <div className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-400/30 rounded-lg p-3 text-green-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Subscription activated successfully</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/20 rounded-lg p-3 text-white/80">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            <span>Confirming your subscription...</span>
          </div>
        )}
        {pollingError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm text-center">
            {pollingError}. Please refresh the page or contact support.
          </div>
        )}
        {paymentStarted && !paymentConfirmed && !pollingError && (
          <p className="text-white/60 text-sm text-center">
            A payment window has opened in a new tab. Please complete the
            payment there and return to this page.
          </p>
        )}
      </div>
      <div className="mb-2 mt-4 flex justify-center items-center gap-4">
        <img
          src={stripe}
          alt="Secure payments powered by Stripe"
          className="h-8 opacity-90"
        />
        <img src={ssl} alt="SSL Secured" className="h-8 opacity-90" />
      </div>
    </div>
  );
}

// Main Coaching Request Component
export default function CoachingRequest({ onBackService }) {
  const { t } = useTranslation();
  const { tier } = useContext(ServiceContext);
  const { user } = useAuth();
  const [step, setStep] = useState(tier ? 2 : 1);
  const [formData, setFormData] = useState({
    frequency: tier || "",
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
  });

  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const formRef = useScrollToTopOnChange([step]);
  const [requestId, setRequestId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

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
            console.warn("Error fetching profile for autofill (CoachingRequest):", profileError.message);
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
          console.error("Error in fetchUserProfile (CoachingRequest):", error);
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (tier) {
      setFormData((prev) => ({ ...prev, frequency: tier }));
      setStep(2);
    }
  }, [tier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "frequency" && value) setStep(2);
  };

  const handlePhoneValidation = (isValid) => {
    setIsPhoneValid(isValid);
  };

  const STEPS = [
    { title: t("coaching_request.steps.frequency"), component: FrequencyStep },
    { title: t("coaching_request.steps.contact"), component: ContactStep },
    { title: t("coaching_request.steps.payment"), component: PaymentStep },
    { title: t("coaching_request.steps.chat"), component: InlineChatbotStep },
  ];

  const Current = STEPS[step - 1].component;
  const UI_STEPS = STEPS.length + 1;

  const handlePaymentConfirmed = (confirmed) => {
    setPaymentDone(confirmed);
  };

  const canProceed = () => {
    if (step === 1 && !formData.frequency) return false;

    if (step === 2) {
      const isNameValid = formData.name && formData.name.trim().length >= 2;
      const isEmailValid =
        formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      return isNameValid && isEmailValid && isPhoneValid;
    }

    if (step === 3) return paymentDone;

    return true;
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (step === 1 && formData.frequency) {
        setStep(2);
        return;
    }

    if (step === 2) {
      setIsSubmitting(true);
      try {
        if (!user && formData.name && formData.email) {
          const accountResult = await autoCreateAccount(
            formData.name,
            formData.email
          );
          if (accountResult.success && !accountResult.userExists) {
            console.log("Account created successfully");
          }
        }

        const membershipStartDate = new Date();
        const membershipEndDate = addMonths(membershipStartDate, 1);

        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service_type: formData.frequency,
          membership_start_date: membershipStartDate.toISOString(),
          membership_end_date: membershipEndDate.toISOString(),
          payment_status: "pending",
        };
        if (user?.id) payload.user_id = user.id;

        const { data, error } = await supabase
          .from("coaching_requests")
          .insert(payload)
          .select("id")
          .single();

        if (error) {
          console.error("Error creating coaching request:", error);
          alert("Failed to create coaching request.");
          setIsSubmitting(false);
          return;
        }
        setRequestId(data.id);
        setIsSubmitting(false);
        setStep(3);
      } catch (error) {
        console.error("Error creating coaching request:", error);
        alert("An error occurred. Please try again.");
        setIsSubmitting(false);
      }
    } else if (step === 3 && paymentDone) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else onBackService();
  };

  const handleStepClick = (dot) => {
    if (dot -1 < step && !isSubmitting) {
      if (dot === 1) {
        if (step === 1) onBackService();
        else setStep(1);
      } else {
        setStep(dot - 1);
      }
    } else if (dot === 1 && step === 1 && !isSubmitting) {
        onBackService();
    }
  };

  return (
    <section className="py-8 px-4" id="coaching-journey" ref={formRef}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          {t("coaching_request.title")}
        </h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl text-white mb-4">{STEPS[step - 1].title}</h3>

          {step === 1 ? (
            <FrequencyStep formData={formData} onChange={handleChange} />
          ) : step === 2 ? (
            <ContactStep
              formData={formData}
              onChange={handleChange}
              onPhoneValidation={handlePhoneValidation}
            />
          ) : step === 3 ? (
            <PaymentStep
              selectedTier={formData.frequency}
              requestId={requestId}
              formData={formData}
              onPaymentConfirmed={handlePaymentConfirmed}
            />
          ) : (
            requestId && <InlineChatbotStep
              requestId={requestId}
              tableName="coaching_chat_messages"
              onFinish={async () => {
                if (!requestId) {
                  console.error(
                    "No request ID available to complete coaching chat."
                  );
                  return;
                }
                try {
                  const webhookUrl =
                    "https://rafaello.app.n8n.cloud/webhook/coaching-complete";
                  console.log(
                    `Coaching chat finished for session_id: ${requestId}. Triggering webhook: ${webhookUrl}`
                  );
                  await axios.post(webhookUrl, {
                    session_id: requestId,
                  });
                  console.log(
                    `Webhook for coaching session ${requestId} triggered successfully.`
                  );
                } catch (error) {
                  console.error(
                    "Error triggering coaching completion webhook:",
                    error
                  );
                }
              }}
            />
          )}
          {!requestId && step === 4 && (
            <div className="text-center text-red-400 p-4">
                Preparing chat... If this persists, please go back and try again.
            </div>
          )}

          <StepIndicator
            stepCount={UI_STEPS}
            currentStep={step + 1}
            onStepClick={handleStepClick}
            className="pt-6"
          />

          <div className="flex justify-between mt-2">
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
                ) : STEPS[step] ? STEPS[step].title : t("coaching_request.buttons.next")}
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
        </div>
      </div>
    </section>
  );
}