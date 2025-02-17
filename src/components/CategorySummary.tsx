import React from 'react';
import { Entry } from '../types/entryTypes';

interface CategorySummaryProps {
  entries: Entry[];
  type: 'INCOME' | 'EXPENSE' | 'SAVING';
}

const CategorySummary: React.FC<CategorySummaryProps> = ({ entries, type }) => {
  // Group entries by category and calculate totals
  const categorySums = entries.reduce((acc, entry) => {
    const categoryName = entry.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += Number(entry.amount);
    return acc;
  }, {} as { [key: string]: number });

  const totalAmount = Object.values(categorySums).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">
        {type === 'INCOME' ? 'Income' : type === 'EXPENSE' ? 'Expense' : 'Saving'} Summary
      </h2>
      <div className="space-y-3">
        {Object.entries(categorySums).map(([category, amount]) => (
          <div key={category} className="flex justify-between items-center">
            <span className="text-gray-700">{category}</span>
            <div className="flex items-center">
              <span className={`font-medium ${
                type === 'INCOME' ? 'text-green-600' : 'text-red-600'
              }`}>
                ${amount.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm ml-2">
                ({((amount / totalAmount) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center font-semibold">
            <span>Total</span>
            <span className={type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
              ${totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySummary; 