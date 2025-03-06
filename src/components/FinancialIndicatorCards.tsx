import React from 'react';
import { formatCurrency } from '../utils/currency';
import { useBudget } from '../contexts/BudgetContext';
import { ExpenseDistribution } from '../types/entryTypes';

interface FinancialIndicator {
  value: string;
  status: string;
  amount?: string;
}

interface FinancialIndicatorsProps {
  indicators: {
    totalScore?: FinancialIndicator;
    debtToIncomeRatio: FinancialIndicator;
    savingsRate: FinancialIndicator;
    carCostRatio: FinancialIndicator;
    homeCostRatio: FinancialIndicator;
    fixedExpenses?: FinancialIndicator;
    expenseDistribution?: ExpenseDistribution[];
  };
}

// Thresholds for each indicator
const thresholds = {
  fixedExpenses: [
    { value: 30, status: 'GOOD', color: 'bg-green-500' },
    { value: 50, status: 'MODERATE', color: 'bg-yellow-500' },
    { value: 70, status: 'HIGH', color: 'bg-orange-500' },
    { value: 100, status: 'CRITICAL', color: 'bg-red-500' }
  ],
  debtToIncomeRatio: [
    { value: 28, status: 'GOOD', color: 'bg-green-500' },
    { value: 30, status: 'ACCEPTABLE', color: 'bg-yellow-500' },
    { value: 100, status: 'BAD', color: 'bg-red-500' }
  ],
  savingsRate: [
    { value: 10, status: 'NEEDS_IMPROVEMENT', color: 'bg-red-500' },
    { value: 15, status: 'ACCEPTABLE', color: 'bg-yellow-500' },
    { value: 20, status: 'GOOD', color: 'bg-green-500' },
    { value: 100, status: 'EXCELLENT', color: 'bg-emerald-500' }
  ],
  homeCostRatio: [
    { value: 22, status: 'GOOD', color: 'bg-green-500' },
    { value: 28, status: 'OK', color: 'bg-yellow-500' },
    { value: 100, status: 'BAD', color: 'bg-red-500' }
  ],
  carCostRatio: [
    { value: 8, status: 'GOOD', color: 'bg-green-500' },
    { value: 28, status: 'OK', color: 'bg-yellow-500' },
    { value: 100, status: 'BAD', color: 'bg-red-500' }
  ]
};

interface ThresholdBarProps {
  type: 'fixedExpenses' | 'debtToIncomeRatio' | 'savingsRate' | 'homeCostRatio' | 'carCostRatio';
  value: string;
  status: string;
}

const ThresholdBar: React.FC<ThresholdBarProps> = ({ type, value, status }) => {
  // Parse the value (remove % if present)
  const numericValue = parseFloat(value.replace('%', ''));
  
  // Get the appropriate thresholds
  const indicatorThresholds = thresholds[type];
  
  // Special case for savings rate (higher is better)
  const isReversed = type === 'savingsRate';
  
  // Calculate the position of the current value
  const maxValue = isReversed ? 25 : 100; // Cap at 25% for savings rate for better visualization
  const position = Math.min((numericValue / maxValue) * 100, 100);
  
  return (
    <div className="mt-1.5 h-2 w-full bg-neutral-100 rounded-full overflow-hidden relative">
      {/* Threshold segments */}
      <div className="absolute inset-0 flex w-full h-full">
        {indicatorThresholds.map((threshold, index) => {
          const prevThreshold = index > 0 ? indicatorThresholds[index - 1].value : 0;
          const width = ((threshold.value - prevThreshold) / maxValue) * 100;
          
          return (
            <div 
              key={threshold.status}
              className={`h-full ${threshold.color} ${isReversed ? 'opacity-30' : ''}`}
              style={{ 
                width: `${Math.min(width, 100)}%`,
                opacity: isReversed ? (index === indicatorThresholds.length - 1 ? 1 : 0.3) : (index === 0 ? 1 : 0.3)
              }}
            />
          );
        })}
      </div>
      
      {/* Current value marker */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-md rounded-full transform -translate-x-1/2 z-10"
        style={{ left: `${position}%` }}
      />
      
      {/* For savings rate, we need to show a filled bar up to the current value */}
      {isReversed && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500"
          style={{ width: `${position}%` }}
        />
      )}
    </div>
  );
};

