import React, { useState, useEffect } from "react";
import AnalysisRequest from "./Forms/AnalysisRequest";
import Booking from "./Forms/Booking";
import CoachingRequest from "./Forms/CoachingRequest";
import PitchDeckRequest from "./Forms/PitchDeckRequest";
import { useSearchParams } from "react-router-dom";
import { ServiceContext } from "./contexts/ServiceContext";
import { useContext } from "react";

export default function MergedServiceForm() {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("service"); // ← NEW

  const { service, setService } = useContext(ServiceContext);
  const [step, setStep] = useState(service ? 2 : 1);
  const services = [
    { label: "Analysis", value: "analysis" },
    { label: "Consultation", value: "booking" },
    { label: "Coaching", value: "coaching" },
    { label: "Pitch Deck", value: "pitchdeck" },
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
          <h2 className="text-2xl sm:text-xl font-bold text-center mb-6 text-black">
            What service do you need?
          </h2>
          <div className=" gap-6 bg-oxfordBlue shadow-lg rounded-2xl p-8">
            <h3 className="text-xl text-white mb-6">Choose the Service</h3>
            <div className="grid grid-cols-2 gap-6">
              {services.map((s) => (
                <button
                  key={s.value}
                  onClick={() => selectService(s.value)}
                  className="px-4 py-2 rounded-2xl cursor-pointer text-center border-2 border-darkGold shadow-lg"
                >
                  <span className="block text-white font-medium text-sm">
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
