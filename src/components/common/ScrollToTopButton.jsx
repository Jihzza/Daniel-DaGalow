// src/components/common/ScrollToTopButton.jsx
import React, { useState, useEffect } from 'react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigationBarHeight = 60; // Height of your NavigationBar in pixels

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-0 right-0 m-2 z-50 
        bg-black text-darkGold 
        rounded-full shadow-lg 
        transition-all duration-100 ease-in-out
        ${isVisible ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
      `}
      style={{
        width: '35px',
        height: '35px',
        marginBottom: `${navigationBarHeight + 16}px`,
        marginRight: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Scroll to top"
      // Disable the button if it's not visible to prevent accidental clicks during transition
      disabled={!isVisible} 
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2.5}
        stroke="currentColor" 
        className="w-5 h-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;