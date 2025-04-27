import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AnalysisRequest from "./AnalysisRequest";
import Booking from "./Booking";
import CoachingRequest from './CoachingRequest';
import PitchDeckRequest from "./PitchDeckRequest";
import { useSearchParams } from "react-router-dom";
import { ServiceContext } from "../../contexts/ServiceContext";
import { useContext } from "react";

export default function MergedServiceForm() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("service");

  const { service, setService } = useContext(ServiceContext);
  const [step, setStep] = useState(service ? 2 : 1);
  const services = [
    { label: t("service_form.services.consultation"), value: "booking" },
    { label: t("service_form.services.coaching"), value: "coaching" },
    { label: t("service_form.services.analysis"), value: "analysis" },
    { label: t("service_form.services.pitch_deck"), value: "pitchdeck" },
  ];

  const SERVICE_COMPONENT = {
    analysis: AnalysisRequest,
    booking: Booking,
    coaching: CoachingRequest,
    pitchdeck: PitchDeckRequest,
  };

  const SERVICE_STEPS = {
    analysis: 3,
    booking: 5,
    coaching: 4,
    pitchdeck: 4,
  };

  useEffect(() => {
    if (service) setStep(2); // jump straight into the wizard
  }, [service]);

  const handleBack = () => {
    setService(null);
    setStep(1);
  };

  // total dots = 1 (service select) + internal
  const totalSteps = 1 + (service ? SERVICE_STEPS[service] : 0);

  const onStepClick = (n) => {
    if (n === 1) {
      setService(null);
      setStep(1);
    } else if (service && n <= totalSteps) {
      setStep(n);
    }
  };

  const selectService = (value) => {
    setService(value);
    setStep(2);
  };

  const CurrentForm = service ? SERVICE_COMPONENT[service] : null;

  // Step indicators with original styling
  const StepIndicator = () => <div></div>;

  // Service selection view
  if (!service) {
    return (
      <section id="service-selection" className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-6 text-black">
            {t("service_form.title")}
          </h2>
          <div className="gap-6 bg-oxfordBlue shadow-lg rounded-2xl p-4 sm:p-6 md:p-8">
  <h3 className="text-xl md:text-2xl text-white mb-4 md:mb-6">{t("service_form.choose_service")}</h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
    {services.map((s) => (
      <button
        key={s.value}
        onClick={() => selectService(s.value)}
        className="px-3 py-3 sm:px-4 sm:py-4 rounded-xl md:rounded-2xl cursor-pointer text-center border-2 border-darkGold shadow-lg hover:bg-darkGold/20 transition-colors active:bg-darkGold/30 focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-opacity-50"
      >
        <span className="block text-white font-medium text-base sm:text-lg md:text-xl">
          {s.label}
        </span>
      </button>
    ))}
  </div>
</div>
        </div>
      </section>
    );
  }

  // Internal form
  return (
    <section>
      <div className="max-w-3xl mx-auto">
        <StepIndicator />
        {CurrentForm && <CurrentForm onBackService={() => onStepClick(1)} />}
      </div>
    </section>
  );
}
