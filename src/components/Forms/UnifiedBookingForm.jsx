// components/UnifiedBookingForm.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Booking from "./Booking"; // Your consultation booking component
import CoachingRequest from "./CoachingRequest"; // Your coaching request component
import AnalysisRequest from "./AnalysisRequest"; // Your analysis request component

const UnifiedBookingForm = () => {
  const location = useLocation();
  const [selectedService, setSelectedService] = useState(null);

  // Check if we have a pre-selected service from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceParam = params.get("service");

    if (
      serviceParam &&
      ["consultation", "coaching", "analysis"].includes(serviceParam)
    ) {
      setSelectedService(serviceParam);
    } else if (location.state && location.state.service) {
      setSelectedService(location.state.service);
    }
  }, [location]);

  // Handle service selection
  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  // If a service is already selected, render that form
  if (selectedService === "consultation") {
    return <Booking goBack={() => setSelectedService(null)} />;
  }
  if (selectedService === "coaching") {
    return <CoachingRequest goBack={() => setSelectedService(null)} />;
  }
  if (selectedService === "analysis") {
    return <AnalysisRequest goBack={() => setSelectedService(null)} />;
  }
  

  // If no service is selected, show the service selection screen
  return (
    <section id="booking" className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10 text-black">
          Choose Your Service
        </h2>

        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Consultation Service */}
            <div
              className="p-6 rounded-xl cursor-pointer transition-all hover:shadow-lg border-2 border-white/10 hover:border-darkGold bg-oxfordBlue"
              onClick={() => handleServiceSelect("consultation")}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Consultation
                </h3>
                <p className="text-white/70">
                  Book a personalized video session to discuss your specific
                  challenges and goals.
                </p>
              </div>
            </div>

            {/* Coaching Service */}
            <div
              className="p-6 rounded-xl cursor-pointer transition-all hover:shadow-lg border-2 border-white/10 hover:border-darkGold bg-oxfordBlue"
              onClick={() => handleServiceSelect("coaching")}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Direct Coaching
                </h3>
                <p className="text-white/70">
                  Receive ongoing guidance with personalized coaching in your
                  area of interest.
                </p>
              </div>
            </div>

            {/* Analysis Service */}
            <div
              className="p-6 rounded-xl cursor-pointer transition-all hover:shadow-lg border-2 border-white/10 hover:border-darkGold bg-oxfordBlue"
              onClick={() => handleServiceSelect("analysis")}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Expert Analysis
                </h3>
                <p className="text-white/70">
                  Get a detailed analysis of your business, investments, or
                  social media presence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnifiedBookingForm;
