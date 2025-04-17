import React, { useState } from "react";

const VentureInvestment = () => {
  const [formData, setFormData] = useState({
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setFormData({
        email: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section id="venture-investment" className="py-8 px-4 text-white">
      <div className="flex flex-col items-center justify-center space-y-6 rounded-xl px-4">
        <div className="flex flex-col items-center justify-center gap-6">
          <h2 className="text-2xl font-bold text-white">Invest With Me</h2>
          <p className="text-white text-center">
            I'm constantly developing new projects and ventures. If you're
            interested in learning more about current and upcoming
            opportunities, request a pitch deck below.
          </p>
          <button
            type="submit"
            className="bg-darkGold w-60 text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300"
          >
            Book a Consultation
          </button>
        </div>
      </div>
    </section>
  );
};

export default VentureInvestment;
