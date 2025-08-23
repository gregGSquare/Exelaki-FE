import React from "react";
import { usePreferences } from "../../state/PreferencesContext";
import { formatCurrency } from "../../../utils/currency";

const Kpi: React.FC<{ label: string; value: number; positive?: boolean }> = ({ label, value, positive }) => {
  const { currencyCode } = usePreferences();
  return (
  <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3 dark:bg-neutral-800/80 dark:border-neutral-700">
    <div className="text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
    <div className={`mt-1 text-xl font-semibold ${positive === undefined ? 'text-neutral-800 dark:text-neutral-100' : positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(value, currencyCode)}</div>
  </div>
  );
};

const KpiCards: React.FC<{ income: number; expenses: number; savings: number; balance: number }> = ({ income, expenses, savings, balance }) => {
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      <Kpi label="Income" value={income} positive />
      <Kpi label="Expenses" value={expenses} />
      <Kpi label="Savings" value={savings} positive />
      <Kpi label="Balance" value={balance} positive={balance >= 0} />
    </div>
  );
};

export default KpiCards;


