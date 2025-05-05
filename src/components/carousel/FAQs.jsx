import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
// Helper function to parse formatted content
const formatContent = (content) => {
  if (!content) return null;
  
  
  // Split content by newlines
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    // Check for bullet points
    if (line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
      return (
        <li key={index} className="ml-6 list-disc mb-2">
          {line.trim().substring(2)}
        </li>
      );
    }
    // Check for numeric points
    else if (/^\d+\.\s/.test(line.trim())) {
      const textContent = line.trim().replace(/^\d+\.\s/, '');
      return (
        <li key={index} className="ml-6 list-decimal mb-2">
          {textContent}
        </li>
      );
    }
    // Regular paragraph
    else if (line.trim()) {
      return (
        <p key={index} className="mb-3">
          {line}
        </p>
      );
    }
    // Empty line
    return null;
  });
};

// Process and wrap content with proper list elements
const renderFormattedContent = (content) => {
  if (!content) return null;
  
  const lines = content.split('\n');
  const result = [];
  let currentList = [];
  let listType = null;
  
  lines.forEach((line, index) => {
    const isBullet = line.trim().startsWith('• ') || line.trim().startsWith('* ');
    const isNumeric = /^\d+\.\s/.test(line.trim());
    
    // If we encounter a list item
    if (isBullet || isNumeric) {
      const newListType = isBullet ? 'bullet' : 'numeric';
      
      // If we're starting a new list or switching list types
      if (listType !== newListType && currentList.length > 0) {
        // Add the previous list to results
        result.push(
          listType === 'bullet' 
            ? <ul key={result.length} className="list-disc pl-6 mb-4">{currentList}</ul>
            : <ol key={result.length} className="list-decimal pl-6 mb-4">{currentList}</ol>
        );
        currentList = [];
      }
      
      listType = newListType;
      
      // Add the item to the current list
      const content = line.trim().replace(/^[•*]\s|^\d+\.\s/, '');
      currentList.push(<li key={index} className="mb-2">{content}</li>);
    } 
    // If we have a regular paragraph
    else if (line.trim()) {
      // If we were building a list, add it to results first
      if (currentList.length > 0) {
        result.push(
          listType === 'bullet' 
            ? <ul key={result.length} className="list-disc pl-6 mb-4">{currentList}</ul>
            : <ol key={result.length} className="list-decimal pl-6 mb-4">{currentList}</ol>
        );
        currentList = [];
        listType = null;
      }
      
      // Add the paragraph
      result.push(<p key={index} className="mb-3">{line}</p>);
    }
  });
  
  // Add any remaining list
  if (currentList.length > 0) {
    result.push(
      listType === 'bullet' 
        ? <ul key={result.length} className="list-disc pl-6 mb-4">{currentList}</ul>
        : <ol key={result.length} className="list-decimal pl-6 mb-4">{currentList}</ol>
    );
  }
  
  return result;
};



function FAQs() {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: t('faqs.questions.coaching.tiers.question'),
    answer: t('faqs.questions.coaching.tiers.answer'),
  });
