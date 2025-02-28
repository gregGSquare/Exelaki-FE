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
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          )
        };
      case 'WARNING':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: (
            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          )
        };
      case 'DANGER':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: (
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )
        };
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-4 transition-all hover:shadow-card hover:translate-y-[-2px]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500">Debt-to-Income</span>
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${getStatusColor(indicators.debtToIncomeRatio.status).bg} ${getStatusColor(indicators.debtToIncomeRatio.status).text}`}>
              {getStatusColor(indicators.debtToIncomeRatio.status).icon}
              <span className="text-xs font-medium">{indicators.debtToIncomeRatio.status}</span>
            </div>
          </div>
          <span className="text-lg font-semibold text-neutral-800">{indicators.debtToIncomeRatio.value}</span>
          <div className="mt-2 h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                indicators.debtToIncomeRatio.status === 'GOOD' 
                  ? 'bg-gradient-to-r from-green-400 to-green-500' 
                  : indicators.debtToIncomeRatio.status === 'WARNING'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ 
                width: indicators.debtToIncomeRatio.status === 'GOOD' 
                  ? '75%' 
                  : indicators.debtToIncomeRatio.status === 'WARNING'
                    ? '50%'
                    : '25%' 
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-4 transition-all hover:shadow-card hover:translate-y-[-2px]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500">Savings Rate</span>
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${getStatusColor(indicators.savingsRate.status).bg} ${getStatusColor(indicators.savingsRate.status).text}`}>
              {getStatusColor(indicators.savingsRate.status).icon}
              <span className="text-xs font-medium">{indicators.savingsRate.status}</span>
            </div>
          </div>
          <span className="text-lg font-semibold text-neutral-800">{indicators.savingsRate.value}</span>
          <div className="mt-2 h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                indicators.savingsRate.status === 'GOOD' 
                  ? 'bg-gradient-to-r from-green-400 to-green-500' 
                  : indicators.savingsRate.status === 'WARNING'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ 
                width: indicators.savingsRate.status === 'GOOD' 
                  ? '75%' 
                  : indicators.savingsRate.status === 'WARNING'
                    ? '50%'
                    : '25%' 
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-4 transition-all hover:shadow-card hover:translate-y-[-2px]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500">Car Cost Ratio</span>
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${getStatusColor(indicators.carCostRatio.status).bg} ${getStatusColor(indicators.carCostRatio.status).text}`}>
              {getStatusColor(indicators.carCostRatio.status).icon}
              <span className="text-xs font-medium">{indicators.carCostRatio.status}</span>
            </div>
          </div>
          <span className="text-lg font-semibold text-neutral-800">{indicators.carCostRatio.value}</span>
          <div className="mt-2 h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                indicators.carCostRatio.status === 'GOOD' 
                  ? 'bg-gradient-to-r from-green-400 to-green-500' 
                  : indicators.carCostRatio.status === 'WARNING'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ 
                width: indicators.carCostRatio.status === 'GOOD' 
                  ? '75%' 
                  : indicators.carCostRatio.status === 'WARNING'
                    ? '50%'
                    : '25%' 
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-4 transition-all hover:shadow-card hover:translate-y-[-2px]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500">Home Cost Ratio</span>
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${getStatusColor(indicators.homeCostRatio.status).bg} ${getStatusColor(indicators.homeCostRatio.status).text}`}>
              {getStatusColor(indicators.homeCostRatio.status).icon}
              <span className="text-xs font-medium">{indicators.homeCostRatio.status}</span>
            </div>
          </div>
          <span className="text-lg font-semibold text-neutral-800">{indicators.homeCostRatio.value}</span>
          <div className="mt-2 h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                indicators.homeCostRatio.status === 'GOOD' 
                  ? 'bg-gradient-to-r from-green-400 to-green-500' 
                  : indicators.homeCostRatio.status === 'WARNING'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ 
                width: indicators.homeCostRatio.status === 'GOOD' 
                  ? '75%' 
                  : indicators.homeCostRatio.status === 'WARNING'
                    ? '50%'
                    : '25%' 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialIndicatorCards; 