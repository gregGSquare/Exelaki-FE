import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { ExpenseDistribution } from '../types/entryTypes';
import { formatCurrency } from '../utils/currency';
import { useBudget } from '../contexts/BudgetContext';

interface ExpensePieChartProps {
  expenseDistribution: ExpenseDistribution[];
}

// Modern color palette with better contrast and accessibility
const COLORS = [
  '#6366F1', // Primary
  '#14B8A6', // Secondary
  '#F97316', // Accent
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#6B7280'  // Gray
];

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenseDistribution }) => {
  const { currentCurrencyCode } = useBudget();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  
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
        <div className="bg-white/90 backdrop-blur-sm p-3 border border-neutral-200 shadow-card rounded-lg text-xs">
          <div className="flex items-center mb-1">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: payload[0].color }}
            ></div>
            <p className="font-semibold text-neutral-800">{data.name}</p>
          </div>
          <p className="text-neutral-700 ml-5 font-medium">{formatCurrency(data.value, currentCurrencyCode)}</p>
          <p className="text-neutral-600 ml-5">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };
  
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="filter drop-shadow-md"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
          opacity={0.3}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12} fontWeight={500}>
          {`${payload.name} (${(percent * 100).toFixed(0)}%)`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#666" fontSize={11}>
          {formatCurrency(value, currentCurrencyCode)}
        </text>
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Return empty container if no data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-neutral-500 bg-neutral-50 px-6 py-4 rounded-xl shadow-sm border border-neutral-100">
          <svg className="w-6 h-6 text-neutral-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p>No expense data available</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="relative h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white rounded-xl"></div>
        <div className="relative h-full p-4">
          <h3 className="text-sm font-medium text-neutral-700 mb-2">Expense Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={activeIndex !== undefined ? 60 : 50}
                outerRadius={activeIndex !== undefined ? 80 : 70}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                paddingAngle={4}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                className="filter drop-shadow-sm"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="#fff"
                    strokeWidth={2}
                    className="transition-all duration-300"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {activeIndex === undefined && (
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '10px', marginTop: '10px' }}
                  iconType="circle"
                  iconSize={8}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-red-500 bg-red-50 px-6 py-4 rounded-xl shadow-sm border border-red-100">
          <svg className="w-6 h-6 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>Error displaying chart</p>
        </div>
      </div>
    );
  }
};

export default ExpensePieChart; 