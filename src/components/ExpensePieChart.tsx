import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ExpenseDistribution } from '../types/entryTypes';
import { formatCurrency } from '../utils/currency';
import { useBudget } from '../contexts/BudgetContext';

interface ExpensePieChartProps {
  expenseDistribution: ExpenseDistribution[];
}

// More neutral and user-friendly color palette
const COLORS = [
  '#4E79A7', // Soft Blue
  '#F28E2B', // Soft Orange
  '#76B7B2', // Teal
  '#59A14F', // Soft Green
  '#EDC948', // Soft Yellow
  '#B07AA1', // Lavender
  '#FF9DA7', // Soft Pink
  '#9C755F', // Soft Brown
  '#BAB0AC', // Soft Gray
  '#808080'  // Medium Gray
];

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenseDistribution }) => {
  const { currentCurrencyCode } = useBudget();
  
  // Ensure we have valid data and transform it for recharts
  const chartData = React.useMemo(() => {
    if (!expenseDistribution || !Array.isArray(expenseDistribution) || expenseDistribution.length === 0) {
      return [];
    }
    
    return expenseDistribution.map(item => {
      // Ensure we have valid numeric values
      const amount = typeof item.amount === 'number' ? item.amount : 0;
      const percentage = typeof item.percentage === 'number' ? item.percentage : 0;
      
      return {
        name: item.tag || 'Unknown',
        value: amount,
        percentage: percentage
      };
    }).filter(item => item.value > 0); // Only include items with positive values
  }, [expenseDistribution]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg text-xs">
          <div className="flex items-center mb-1">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: payload[0].color }}
            ></div>
            <p className="font-semibold text-gray-800">{data.name}</p>
          </div>
          <p className="text-gray-700 ml-5">{formatCurrency(data.value, currentCurrencyCode)}</p>
          <p className="text-gray-600 font-medium ml-5">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if percentage is significant enough (> 5%)
    if (percent < 0.05) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Return empty container if no data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">No expense data available</p>
      </div>
    );
  }

  try {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={70}
            innerRadius={30}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            paddingAngle={3}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ fontSize: '10px', marginTop: '10px' }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  } catch (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">Error displaying chart</p>
      </div>
    );
  }
};

export default ExpensePieChart; 