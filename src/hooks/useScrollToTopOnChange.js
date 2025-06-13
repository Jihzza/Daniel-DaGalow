import { useEffect, useRef } from 'react';

/**
 * A smart scroll hook that handles two scenarios:
 * 1. If a 'savedScrollY' value is found in sessionStorage, it restores that position.
 * 2. Otherwise, it scrolls to the top of a referenced element when dependencies change.
 * @param {Array} dependencies - Array of dependencies that trigger the scroll effect.
 * @param {Number} offset - Optional offset from the top for the default scroll behavior.
 * @returns {React.RefObject} - Ref to attach to the element.
 */
export const useScrollToTopOnChange = (dependencies = [], offset = -20) => {
  const elementRef = useRef(null);

  useEffect(() => {

    const savedScrollY = sessionStorage.getItem('savedScrollY');
    
    if (savedScrollY) {
     
      setTimeout(() => {
        const top = parseInt(savedScrollY, 10);
        
        window.scrollTo({
          top: top,
          behavior: 'auto', // 'auto' provides an instant jump, which is best for restoration.
        });
        
        sessionStorage.removeItem('savedScrollY');
      }, 100); // A 100ms delay is usually sufficient for the DOM to be ready.

    } else if (elementRef.current) {
      // PRIORITY 2: If no restoration is needed, perform the default scroll-to-element behavior.
      const element = elementRef.current;
      const position = element.getBoundingClientRect().top;
      const offsetPosition = position + window.scrollY + offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return elementRef;
};