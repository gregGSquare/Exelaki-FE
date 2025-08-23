import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

export interface PreferencesValue {
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
}

const PreferencesContext = createContext<PreferencesValue | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storageKey = "pref-currency";
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKey) || "EUR";
    } catch {
      return "EUR";
    }
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, currencyCode); } catch {}
  }, [currencyCode]);

  const value = useMemo<PreferencesValue>(() => ({ currencyCode, setCurrencyCode }), [currencyCode]);

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesValue => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
};


