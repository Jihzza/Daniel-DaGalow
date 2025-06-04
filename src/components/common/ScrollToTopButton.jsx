// src/components/common/ScrollToTopButton.jsx
import React, { useState, useEffect } from 'react';
// Using a simpler chevron icon to match your image
import { FiChevronUp } from 'react-icons/fi';

const ScrollToTopButton = ({ isChatbotOpen }) => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  if (isChatbotOpen) return null; // Don't render when chatbot is open

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`
        fixed bottom-[80px] right-4 z-50
        bg-black text-darkGold rounded-full
        w-8 h-8 flex items-center justify-center
        hover:bg-gray-800 focus:outline-none
        focus:ring-2 focus:ring-darkGold
        transition-all duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      aria-label="Scroll to top"
    >
      <FiChevronUp size={30} /> {/* A simple chevron icon, adjusted size */}
    </button>
  );
};

export default ScrollToTopButton;