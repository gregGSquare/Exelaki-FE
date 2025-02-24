import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ExpenseDistribution } from '../types/entryTypes';
import { formatCurrency } from '../utils/currency';
import { useBudget } from '../contexts/BudgetContext';

interface ExpensePieChartProps {
  expenseDistribution: ExpenseDistribution[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#6B66FF'];

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenseDistribution }) => {
  const { currentCurrencyCode } = useBudget();
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded text-xs">
          <p className="font-medium">{data.name}</p>
          <p>{formatCurrency(data.value, currentCurrencyCode)} ({data.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={expenseDistribution}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {expenseDistribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpensePieChart; 