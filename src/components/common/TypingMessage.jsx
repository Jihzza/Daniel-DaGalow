import React, { useState, useEffect, useRef } from 'react';

/**
 * TypingMessage component creates a realistic typing animation effect for chat messages
 * 
 * @param {Object} props Component props
 * @param {string} props.text The full text to be animated
 * @param {number} props.typingSpeed Base typing speed in milliseconds (lower = faster)
 * @param {number} props.startDelay Delay before typing starts in milliseconds
 * @param {boolean} props.isComplete Whether typing is already complete (for loading historic messages)
 * @param {Function} props.onComplete Callback function when typing animation completes
 * @param {string} props.className Additional CSS classes to apply
 */
const TypingMessage = ({ 
  text = "", 
  typingSpeed = 60, 
  startDelay = 200,
  isComplete = false,
  onComplete = () => {},
  className = ""
}) => {
  // State to store the visible portion of text during typing animation
  const [visibleText, setVisibleText] = useState(isComplete ? text : "");
  // State to track if we're actively typing
  const [isTyping, setIsTyping] = useState(!isComplete);
  // Current position in the typing animation
  const charIndexRef = useRef(0);
  // Store the full text to avoid issues with text prop changing during animation
  const fullTextRef = useRef(text);
  // Timer ID for cleanup
  const timerRef = useRef(null);
  
  // Reset animation if text changes
  useEffect(() => {
    fullTextRef.current = text;
    
    if (isComplete) {
      // If marked complete, show full text immediately
      setVisibleText(text);
      setIsTyping(false);
    } else if (text !== visibleText) {
      // If text changed, reset and start over
      charIndexRef.current = 0;
      setVisibleText("");
      setIsTyping(true);
    }
  }, [text, isComplete]);
  
  // Handle the typing animation
  useEffect(() => {
    if (!isTyping) return;
    
    // Function to type the next character
    const typeNextChar = () => {
      if (charIndexRef.current < fullTextRef.current.length) {
        // Calculate a slightly variable typing speed for realism
        const variance = Math.random() * 1.5 + 2; // Between 0.8 and 1.1 (narrower range)
        const speed = typingSpeed * variance;
        
        // Add special delays for certain punctuation to simulate natural pauses
        let delay = speed;
        const currentChar = fullTextRef.current[charIndexRef.current];
        
        if (['.', '!', '?'].includes(currentChar)) {
          delay = speed * 3; // Shorter pause after sentences (was 6)
        } else if ([',', ';', ':'].includes(currentChar)) {
          delay = speed * 2; // Shorter pause after clauses (was 3)
        }
        
        // Schedule the next character
        timerRef.current = setTimeout(() => {
          charIndexRef.current += 1;
          setVisibleText(fullTextRef.current.substring(0, charIndexRef.current));
          
          // Continue typing if there are more characters
          if (charIndexRef.current < fullTextRef.current.length) {
            typeNextChar();
          } else {
            // Animation complete
            setIsTyping(false);
            onComplete();
          }
        }, delay);
      }
    };
    
    // Start typing after the initial delay
    timerRef.current = setTimeout(() => {
      typeNextChar();
    }, startDelay);
    
    // Clean up timers when component unmounts or animation restarts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTyping, typingSpeed, startDelay, onComplete]);
  
  // Cursor element that blinks while typing and disappears when done
  const cursor = isTyping ? (
    <span className="typing-cursor text-bold text-darkGold animate-blink">|</span>
  ) : null;
  
  return (
    <div className={`typing-message ${className}`}>
      {visibleText}
      {cursor}
    </div>
  );
};

export default TypingMessage;