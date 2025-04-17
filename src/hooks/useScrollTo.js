import { useCallback } from 'react';

const useScrollTo = () => {
  const scrollTo = useCallback((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  return scrollTo;
};

export default useScrollTo; 