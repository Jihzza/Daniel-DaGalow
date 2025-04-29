// src/contexts/ServiceContext.js
import { createContext, useState } from "react";

export const ServiceContext = createContext();

export function ServiceProvider({ children }) {
  const [service, setService] = useState(null);  // "booking" | "coaching" | ...
  const [tier, setTier] = useState(null);  // "Weekly" | "Daily" | "Priority"
  
  // Enhanced function to set both service and tier
  const setServiceWithTier = (service, tier = null) => {
    setService(service);
    setTier(tier);
  };

  return (
    <ServiceContext.Provider value={{ 
      service, 
      setService, 
      tier, 
      setTier,
      setServiceWithTier
    }}>
      {children}
    </ServiceContext.Provider>
  );
}