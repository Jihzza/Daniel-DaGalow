import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
    const { pathname } = useLocation();
  
    useEffect(() => {
      // Force scroll to top with a slight delay
      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'auto' // Use 'auto' instead of 'smooth'
        });
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }, [pathname]);
  
    return null;
  }

export default ScrollToTop;