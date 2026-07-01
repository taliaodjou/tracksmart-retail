import React, { createContext, useContext, useState } from 'react';

const SupportModeContext = createContext(null);
const STORAGE_KEY = 'tracksmart_support_client';

export function SupportModeProvider({ children }) {
  const [supportClient, setSupportClient] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  }); // { id, email, shop_name, ... }

  const enterSupportMode = (client) => {
    setSupportClient(client);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(client));
  };
  const exitSupportMode = () => {
    setSupportClient(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SupportModeContext.Provider value={{ supportClient, enterSupportMode, exitSupportMode }}>
      {children}
    </SupportModeContext.Provider>
  );
}

export function useSupportMode() {
  return useContext(SupportModeContext);
}