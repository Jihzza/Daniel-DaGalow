import React, { useState } from 'react';

function FAQs2() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleQuestionSelect = (question, answer) => {
    setCurrentQuestion({ question, answer });
    setIsDropdownOpen(false);
  };

  return (
    <section id="faqs2" className="w-full h-[60vh]">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <h2 className="text-2xl py-4 font-bold text-center text-black">
          Quick Mindset Tips
        </h2>

        <div className="relative w-full flex flex-col flex-1">
          <div className="rounded-xl overflow-hidden flex flex-col h-full">
            <div className="flex flex-col h-full">
              <div className="relative">
                <div 
                  className="py-3 flex flex-col cursor-pointer rounded-xl"
                  onClick={toggleDropdown}
                >
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-lg font-semibold text-gray-800 flex-grow pr-4">
                      {currentQuestion.question}
                    </h3>
                    <svg
                      className={`w-7 h-7 text-gray-600 transform transition-transform duration-300 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 9l-7 7-7-7" 
                      />
                    </svg>
                  </div>
                  <span className="block w-full mx-auto border-b-2 border-oxfordBlue rounded-xl"></span>
                </div>
                {/* Scrollable Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute rounded-xl left-0 right-0 z-20 bg-white -mt-1 shadow-md py-4 max-h-[40vh] overflow-y-auto">
                    {questions.map((option, index) => (
                      <div
                        key={index}
                        className={`relative w-[90%] mx-auto rounded-xl py-2 px-2 cursor-pointer transition-colors duration-200 last:border-b-0
                          ${currentQuestion.question === option.question 
                            ? 'bg-oxfordBlue text-white'
                            : 'hover:bg-gray-100 text-gray-800'
                          }`}
                        onClick={() => handleQuestionSelect(option.question, option.answer)}
                      >
                        {option.question}
                        {currentQuestion.question !== option.question && (
                          <span className="block w-9/10 mx-auto border-b-2 border-darkGold mt-1 rounded-xl"></span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Answer Section */}
              <div className="py-3 flex-1 flex items-start">
                <p className="text-base text-black leading-relaxed">
                  {currentQuestion.answer}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default FAQs2;