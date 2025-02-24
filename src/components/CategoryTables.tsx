import React from 'react';
import { Entry } from '../types/entryTypes';
import { formatCurrency } from '../utils/currency';
import { useBudget } from '../contexts/BudgetContext';

interface CategoryTablesProps {
  entries: Entry[];
  entryType: 'INCOME' | 'EXPENSE' | 'SAVING';
  handleEdit: (entry: Entry, type: 'INCOME' | 'EXPENSE' | 'SAVING') => void;
  handleDelete: (id: string, type: 'INCOME' | 'EXPENSE' | 'SAVING') => void;
  onAddToCategory: (categoryId: string, categoryName: string) => void;
}

const CategoryTables: React.FC<CategoryTablesProps> = ({
  entries,
  entryType,
  handleEdit,
  handleDelete,
  onAddToCategory,
}) => {
  const { currentCurrencyCode } = useBudget();
  
  // Group entries by category
  const entriesByCategory = entries.reduce((acc, entry) => {
    const categoryId = entry.category._id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        id: categoryId,
        name: entry.category.name,
        entries: [],
        total: 0,
      };
    }
    acc[categoryId].entries.push(entry);
    acc[categoryId].total += Number(entry.amount);
    return acc;
  }, {} as Record<string, { id: string; name: string; entries: Entry[]; total: number }>);

  return (
    <div className="space-y-6">
      {Object.values(entriesByCategory).map((category) => (
        <div key={category.id} className="bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {formatCurrency(category.total, currentCurrencyCode)}
              </span>
              <button
                onClick={() => onAddToCategory(category.id, category.name)}
                className="text-blue-600 hover:text-blue-800"
                title="Add to this category"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {category.entries.map((entry) => (
              <div key={entry._id} className="px-4 py-3 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-900">{entry.name}</span>
                  {entry.dueDayOfMonth && (
                    <span className="text-xs text-gray-500">
                      Due: Day {entry.dueDayOfMonth}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {formatCurrency(Number(entry.amount), currentCurrencyCode)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(entry, entryType)}
                      className="text-gray-400 hover:text-blue-500"
                      title="Edit entry"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id, entryType)}
                      className="text-gray-400 hover:text-red-500"
                      title="Delete entry"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryTables;
