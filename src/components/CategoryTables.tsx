import React, { useState } from 'react';
import { Entry } from '../types/entryTypes';
import { formatCurrency } from '../utils/currency';
import { useBudget } from '../contexts/BudgetContext';
import { Category } from '../types/categoryTypes';

// Define the default categories
const DEFAULT_CATEGORIES = [
  "Rent",
  "Groceries",
  "Insurances",
  "Subscriptions",
  "Car",
  "Utilities",
  "Loans and Credit card debt"
];

interface CategoryTablesProps {
  entries: Entry[];
  entryType: 'INCOME' | 'EXPENSE' | 'SAVING';
  handleEdit: (entry: Entry, type: 'INCOME' | 'EXPENSE' | 'SAVING') => void;
  handleDelete: (id: string, type: 'INCOME' | 'EXPENSE' | 'SAVING') => void;
  onAddToCategory: (categoryId: string, categoryName: string, type: 'INCOME' | 'EXPENSE' | 'SAVING') => void;
  categories: Category[];
}

const CategoryTables: React.FC<CategoryTablesProps> = ({
  entries,
  entryType,
  handleEdit,
  handleDelete,
  onAddToCategory,
  categories,
}) => {
  const { currentCurrencyCode } = useBudget();
  const [removedCategories, setRemovedCategories] = useState<string[]>([]);
  
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

  // Filter categories to only include default ones and create a map
  const uniqueCategories = new Map<string, Category>();
  categories
    .filter(category => {
      // Always include default categories
      if (category.defaultCategory) return true;
      // For non-default categories, only show if they have entries
      return entriesByCategory[category._id] !== undefined;
    })
    .forEach(category => {
      // Only add the category if we haven't seen this name before
      if (!uniqueCategories.has(category.name)) {
        uniqueCategories.set(category.name, category);
      }
    });

  const allCategories = Array.from(uniqueCategories.values())
    .reduce<Record<string, { id: string; name: string; entries: Entry[]; total: number; isDefault: boolean }>>((acc, category) => {
      if (!entriesByCategory[category._id]) {
        acc[category._id] = {
          id: category._id,
          name: category.name,
          entries: [],
          total: 0,
          isDefault: category.defaultCategory || false,
        };
      } else {
        acc[category._id] = {
          ...entriesByCategory[category._id],
          isDefault: category.defaultCategory || false,
        };
      }
      return acc;
    }, {});

  // Sort categories to match the default order
  const sortedCategories = Object.values(allCategories).sort((a, b) => {
    return DEFAULT_CATEGORIES.indexOf(a.name) - DEFAULT_CATEGORIES.indexOf(b.name);
  });

  // Handle removing a category
  const handleRemoveCategory = async (categoryId: string, entries: Entry[]) => {
    if (entries.length > 0) {
      const confirmRemove = window.confirm(
        `Are you sure you want to remove the category? This will delete all ${entries.length} entries in this category.`
      );
      if (!confirmRemove) return;

      // Delete all entries in the category
      for (const entry of entries) {
        await handleDelete(entry._id, entryType);
      }
    }
    
    // Remove the category from view
    setRemovedCategories(prev => [...prev, categoryId]);
  };

  // Get color scheme based on entry type
  const getColorScheme = () => {
    switch (entryType) {
      case 'INCOME':
        return {
          header: 'bg-primary-50 border-primary-100',
          headerText: 'text-primary-700',
          button: 'text-primary-600 hover:text-primary-800 hover:bg-primary-50',
          total: 'text-primary-700',
          icon: 'text-primary-400',
        };
      case 'EXPENSE':
        return {
          header: 'bg-red-50 border-red-100',
          headerText: 'text-red-700',
          button: 'text-red-600 hover:text-red-800 hover:bg-red-50',
          total: 'text-red-700',
          icon: 'text-red-400',
        };
      case 'SAVING':
        return {
          header: 'bg-secondary-50 border-secondary-100',
          headerText: 'text-secondary-700',
          button: 'text-secondary-600 hover:text-secondary-800 hover:bg-secondary-50',
          total: 'text-secondary-700',
          icon: 'text-secondary-400',
        };
      default:
        return {
          header: 'bg-neutral-50 border-neutral-100',
          headerText: 'text-neutral-700',
          button: 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50',
          total: 'text-neutral-700',
          icon: 'text-neutral-400',
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => (
        <div key={category.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 overflow-hidden transition-all hover:shadow-card">
          <div className={`flex justify-between items-center px-4 py-3 border-b ${colors.header}`}>
            <h3 className={`text-sm font-medium ${colors.headerText}`}>{category.name}</h3>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${colors.total}`}>
                {formatCurrency(category.total, currentCurrencyCode)}
              </span>
              <button
                onClick={() => onAddToCategory(category.id, category.name, entryType)}
                className={`p-1 rounded-full transition-colors ${colors.button}`}
                title="Add to this category"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              {!category.isDefault && (
                <button
                  onClick={() => handleRemoveCategory(category.id, category.entries)}
                  className={`p-1 rounded-full transition-colors text-neutral-400 hover:bg-neutral-100 hover:text-red-500`}
                  title="Remove category"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {category.entries.length > 0 ? (
            category.entries.map((entry) => (
              <div key={entry._id} className="px-4 py-3 flex justify-between items-center hover:bg-neutral-50 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-800">{entry.name}</span>
                  {entry.dueDayOfMonth && (
                    <div className="flex items-center mt-1">
                      <svg className="w-3 h-3 mr-1 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-neutral-500">
                        Due: Day {entry.dueDayOfMonth}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-neutral-800">
                    {formatCurrency(Number(entry.amount), currentCurrencyCode)}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(entry, entryType)}
                      className="p-1.5 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-primary-500 transition-colors"
                      title="Edit entry"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id, entryType)}
                      className="p-1.5 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-red-500 transition-colors"
                      title="Delete entry"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-neutral-500 text-sm">No entries in this category</p>
              <p className="text-neutral-400 text-xs mt-1">Click the + button to add an entry</p>
            </div>
          )}
        </div>
      ))}
      
      {sortedCategories.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-8 flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-neutral-500 text-sm">Default categories will appear here</p>
          <p className="text-neutral-400 text-xs mt-1">Rent, Groceries, Insurances, Subscriptions, Car, Utilities, Loans and Credit card debt</p>
        </div>
      )}
    </div>
  );
};

export default CategoryTables;
