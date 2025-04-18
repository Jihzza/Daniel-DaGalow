import React, { useState } from 'react';

function FAQs2() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "How can I start improving my mindset?",
    answer: "Begin with daily gratitude practice, positive affirmations, and setting small, achievable goals. Consistency is key to building a strong mindset foundation."
  });

  const questions = [
    { 
      question: "How can I start improving my mindset?",
      answer: "Begin with daily gratitude practice, positive affirmations, and setting small, achievable goals. Consistency is key to building a strong mindset foundation."
    },
    { 
      question: "What's the best way to stay motivated?",
      answer: "Create a clear vision, break goals into small steps, track progress, and celebrate small wins. Surround yourself with positive influences and maintain a growth mindset."
    },
    { 
      question: "How do I handle setbacks?",
      answer: "View setbacks as learning opportunities. Analyze what went wrong, adjust your approach, and keep moving forward. Remember that failure is part of the success journey."
    },
    { 
      question: "What's the key to building confidence?",
      answer: "Focus on your strengths, practice self-compassion, step out of your comfort zone regularly, and celebrate your achievements, no matter how small."
    },
    { 
      question: "How can I improve my productivity?",
      answer: "Prioritize tasks, eliminate distractions, take regular breaks, and focus on one task at a time. Use time management techniques like the Pomodoro method."
    },
    { 
      question: "What's the best way to handle stress?",
      answer: "Practice mindfulness, exercise regularly, maintain a healthy sleep schedule, and learn to say no when necessary. Regular self-care is essential."
    },
    { 
      question: "How do I build better habits?",
      answer: "Start small, be consistent, track your progress, and create a supportive environment. Use habit stacking to build new routines on existing ones."
    },
    { 
      question: "What's the secret to better decision-making?",
      answer: "Gather relevant information, consider different perspectives, trust your intuition, and be willing to make mistakes. Learn from each decision you make."
    },
    { 
      question: "How can I improve my communication skills?",
      answer: "Practice active listening, be clear and concise, show empathy, and ask for feedback. Regular practice and self-awareness are crucial."
    },
    { 
      question: "What's the best way to set goals?",
      answer: "Make them SMART (Specific, Measurable, Achievable, Relevant, Time-bound), write them down, create an action plan, and review them regularly."
    }
  ];

  const toggleDropdown = () => {
    setActiveDropdown(!activeDropdown);
  };

  const handleQuestionSelect = (question, answer) => {
    setCurrentQuestion({ question, answer });
    setActiveDropdown(false);
  };

  return (
    <section id="faqs2" className="py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-black">
          Quick Mindset Tips
        </h2>

        <div className="relative h-[50vh]">
          <div className="faq backdrop-blur-sm h-[40vh] rounded-xl overflow-hidden">
            <div 
              className="question p-4 flex justify-between items-center cursor-pointer relative" 
              onClick={toggleDropdown}
            >
              <h3 className="text-lg font-semibold text-black">{currentQuestion.question}</h3>
              <svg
                className={`faqBurger w-6 h-6 text-black transform transition-transform duration-300 ${
                  activeDropdown ? 'rotate-180' : ''
                }`}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>

              {activeDropdown && (
                <div className="dropdown-menu absolute top-full left-0 right-0 mt-1 bg-oxfordBlue rounded-xl overflow-hidden shadow-lg z-10 !h-[500px] overflow-y-auto">
                  {questions.map((option, index) => (
                    <a
                      key={index}
                      href="#"
                      className="block py-4 px-4 text-white hover:bg-oxfordBlue/80 transition-colors border-t border-white/20"
                      onClick={(e) => {
                        e.preventDefault();
                        handleQuestionSelect(option.question, option.answer);
                      }}
                    >
                      {option.question}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="answer px-4">
              <p className="text-black">{currentQuestion.answer}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQs2; 