import React, { createContext, useContext, useMemo } from 'react';
import { lightColors, ThemeColors } from './colors';

export type ThemeMode = 'light';

export interface ThemeContextValue {
  themeMode: 'light';
  isDark: false;
  colors: ThemeColors;
  setThemeMode: (mode: any) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'light',
  isDark: false,
  colors: lightColors,
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode: 'light',
      isDark: false,
      colors: lightColors,
      setThemeMode: () => {},
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      themeMode: 'light',
      isDark: false,
      colors: lightColors,
      setThemeMode: () => {},
    };
  }
  return context;
};
