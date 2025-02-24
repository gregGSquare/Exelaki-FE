import React from 'react';
import { formatCurrency } from '../utils/currency';
import { useBudget } from '../contexts/BudgetContext';
import { ExpenseDistribution } from '../types/entryTypes';

interface FinancialIndicator {
  value: string;
  status: string;
}

interface FinancialIndicatorsProps {
  indicators: {
    totalScore?: FinancialIndicator;
    debtToIncomeRatio: FinancialIndicator;
    savingsRate: FinancialIndicator;
    carCostRatio: FinancialIndicator;
    homeCostRatio: FinancialIndicator;
    expenseDistribution?: ExpenseDistribution[];
  };
}

const FinancialIndicatorCards: React.FC<FinancialIndicatorsProps> = ({ indicators }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD':
        return 'bg-green-100 text-green-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DANGER':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Debt-to-Income</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium">{indicators.debtToIncomeRatio.value}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(indicators.debtToIncomeRatio.status)}`}>
              {indicators.debtToIncomeRatio.status}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Savings Rate</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium">{indicators.savingsRate.value}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(indicators.savingsRate.status)}`}>
              {indicators.savingsRate.status}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Car Cost Ratio</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium">{indicators.carCostRatio.value}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(indicators.carCostRatio.status)}`}>
              {indicators.carCostRatio.status}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Home Cost Ratio</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium">{indicators.homeCostRatio.value}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(indicators.homeCostRatio.status)}`}>
              {indicators.homeCostRatio.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialIndicatorCards; 