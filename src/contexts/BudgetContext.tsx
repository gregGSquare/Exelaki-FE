import React, { createContext, useContext, useState } from 'react';

interface BudgetContextProps {
  currentBudgetId: string | null;
  currentCurrencyCode: string;
  setCurrentBudgetId: (id: string) => void;
  setCurrentCurrencyCode: (code: string) => void;
  clearBudget: () => void;
}

const BudgetContext = createContext<BudgetContextProps | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);
  const [currentCurrencyCode, setCurrentCurrencyCode] = useState<string>("USD");

  const setBudget = (id: string) => {
    setCurrentBudgetId(id);
  };

  const setCurrency = (code: string) => {
    setCurrentCurrencyCode(code);
  };

  const clearBudget = () => {
    setCurrentBudgetId(null);
    setCurrentCurrencyCode("USD");
  };

  return (
    <BudgetContext.Provider 
      value={{ 
        currentBudgetId, 
        currentCurrencyCode,
        setCurrentBudgetId: setBudget, 
        setCurrentCurrencyCode: setCurrency,
        clearBudget 
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = (): BudgetContextProps => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};