const FinancialIndicatorCards: React.FC<FinancialIndicatorsProps> = ({ indicators }) => {
  const { currentCurrencyCode } = useBudget();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD':
      case 'EXCELLENT':
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
      case 'OK':
      case 'ACCEPTABLE':
      case 'MODERATE':
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
      case 'BAD':
      case 'NEEDS_IMPROVEMENT':
      case 'CRITICAL':
      case 'HIGH':
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

  const formatAmount = (amount: string | undefined) => {
    if (!amount) return '';
    return formatCurrency(parseFloat(amount), currentCurrencyCode);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-3 md:p-4 transition-all hover:shadow-card hover:translate-y-[-2px]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs font-medium text-neutral-500">Debt-to-Income</span>
            <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full ${getStatusColor(indicators.debtToIncomeRatio.status).bg} ${getStatusColor(indicators.debtToIncomeRatio.status).text}`}>
              {getStatusColor(indicators.debtToIncomeRatio.status).icon}
              <span className="text-xs font-medium hidden sm:inline">{indicators.debtToIncomeRatio.status}</span>
            </div>
          </div>
          <span className="text-base md:text-lg font-semibold text-neutral-800">{indicators.debtToIncomeRatio.value}</span>
          {indicators.debtToIncomeRatio.amount && (
            <span className="text-xs text-neutral-500 mt-0.5">{formatAmount(indicators.debtToIncomeRatio.amount)}</span>
          )}
          <ThresholdBar 
            type="debtToIncomeRatio" 
            value={indicators.debtToIncomeRatio.value} 
            status={indicators.debtToIncomeRatio.status} 
          />
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-3 md:p-4 transition-all hover:shadow-card hover:translate-y-[-2px]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs font-medium text-neutral-500">Savings Rate</span>
            <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full ${getStatusColor(indicators.savingsRate.status).bg} ${getStatusColor(indicators.savingsRate.status).text}`}>
              {getStatusColor(indicators.savingsRate.status).icon}
              <span className="text-xs font-medium hidden sm:inline">{indicators.savingsRate.status}</span>
            </div>
          </div>
          <span className="text-base md:text-lg font-semibold text-neutral-800">{indicators.savingsRate.value}</span>
          {indicators.savingsRate.amount && (
            <span className="text-xs text-neutral-500 mt-0.5">{formatAmount(indicators.savingsRate.amount)}</span>
          )}
          <ThresholdBar 
            type="savingsRate" 
            value={indicators.savingsRate.value} 
            status={indicators.savingsRate.status} 
          />
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-3 md:p-4 transition-all hover:shadow-card hover:translate-y-[-2px]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs font-medium text-neutral-500">Car Cost Ratio</span>
            <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full ${getStatusColor(indicators.carCostRatio.status).bg} ${getStatusColor(indicators.carCostRatio.status).text}`}>
              {getStatusColor(indicators.carCostRatio.status).icon}
              <span className="text-xs font-medium hidden sm:inline">{indicators.carCostRatio.status}</span>
            </div>
          </div>
          <span className="text-base md:text-lg font-semibold text-neutral-800">{indicators.carCostRatio.value}</span>
          {indicators.carCostRatio.amount && (
            <span className="text-xs text-neutral-500 mt-0.5">{formatAmount(indicators.carCostRatio.amount)}</span>
          )}
          <ThresholdBar 
            type="carCostRatio" 
            value={indicators.carCostRatio.value} 
            status={indicators.carCostRatio.status} 
          />
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-3 md:p-4 transition-all hover:shadow-card hover:translate-y-[-2px]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs font-medium text-neutral-500">Home Cost Ratio</span>
            <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full ${getStatusColor(indicators.homeCostRatio.status).bg} ${getStatusColor(indicators.homeCostRatio.status).text}`}>
              {getStatusColor(indicators.homeCostRatio.status).icon}
              <span className="text-xs font-medium hidden sm:inline">{indicators.homeCostRatio.status}</span>
            </div>
          </div>
          <span className="text-base md:text-lg font-semibold text-neutral-800">{indicators.homeCostRatio.value}</span>
          {indicators.homeCostRatio.amount && (
            <span className="text-xs text-neutral-500 mt-0.5">{formatAmount(indicators.homeCostRatio.amount)}</span>
          )}
          <ThresholdBar 
            type="homeCostRatio" 
            value={indicators.homeCostRatio.value} 
            status={indicators.homeCostRatio.status} 
          />
        </div>
      </div>

      {/* Fixed Expenses Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-3 md:p-4 transition-all hover:shadow-card hover:translate-y-[-2px]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs font-medium text-neutral-500">Fixed Expenses</span>
            <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full ${getStatusColor(indicators.fixedExpenses?.status || 'GOOD').bg} ${getStatusColor(indicators.fixedExpenses?.status || 'GOOD').text}`}>
              {getStatusColor(indicators.fixedExpenses?.status || 'GOOD').icon}
              <span className="text-xs font-medium hidden sm:inline">{indicators.fixedExpenses?.status || 'N/A'}</span>
            </div>
          </div>
          <span className="text-base md:text-lg font-semibold text-neutral-800">{indicators.fixedExpenses?.value || 'N/A'}</span>
          {indicators.fixedExpenses?.amount && (
            <span className="text-xs text-neutral-500 mt-0.5">{formatAmount(indicators.fixedExpenses.amount)}</span>
          )}
          {indicators.fixedExpenses && (
            <ThresholdBar 
              type="fixedExpenses" 
              value={indicators.fixedExpenses.value} 
              status={indicators.fixedExpenses.status} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialIndicatorCards; 