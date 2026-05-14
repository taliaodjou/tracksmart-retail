import React, { createContext, useContext, useState } from 'react';

const SupportModeContext = createContext(null);

export function SupportModeProvider({ children }) {
  const [supportClient, setSupportClient] = useState(null); // { id, email, shop_name, ... }

  const enterSupportMode = (client) => setSupportClient(client);
  const exitSupportMode = () => setSupportClient(null);

  return (
    <SupportModeContext.Provider value={{ supportClient, enterSupportMode, exitSupportMode }}>
      {children}
    </SupportModeContext.Provider>
  );
}

export function useSupportMode() {
  return useContext(SupportModeContext);
}