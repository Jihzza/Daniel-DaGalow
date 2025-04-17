import React, { useState } from 'react';

function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What services do you offer?",
      answer: "I offer a range of services including mindset coaching, business consulting, social media strategy, and personal development. Each service is tailored to help you achieve your specific goals and overcome challenges."
    },
    {
      question: "How do your coaching sessions work?",
      answer: "Coaching sessions are conducted one-on-one, either virtually or in-person, depending on your preference. We'll work together to identify your goals, create a personalized action plan, and track your progress over time."
    },
    {
      question: "What makes your approach different?",
      answer: "My approach combines practical business strategies with mindset work, ensuring both your professional and personal growth. I focus on sustainable results rather than quick fixes, and I bring real-world experience from building successful businesses."
    },
    {
      question: "How long does it take to see results?",
      answer: "Results vary depending on your goals and commitment level. Some clients see immediate improvements in their mindset, while others achieve significant business growth within 3-6 months of consistent work."
    },
    {
      question: "Do you offer group programs?",
      answer: "Yes, I offer both individual and group coaching programs. Group programs provide a supportive community environment where you can learn from others' experiences while receiving personalized guidance."
    },
    {
      question: "What's your background and experience?",
      answer: "I've built multiple successful businesses, transformed my own life through mindset work, and have coached high-profile individuals including Miss Portugal 2019/2020. My experience spans across business development, social media growth, and personal transformation."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-black text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-oxfordBlue backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-4 text-left focus:outline-none flex justify-between items-center"
              >
                <span className="text-lg font-semibold text-white">{faq.question}</span>
                <svg
                  className={`w-6 h-6 transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              <div
                className={`px-6 transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-96 opacity-100 py-4'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-white/80">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQs;
