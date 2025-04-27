import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function FAQs2() {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: t("faqs.questions.mindset.question"),
    answer: t("faqs.questions.mindset.answer")
  });

  const questions = [
    { 
      question: t("faqs.questions.mindset.question"),
      answer: t("faqs.questions.mindset.answer")
    },
    { 
      question: t("faqs.questions.motivation.question"),
      answer: t("faqs.questions.motivation.answer")
    },
    { 
      question: t("faqs.questions.setbacks.question"),
      answer: t("faqs.questions.setbacks.answer")
    },
    { 
      question: t("faqs.questions.confidence.question"),
      answer: t("faqs.questions.confidence.answer")
    },
    { 
      question: t("faqs.questions.productivity.question"),
      answer: t("faqs.questions.productivity.answer")
    },
    { 
      question: t("faqs.questions.stress.question"),
      answer: t("faqs.questions.stress.answer")
    },
    { 
      question: t("faqs.questions.habits.question"),
      answer: t("faqs.questions.habits.answer")
    },
    { 
      question: t("faqs.questions.decision_making.question"),
      answer: t("faqs.questions.decision_making.answer")
    },
    { 
      question: t("faqs.questions.communication.question"),
      answer: t("faqs.questions.communication.answer")
    },
    { 
      question: t("faqs.questions.goals.question"),
      answer: t("faqs.questions.goals.answer")
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
      <div className="max-w-4xl md:max-w-6xl px-4 md:px-0a mx-auto h-full flex flex-col">
        <h2 className="text-2xl md:text-4xl py-4 font-bold text-center text-black">
          {t("faqs.title")}
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
                    <h3 className="text-lg md:text-2xl font-semibold text-black flex-grow ">
                      {currentQuestion.question}
                    </h3>
                    <svg
                      className={`w-7 h-7 md:w-10 md:h-10 text-gray-600 transform transition-transform duration-300 ${
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
                  <span className="block w-[95%] my-2 mx-auto border-b-2 border-oxfordBlue rounded-xl"></span>
                </div>
                {/* Scrollable Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute rounded-xl left-0 right-0 z-20 bg-white -mt-1 shadow-md py-4 max-h-[40vh] overflow-y-auto">
                    {questions.map((option, index) => (
                      <div
                        key={index}
                        className={`relative w-[90%] md:w-[95%] mx-auto rounded-xl py-2 px-2 cursor-pointer transition-colors duration-200 last:border-b-0
                          ${currentQuestion.question === option.question 
                            ? 'bg-oxfordBlue text-white'
                            : 'hover:bg-gray-100 text-gray-800'
                          }`}
                        onClick={() => handleQuestionSelect(option.question, option.answer)}
                      >
                        {option.question}
                        {currentQuestion.question !== option.question && (
                          <span className="block w-9/10 md:w-full mx-auto border-b-2 border-darkGold mt-1 rounded-xl"></span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Answer Section */}
              <div className="flex-1 flex items-start">
                <p className="text-base md:text-xl text-black leading-relaxed">
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