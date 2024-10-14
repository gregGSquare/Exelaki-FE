import React, { createContext, useContext, useState } from 'react';

interface BudgetContextProps {
  currentBudgetId: string | null;
  setCurrentBudgetId: (id: string) => void;
  clearBudget: () => void;
}

const BudgetContext = createContext<BudgetContextProps | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);

  const setBudget = (id: string) => {
    setCurrentBudgetId(id);
  };

  const clearBudget = () => {
    setCurrentBudgetId(null);
  };

  return (
    <BudgetContext.Provider value={{ currentBudgetId, setCurrentBudgetId: setBudget, clearBudget }}>
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