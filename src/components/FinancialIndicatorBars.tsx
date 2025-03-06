import React from 'react';

interface FinancialIndicator {
  value: string;
  status: string;
  amount?: string;
}

interface FinancialIndicators {
  totalScore: FinancialIndicator;
  debtToIncomeRatio: FinancialIndicator;
  savingsRate: FinancialIndicator;
  carCostRatio: FinancialIndicator;
  homeCostRatio: FinancialIndicator;
  fixedExpenses?: FinancialIndicator;
}

interface Props {
  indicators: FinancialIndicators;
}

const FinancialIndicatorBars: React.FC<Props> = ({ indicators }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'bg-emerald-500';
      case 'GOOD': return 'bg-green-500';
      case 'ACCEPTABLE':
      case 'OK': return 'bg-yellow-500';
      case 'NEEDS_IMPROVEMENT':
      case 'BAD':
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getBarWidth = (name: string, value: number): number => {
    switch (name) {
      case 'Total Score':
        return value; // Already 0-100
      case 'Savings Rate':
        return (value / 20) * 100; // Max target is 20%
      case 'Debt to Income':
        return 100 - ((value / 40) * 100); // Inverse, max considered 40%
      case 'Car Cost Ratio':
        return 100 - ((value / 35) * 100); // Inverse, max considered 35%
      case 'Home Cost Ratio':
        return 100 - ((value / 35) * 100); // Inverse, max considered 35%
      case 'Fixed Expenses':
        return 100 - ((value / 50) * 100); // Inverse, max considered 50%
      default:
        return value;
    }
  };

  const indicators_array = [
    { name: 'Total Score', ...indicators.totalScore },
    { name: 'Debt to Income', ...indicators.debtToIncomeRatio },
    { name: 'Savings Rate', ...indicators.savingsRate },
    { name: 'Car Cost Ratio', ...indicators.carCostRatio },
    { name: 'Home Cost Ratio', ...indicators.homeCostRatio },
  ];

  // Add fixedExpenses to the array if it exists
  if (indicators.fixedExpenses) {
    indicators_array.push({ name: 'Fixed Expenses', ...indicators.fixedExpenses });
  }

  return (
    <div className="space-y-4">
      {indicators_array.map((indicator) => {
        const value = parseFloat(indicator.value.replace('%', '')) || 0;
        const barWidth = getBarWidth(indicator.name, value);
        
        return (
          <div key={indicator.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{indicator.name}</span>
              <span className="font-medium">{indicator.value}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusColor(indicator.status)} transition-all duration-500`}
                style={{ width: `${Math.min(Math.max(barWidth, 0), 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FinancialIndicatorBars; 