// src/contexts/ServiceContext.js
import { createContext, useState } from "react";

export const ServiceContext = createContext();   // no default needed

export function ServiceProvider({ children }) {
  const [service, setService] = useState(null);  // "booking" | "coaching" | …
  return (
    <ServiceContext.Provider value={{ service, setService }}>
      {children}
    </ServiceContext.Provider>
  );
}
