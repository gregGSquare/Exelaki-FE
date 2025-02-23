import React from 'react';

interface Props {
  indicators: {
    totalScore: { value: string; status: string };
    debtToIncomeRatio: { value: string; status: string };
    savingsRate: { value: string; status: string };
    carCostRatio: { value: string; status: string };
    homeCostRatio: { value: string; status: string };
  };
}

const IndicatorCard: React.FC<{
  label: string;
  value: string;
  threshold: string;
  status: string;
}> = ({ label, value, threshold, status }) => {
  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'bg-emerald-50';
      case 'GOOD': return 'bg-green-50';
      case 'ACCEPTABLE':
      case 'OK': return 'bg-yellow-50';
      case 'NEEDS_IMPROVEMENT':
      case 'BAD': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'text-emerald-700';
      case 'GOOD': return 'text-green-700';
      case 'ACCEPTABLE':
      case 'OK': return 'text-yellow-700';
      case 'NEEDS_IMPROVEMENT':
      case 'BAD': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className={`rounded-lg p-3 ${getStatusBackground(status)}`}>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className={`text-lg font-semibold ${getStatusTextColor(status)}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500">Threshold: {threshold}</div>
    </div>
  );
};

const FinancialIndicatorCards: React.FC<Props> = ({ indicators }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <IndicatorCard
        label="Debt to Income"
        value={indicators.debtToIncomeRatio.value}
        threshold="30%"
        status={indicators.debtToIncomeRatio.status}
      />
      <IndicatorCard
        label="Car Cost Ratio"
        value={indicators.carCostRatio.value}
        threshold="10%"
        status={indicators.carCostRatio.status}
      />
      <IndicatorCard
        label="Home Cost Ratio"
        value={indicators.homeCostRatio.value}
        threshold="28%"
        status={indicators.homeCostRatio.status}
      />
      <IndicatorCard
        label="Savings Rate"
        value={indicators.savingsRate.value}
        threshold="20%"
        status={indicators.savingsRate.status}
      />
    </div>
  );
};

export default FinancialIndicatorCards; 