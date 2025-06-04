import React, { useState, useEffect, useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import InlineChatbotStep from "../chat/InlineChatbotStep";
import { addMonths } from "date-fns";
import { AuthModalContext } from "../../App";
// Removed ServiceContext import as 'tier' is passed via props or router state in many apps.
// If you still use ServiceContext to get the tier, you can add it back.
// import { ServiceContext } from "../../contexts/ServiceContext";
import axios from "axios";
import { useScrollToTopOnChange }
from "../../hooks/useScrollToTopOnChange";
// Removed autoCreateAccount as direct signup is implemented
// import { autoCreateAccount } from "../../utils/autoSignup";
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
    <div className={`flex items-center justify-center py-2 gap-1 md:gap-2 ${className}`}>
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

// Step 2: Contact Info / Signup
function ContactStep({ formData, onChange, onPhoneValidation, user }) {
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);

  const [validatingPhone, setValidatingPhone] = useState(false);
  const [phoneValidated, setPhoneValidated] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const phoneValidationTimeout = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const EyeIcon = ({ color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
  
  const EyeOffIcon = ({ color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

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
    // Trigger validation if formData.phone already has a value (e.g. from prefill)
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
            readOnly={!!user} 
          />
           {!!user && <p className="text-xs text-white/60 mt-1">{t("edit_profile.form.email.cannot_change", "Email cannot be changed")}</p>}
        </div>

        {!user && (
          <>
            <div>
              <label htmlFor="coaching-password" className="block text-white text-sm font-medium mb-1.5">
                {t('auth.signup.password.label')}
              </label>
              <div className="relative">
                <input
                  id="coaching-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={onChange}
                  placeholder={t('auth.signup.password.placeholder')}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
                  required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="coaching-confirmPassword" className="block text-white text-sm font-medium mb-1.5">
                {t('auth.signup.confirm_password.label')}
              </label>
               <div className="relative">
                <input
                  id="coaching-confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={onChange}
                  placeholder={t('auth.signup.confirm_password.placeholder')}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-sm"
                  required
                />
                 <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </>
        )}

        <div>
          <label htmlFor="coaching-phone" className="block text-white text-sm font-medium mb-1.5">
            {t("coaching_request.form.phone_label", "Phone Number")}
          </label>
          <div className="relative">
            <PhoneInput
              containerClass="!w-full !h-[42px] md:!h-[44px] bg-oxfordBlue rounded-xl overflow-hidden border border-white/10"
              buttonClass="!bg-white/5 !border-none !h-full"
              inputClass={`!text-sm !bg-white/5 !w-full !border-none !px-3 !py-2.5 !h-full text-white placeholder-white/50 ${
                phoneError ? "!border !border-red-500" : ""
              }`}
              country="es" // Default country
              enableSearch
              searchPlaceholder={t("coaching_request.form.phone_search_placeholder")}
              value={formData.phone}
              onChange={handlePhoneChange}
              dropdownClass="!bg-oxfordBlue text-white rounded-xl shadow-lg"
              searchClass="!bg-oxfordBlue !text-white placeholder-white/50 rounded-md p-2 my-2"
            />
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

      {!user && (
        <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 space-y-3 mt-6">
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
      )}
    </div>
  );
}


// Step 3: Payment Step (remains largely the same, ensure it uses formData.email correctly)
function PaymentStep({
  selectedTier,
  requestId,
  onPaymentConfirmed,
  formData, // Pass full formData
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
    return prices[tier] || "€40"; // Default to Basic if somehow tier is not matching
  };

  const getPlanNameForTier = (tier) => {
    const planNames = {
      Weekly: "Basic",
      Daily: "Standard",
      Priority: "Premium",
    };
    return planNames[tier] || "Basic"; // Default for safety
  };

  // Effect to check if returning from Stripe
  useEffect(() => {
    const pendingId = localStorage.getItem("pendingCoachingId");
    if (pendingId && pendingId === requestId?.toString()) {
      setPaymentStarted(true);
      localStorage.removeItem("pendingCoachingId"); // Clean up
    }
  }, [requestId]);

  const handleStripeRedirect = async () => {
    try {
      if (!requestId) {
        console.error("Request ID is not available for Stripe redirect.");
        setPollingError("Failed to start subscription: Missing request ID.");
        return;
      }
      // Store requestId to check on return (optional, helps if user closes tab)
      localStorage.setItem("pendingCoachingId", requestId.toString());

      const { data } = await axios.post(
        "/.netlify/functions/createCoachingSession", // Ensure this is your correct Netlify function endpoint
        {
          requestId, // This is the coaching_requests.id
          tier: selectedTier, // 'Weekly', 'Daily', 'Priority'
          email: formData.email, // Use email from formData
          // Supabase Price IDs (replace with your actual IDs from Stripe Dashboard)
          // Ensure these map correctly to your tiers and are for subscriptions
          productId: "prod_SBC2yFeKHqFXZr", // Replace with your actual Product ID from Stripe
          isTestBooking: false, // Set to true for test cards
        }
      );

      window.open(data.url, "_blank"); // Open Stripe checkout in a new tab
      setPaymentStarted(true); // Indicate that Stripe process has started
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
          `/.netlify/functions/getCoachingStatus?id=${requestId}` // Your Netlify function endpoint
        );

        if (response.data.paymentStatus === "paid") {
          setPaymentConfirmed(true);
          onPaymentConfirmed(true); // Notify parent
          clearInterval(interval);
        } else if (
          response.data.paymentStatus === "pending" &&
          Math.random() < 0.2
        ) {
          // Fallback: Attempt to force update status (for cases where webhook might be delayed)
          try {
            await axios.get(
              `/.netlify/functions/forceUpdateCoaching?id=${requestId}`
            ); // Another Netlify function if needed
            // Re-check status after attempting force update
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
        clearInterval(interval); // Stop polling on error
      }
    }, 5000); // Poll every 5 seconds

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
export default function CoachingRequest({ onBackService, tier: propTier }) { // tier can be passed as a prop
  const { t } = useTranslation();
  const { user, signUp: contextSignUp } = useAuth(); // Renamed signUp from context
  const initialTier = propTier || ""; // Use propTier if available

  const [step, setStep] = useState(initialTier && user ? 2 : initialTier && !user ? 2 : 1);
  
  const [formData, setFormData] = useState({
    frequency: initialTier,
    name: "", 
    email: "", 
    phone: "",
    password: "", 
    confirmPassword: "" 
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

          if (profileError && profileError.code !== 'PGRST116') { // Ignore "no rows found" error
            console.warn("Error fetching profile for autofill (CoachingRequest):", profileError.message);
          }

          setFormData(prevFormData => ({
            ...prevFormData,
            name: user.user_metadata?.full_name || profileData?.full_name || "",
            email: user.email || "",
            phone: profileData?.phone_number || "",
            password: '', 
            confirmPassword: '',
            frequency: initialTier || prevFormData.frequency // Preserve tier if already set
          }));

          if (profileData?.phone_number) {
            const validationResult = await validatePhoneNumber(profileData.phone_number);
            setIsPhoneValid(validationResult.isValid);
          } else {
            setIsPhoneValid(false); 
          }

        } catch (error) {
          console.error("Error in fetchUserProfile (CoachingRequest):", error);
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '', frequency: initialTier || prev.frequency}));
            setIsPhoneValid(false);
        }
      };
      fetchUserProfile();
    } else {
      setFormData(prev => ({
          frequency: initialTier || prev.frequency, 
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: ""
      }));
      setIsPhoneValid(false); 
    }
  }, [user, initialTier]);


  useEffect(() => {
    // This effect now primarily handles initial step setting based on tier and user status
    // The formData.frequency is already initialized with propTier
    if (initialTier) {
      setStep(2); // If a tier is provided (e.g., from Hero section), always start at step 2
    } else {
      setStep(1); // Otherwise, start at step 1 (frequency selection)
    }
  }, [initialTier]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "frequency" && value) {
        setStep(2); // Move to contact step after frequency selection
    }
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

  const CurrentStepComponent = STEPS[step - 1].component;
  const UI_STEPS = STEPS.length + 1; // Total steps for the UI indicator

  const handlePaymentConfirmed = (confirmed) => {
    setPaymentDone(confirmed);
  };

  const canProceed = () => {
    if (step === 1 && !formData.frequency) return false;

    if (step === 2) { // Contact/Signup step
      const isNameValid = formData.name && formData.name.trim().length >= 2;
      const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      let passwordChecks = true;
      if (!user) { 
        passwordChecks = formData.password && formData.password.length >= 6 && formData.password === formData.confirmPassword;
      }
      return isNameValid && isEmailValid && isPhoneValid && passwordChecks;
    }

    if (step === 3) return paymentDone; // Payment step

    return true; // For Chat step or if other steps are added
  };

