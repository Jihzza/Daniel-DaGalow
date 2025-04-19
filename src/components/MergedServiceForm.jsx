// src/components/MergedServiceForm.jsx
import React, { useState } from "react";
import AnalysisRequest from "./Forms/AnalysisRequest";
import Booking from "./Forms/Booking";
import CoachingRequest from "./Forms/CoachingRequest";

// Step 1 UI: choose which form to show
function ServiceSelectionStep({ onSelect }) {
  const services = [
    { label: "Analysis", value: "analysis" },
    { label: "Booking", value: "booking" },
    { label: "Coaching", value: "coaching" },
  ];

  return (
    <section className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          What service do you need?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-oxfordBlue shadow-lg rounded-2xl p-6">
          {services.map((s) => (
            <button
              key={s.value}
              onClick={() => onSelect(s.value)}
              className="p-6 rounded-2xl cursor-pointer text-center border-2 border-darkGold shadow-lg"
            >
              <span className="block text-white font-medium text-lg">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MergedServiceForm() {
  const [service, setService] = useState(null);

  if (!service) {
    return <ServiceSelectionStep onSelect={setService} />;
  }

  switch (service) {
    case "analysis":
      return <AnalysisRequest onBackService={() => setService(null)} />;

    case "booking":
      return <Booking onBackService={() => setService(null)} />;

    case "coaching":
      return <CoachingRequest onBackService={() => setService(null)} />;

    default:
      return null;
  }
}
