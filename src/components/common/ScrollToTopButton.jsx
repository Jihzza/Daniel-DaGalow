// src/components/common/ScrollToTopButton.jsx
import React, { useState, useEffect } from 'react';
import upArrow from '../../assets/icons/upArrow.svg'; // You'll need to add an up arrow icon

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) { // Show button after scrolling 300px
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  console.log('isVisiblestate');
  // Set the top cordinate to 0
  // make scrolling smooth
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
    <div className="scroll-to-top">
      {isVisible && (
        <button onClick={scrollToTop} className="scroll-to-top-button">
          <img src={upArrow} alt="Scroll to Top" className="scroll-to-top-icon" />
          <span className="scroll-to-top-text">Scroll to Top</span>
        </button>
      )}
    </div>
  );
};

export default ScrollToTopButton;