// In FAQs.jsx
useEffect(() => {
  // Update the current question when language changes
  setCurrentQuestion({
    question: t('faqs.questions.coaching.tiers.question'),
    answer: t('faqs.questions.coaching.tiers.answer'),
  });
}, [t, i18n.language]); // Add i18n.language as a dependency

  const questions = [
    // Coaching Services
    {
      question: t('faqs.questions.coaching.tiers.question'),
      answer: t('faqs.questions.coaching.tiers.answer'),
    },
    {
      question: t('faqs.questions.coaching.right_package.question'),
      answer: t('faqs.questions.coaching.right_package.answer'),
    },
    {
      question: t('faqs.questions.coaching.change_subscription.question'),
      answer: t('faqs.questions.coaching.change_subscription.answer'),
    },
    {
      question: t('faqs.questions.coaching.communication.question'),
      answer: t('faqs.questions.coaching.communication.answer'),
    },

    // Consultation Services
    {
      question: t('faqs.questions.consultation.booking.question'),
      answer: t('faqs.questions.consultation.booking.answer'),
    },
    {
      question: t('faqs.questions.consultation.preparation.question'),
      answer: t('faqs.questions.consultation.preparation.answer'),
    },
    {
      question: t('faqs.questions.consultation.reschedule.question'),
      answer: t('faqs.questions.consultation.reschedule.answer'),
    },
    {
      question: t('faqs.questions.consultation.advance_booking.question'),
      answer: t('faqs.questions.consultation.advance_booking.answer'),
    },
    {
      question: t('faqs.questions.consultation.followup.question'),
      answer: t('faqs.questions.consultation.followup.answer'),
    },

    // Analysis Services
    {
      question: t('faqs.questions.analysis.types.question'),
      answer: t('faqs.questions.analysis.types.answer'),
    },
    {
      question: t('faqs.questions.analysis.information.question'),
      answer: t('faqs.questions.analysis.information.answer'),
    },
    {
      question: t('faqs.questions.analysis.delivery.question'),
      answer: t('faqs.questions.analysis.delivery.answer'),
    },

    // Pitch Deck Services
    {
      question: t('faqs.questions.pitch_deck.offering.question'),
      answer: t('faqs.questions.pitch_deck.offering.answer'),
    },

    {
      question: t('faqs.questions.chatbot.purpose.question'),
      answer: t('faqs.questions.chatbot.purpose.answer')
    },

    // Payment Information
    {
      question: t('faqs.questions.general.payments.question'),
      answer: t('faqs.questions.general.payments.answer'),
    },
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
      <div className="max-w-4xl md:max-w-6xl mx-auto h-full flex flex-col">
        <h2 className="text-2xl md:text-4xl py-4 font-bold text-center text-black">
          {t('faqs.title')}
        </h2>

        <div className="relative w-full flex flex-col flex-1">
          <div className="rounded-xl overflow-hidden flex flex-col h-full">
            <div className="flex flex-col h-full">
              <div className="relative">
                {/* Selected Question Header */}
                <div
                  className="py-3 flex flex-col cursor-pointer rounded-xl"
                  onClick={toggleDropdown}
                >
                  <div className="flex justify-between items-center w-full px-4">
                    <h3 className="text-lg md:text-2xl font-semibold text-black flex-grow">
                      {currentQuestion.question}
                    </h3>
                    <svg
                      className={`w-7 h-7 md:w-10 md:h-10 transform transition-transform duration-300 ${
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
                  <span className="block w-[95%] my-2 mx-auto border-b-2 border-oxfordBlue rounded-xl" />
                </div>

                {/* Dropdown List */}
                {isDropdownOpen && (
                  <div className="absolute rounded-xl left-0 right-0 z-20 bg-white -mt-1 shadow-md py-4 max-h-[40vh] overflow-y-auto">
                    {questions.map((option, index) => (
                      <div
                        key={index}
                        className={`relative w-[90%] md:w-[95%] mx-auto rounded-xl py-2 px-4 cursor-pointer transition-colors duration-200 last:border-b-0 ${
                          currentQuestion.question === option.question
                            ? 'bg-oxfordBlue text-white'
                            : 'hover:bg-gray-100 text-gray-800'
                        }`}
                        onClick={() => handleQuestionSelect(option.question, option.answer)}
                      >
                        {option.question}
                        {currentQuestion.question !== option.question && (
                          <span className="block w-full mx-auto border-b-2 border-darkGold mt-1 rounded-xl" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Answer Section - Now with formatted content */}
              <div className="flex-1 flex items-start p-4 overflow-y-auto">
                <div className="text-base md:text-xl text-black leading-relaxed">
                  {renderFormattedContent(currentQuestion.answer)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQs;
