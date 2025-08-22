import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = 'light' | 'dark';

interface ThemeValue {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storageKey = 'theme-preference';
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(storageKey) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem(storageKey, theme);
  }, [theme]);

  const value = useMemo<ThemeValue>(() => ({
    theme,
    toggle: () => setTheme(t => (t === 'light' ? 'dark' : 'light')),
    set: (t: Theme) => setTheme(t),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};


