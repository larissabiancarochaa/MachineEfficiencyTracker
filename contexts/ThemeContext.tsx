import React, { createContext, useState, useContext, ReactNode } from 'react';
import { lightTheme, darkTheme } from '../constants/colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = (theme: Theme) => {
    setTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Atualize a função Colors para usar o contexto
export const useColors = () => {
  const { theme } = useTheme();
  return theme === 'light' ? lightTheme : darkTheme;
};