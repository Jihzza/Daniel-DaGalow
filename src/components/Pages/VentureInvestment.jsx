import React, { useState } from 'react';

const VentureInvestment = () => {
  const [formData, setFormData] = useState({
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setFormData({
        email: '',
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <section id="venture-investment" className="py-8 px-4 text-white">
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16 transform transition-all duration-500">
          <h2 className="text-2xl font-bold text-white mb-8">
            Invest With Me
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            I'm constantly developing new projects and ventures. If you're interested in learning more about current and upcoming opportunities, request a pitch deck below.
          </p>
        </div>

        <div className="rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center transform transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 bg-darkGold text-white font-medium rounded-xl hover:bg-gold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-offset-2 focus:ring-offset-oxfordBlue ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Request Pitch Deck'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default VentureInvestment; 