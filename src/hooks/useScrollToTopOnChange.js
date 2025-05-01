// src/hooks/useScrollToTopOnChange.js

import { useEffect, useRef } from 'react';

/**
 * Custom hook that scrolls to the top of a referenced element when dependencies change
 * @param {Array} dependencies - Array of dependencies that trigger the scroll effect when changed
 * @param {Number} offset - Optional offset from the top (default: -20)
 * @returns {React.RefObject} - Ref to attach to the element you want to scroll to
 */
export const useScrollToTopOnChange = (dependencies = [], offset = -20) => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    if (elementRef.current) {
      const element = elementRef.current;
      const position = element.getBoundingClientRect().top;
      const offsetPosition = position + window.scrollY + offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, dependencies); // Effect runs when any dependency changes
  
  return elementRef;
};