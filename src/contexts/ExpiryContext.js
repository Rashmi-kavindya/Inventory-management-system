// src/contexts/ExpiryContext.js
import React, { createContext, useContext, useState } from 'react';

const ExpiryContext = createContext();

export function useExpiry() {
  return useContext(ExpiryContext);
}

export function ExpiryProvider({ children }) {
  const [expiryDays, setExpiryDays] = useState(30);

  return (
    <ExpiryContext.Provider value={{ expiryDays, setExpiryDays }}>
      {children}
    </ExpiryContext.Provider>
  );
}