const handleNext = async () => {
    if (!canProceed()) return;

    if (step === 1 && formData.frequency) {
        setStep(2); // Move from Frequency to Contact/Signup
        return;
    }

    if (step === 2) { // Processing Contact Info / Signup
        setIsSubmitting(true);
        try {
            let currentUserId = user?.id;
            let currentEmail = user?.email || formData.email; 

            if (!user) { // User is not logged in, so sign them up
                // Password validation already in canProceed, but double-check here for safety
                if (formData.password !== formData.confirmPassword) {
                    alert(t('auth.signup.errors.password_mismatch'));
                    setIsSubmitting(false);
                    return;
                }
                if (formData.password.length < 6) {
                    alert(t('auth.signup.errors.password_length'));
                    setIsSubmitting(false);
                    return;
                }

                const { data: signUpData, error: signUpError } = await contextSignUp(
                    formData.email,
                    formData.password,
                    {
                        data: { // This data goes into auth.users.raw_user_meta_data
                            full_name: formData.name,
                            // Phone number is handled separately below by updating the 'profiles' table
                        }
                    }
                );

                if (signUpError) {
                    alert(signUpError.message || t('auth.signup.errors.default'));
                    setIsSubmitting(false);
                    return;
                }
                
                currentUserId = signUpData.user.id;
                currentEmail = signUpData.user.email; 

                // After successful signup, Supabase trigger should create a profile.
                // Now, update that profile with the phone number.
                if (signUpData.user && formData.phone) {
                    const { error: profileUpdateError } = await supabase
                        .from('profiles')
                        .update({ phone_number: formData.phone }) // Only update phone, name is from metadata
                        .eq('id', signUpData.user.id);
                    if (profileUpdateError) {
                        console.warn('Failed to update profile with phone number after signup:', profileUpdateError.message);
                    }
                }
                alert("Account created! Please check your email for confirmation. Your request is being processed.");
            } else { // User is already logged in
                // Check if name or phone number changed and update profile
                let profileUpdates = {};
                // Fetch current profile details to compare
                const {data: currentProfileData, error: currentProfileError} = await supabase
                    .from('profiles')
                    .select('full_name, phone_number')
                    .eq('id', user.id)
                    .single();

                if (currentProfileError && currentProfileError.code !== 'PGRST116') {
                    console.warn('Could not fetch current profile to compare:', currentProfileError.message);
                } else {
                    if (formData.name !== (currentProfileData?.full_name || user.user_metadata?.full_name)) {
                        profileUpdates.full_name = formData.name;
                    }
                    if (formData.phone && formData.phone !== currentProfileData?.phone_number) {
                        profileUpdates.phone_number = formData.phone;
                    }
                }
                
                if (Object.keys(profileUpdates).length > 0) {
                    const { error: profileUpdateError } = await supabase
                        .from('profiles')
                        .update(profileUpdates)
                        .eq('id', user.id);
                    if (profileUpdateError) console.warn('Failed to update profile for existing user:', profileUpdateError.message);
                }
            }

            // Common logic: Create coaching request
            const membershipStartDate = new Date();
            const membershipEndDate = addMonths(membershipStartDate, 1);

            const payload = {
                name: formData.name,
                email: currentEmail, 
                phone: formData.phone,
                service_type: formData.frequency,
                membership_start_date: membershipStartDate.toISOString(),
                membership_end_date: membershipEndDate.toISOString(),
                payment_status: "pending", 
                user_id: currentUserId,
            };
            
            const { data: coachingRequestData, error: coachingError } = await supabase
                .from("coaching_requests")
                .insert(payload)
                .select("id")
                .single();

            if (coachingError) {
                console.error("Error creating coaching request:", coachingError);
                alert("Failed to create coaching request: " + coachingError.message);
                throw coachingError; // Throw to be caught by outer catch
            }
            setRequestId(coachingRequestData.id);
            setStep(3); // Proceed to Payment Step

        } catch (error) { 
            console.error("Error in contact/signup step processing:", error);
            // No generic alert here, specific ones are shown inside the try block
        } finally {
            setIsSubmitting(false);
        }
    } else if (step === 3 && paymentDone) {
        setStep(4); // Move from Payment to Chat
    }
};


  const handleBack = () => {
    if (step > 1) {
      if (step === 2 && initialTier) { // If coming from Hero with a tier, back from contact goes to service selection
        onBackService();
      } else {
        setStep((s) => s - 1);
      }
    } else {
      onBackService(); // If on step 1, back goes to service selection
    }
  };

  const handleStepClick = (clickedStepNum) => {
    // clickedStepNum is 1-based for UI, step is 0-based internal state usually, but here step is 1-based
    // UI_STEPS is total dots, so step 1 (Frequency) is dot 2 if UI_STEPS = STEPS.length + 1
    const targetInternalStep = clickedStepNum - 1; // Convert UI dot to internal step

    if (targetInternalStep < step && !isSubmitting) { // Can only go back to previous steps
        if (targetInternalStep === 0) { // Corresponds to UI dot 1 (Main Service Selection)
             onBackService();
        } else {
            setStep(targetInternalStep);
        }
    }
  };
  
  const loadingSpinner = (
    <span className="flex items-center">
      <svg
        className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {t("hero.buttons.processing")} 
    </span>
  );

  return (
    <section className="py-4 sm:py-6 md:py-8 px-4 sm:px-4" id="coaching-journey" ref={formRef}>
      <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-black">
          {t("coaching_request.title")}
        </h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
          <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-4 font-semibold">
            {STEPS[step - 1].title}
          </h3>

          {step === 1 && (
            <FrequencyStep formData={formData} onChange={handleChange} />
          )}
          {step === 2 && (
            <ContactStep
              formData={formData}
              onChange={handleChange}
              onPhoneValidation={handlePhoneValidation}
              user={user} 
            />
          )}
          {step === 3 && (
            <PaymentStep
              selectedTier={formData.frequency}
              requestId={requestId}
              formData={formData} 
              onPaymentConfirmed={handlePaymentConfirmed}
            />
          )}
           {step === 4 && requestId && (
            <InlineChatbotStep 
              requestId={requestId} 
              tableName="coaching_chat_messages" 
              onFinish={async () => {
                 if (!requestId) {
                    console.error("No request ID available to complete coaching chat.");
                    return;
                  }
                  try {
                    // This URL should match the trigger in your N8N workflow
                    const webhookUrl = "https://rafaello.app.n8n.cloud/webhook/coaching-complete"; 
                    await axios.post(webhookUrl, {
                      session_id: requestId, // Ensure your N8N workflow expects session_id
                    });
                  } catch (error) {
                    console.error("Error triggering coaching completion webhook:", error);
                  }
              }}
            />
          )}
          {step === 4 && !requestId && ( // Fallback if requestId isn't set for chat step
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

          <div className="flex justify-between mt-4 sm:mt-6"> {/* Increased margin-top */}
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 sm:px-6 sm:py-2.5 border-2 border-darkGold text-darkGold rounded-xl hover:bg-darkGold/10 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {t("coaching_request.buttons.back")}
            </button>
            {step < STEPS.length && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-darkGold text-black font-semibold rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {isSubmitting ? loadingSpinner : (
                  // Display the title of the *next* step if available, otherwise default "Next"
                  STEPS[step] ? STEPS[step].title : t("coaching_request.buttons.next")
                )}
              </button>
            )}
            {step === STEPS.length && ( 
              <button
                onClick={() => {
                    onBackService(); // Or navigate to profile, or whatever "Done" means
                }}
                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-darkGold text-black font-semibold rounded-xl hover:bg-opacity-90 transition-colors text-sm sm:text-base"
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