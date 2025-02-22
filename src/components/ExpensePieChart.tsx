import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ExpenseDistribution } from '../types/entryTypes';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpensePieChartProps {
  expenseDistribution: ExpenseDistribution[];
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenseDistribution }) => {
  // Sort expenses by percentage in descending order
  const sortedExpenses = [...expenseDistribution].sort((a, b) => b.percentage - a.percentage);

  const data = {
    labels: sortedExpenses.map(item => item.tag.toLowerCase()),
    datasets: [
      {
        data: sortedExpenses.map(item => item.percentage),
        backgroundColor: [
          '#8AB4F8',  // Light blue
          '#C58AF9',  // Purple
          '#34A853',  // Green
          '#FBBC04',  // Yellow
          '#EA4335',  // Red
          '#4285F4',  // Blue
          '#46BDC6',  // Teal
          '#F94892',  // Pink
          '#FF9F40',  // Orange
          '#B4B4B4'   // Gray
        ],
        borderWidth: 0,
        cutout: '60%'
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const expense = sortedExpenses[context.dataIndex];
            return `${expense.tag.toLowerCase()}: ${expense.percentage.toFixed(1)}% ($${expense.amount})`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    layout: {
      padding: 20
    }
  };

  return (
    <div className="h-full w-full">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ExpensePieChart; 