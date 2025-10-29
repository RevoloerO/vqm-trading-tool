import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('vqm_theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    localStorage.setItem('vqm_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prevTheme => {
      // Cycle: light (bull) → consolidation → dark (bear) → light
      if (prevTheme === 'light') return 'consolidation';
      if (prevTheme === 'consolidation') return 'dark';
      return 'light';
    });
  };

  const setSpecificTheme = (newTheme) => {
    if (['light', 'dark', 'consolidation'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    cycleTheme,
    setTheme: setSpecificTheme,
    isDark: theme === 'dark',
    isBull: theme === 'light',
    isBear: theme === 'dark',
    isConsolidation: theme === 'consolidation'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
