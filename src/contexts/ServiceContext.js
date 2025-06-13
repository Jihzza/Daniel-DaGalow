// src/contexts/ServiceContext.js
import { createContext, useState, useEffect } from "react";

export const ServiceContext = createContext();

const serviceStateKey = 'pendingServiceState'; // The key we'll use in sessionStorage

export function ServiceProvider({ children }) {
  // On initial load, try to get the state from sessionStorage.
  const [service, setService] = useState(() => {
    try {
      const savedState = sessionStorage.getItem(serviceStateKey);
      return savedState ? JSON.parse(savedState).service : null;
    } catch {
      return null;
    }
  });

  const [tier, setTier] = useState(() => {
    try {
      const savedState = sessionStorage.getItem(serviceStateKey);
      return savedState ? JSON.parse(savedState).tier : null;
    } catch {
      return null;
    }
  });

  // This effect runs whenever 'service' or 'tier' changes.
  useEffect(() => {
    // If a service is selected, we save it. This happens *before* any redirect.
    if (service) {
      const stateToSave = { service, tier };
      sessionStorage.setItem(serviceStateKey, JSON.stringify(stateToSave));
      console.log('[ServiceProvider] Saved context state to sessionStorage:', stateToSave);
    } else {
      // If the service is cleared (e.g., user navigates back), we clear the storage.
      sessionStorage.removeItem(serviceStateKey);
    }
  }, [service, tier]);

  const setServiceWithTier = (newService, newTier = null) => {
    setService(newService);
    setTier(newTier);
  };

  const value = { 
    service, 
    setService, 
    tier, 
    setTier,
    setServiceWithTier
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}