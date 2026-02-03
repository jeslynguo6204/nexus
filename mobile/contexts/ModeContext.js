// mobile/contexts/ModeContext.js
// Shared mode (romantic | platonic) across Home, Likes, and Matches/Chat so toggling on one screen persists on others.

import React, { createContext, useContext, useState } from 'react';

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useState('romantic');
  const [hasSetInitialMode, setHasSetInitialMode] = useState(false);

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,
        hasSetInitialMode,
        setHasSetInitialMode,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return ctx;
}
