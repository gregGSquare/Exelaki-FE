import React from 'react';
import { Entry } from '../types/entryTypes';

interface CategoryTablesProps {
  entries: Entry[];
  entryType: 'INCOME' | 'EXPENSE' | 'SAVING';
  handleEdit: (entry: Entry, entryType: 'INCOME' | 'EXPENSE' | 'SAVING') => void;
  handleDelete: (id: string, type: 'INCOME' | 'EXPENSE' | 'SAVING') => void;
}

const getTypeStyles = (type: 'INCOME' | 'EXPENSE' | 'SAVING') => {
  switch (type) {
    case 'INCOME':
      return { bg: 'bg-green-50', text: 'text-green-700', amount: 'text-green-600' };
    case 'EXPENSE':
      return { bg: 'bg-red-50', text: 'text-red-700', amount: 'text-red-600' };
    case 'SAVING':
      return { bg: 'bg-blue-50', text: 'text-blue-700', amount: 'text-blue-600' };
  }
};

const CategoryTables: React.FC<CategoryTablesProps> = ({
  entries,
  entryType,
  handleEdit,
  handleDelete,
}) => {
  const groupedEntries = entries.reduce((acc, entry) => {
    const categoryName = entry.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(entry);
    return acc;
  }, {} as { [key: string]: Entry[] });

  const styles = getTypeStyles(entryType);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(groupedEntries).map(([categoryName, categoryEntries]) => {
        const totalAmount = categoryEntries.reduce((sum, entry) => sum + Number(entry.amount), 0);
        
        return (
          <div key={categoryName} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            {/* Category Header */}
            <div className={`px-4 py-3 ${styles.bg}`}>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">{categoryName}</h3>
                <span className={`text-sm font-medium ${styles.text}`}>
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Entries List */}
            <div className="flex-1 overflow-y-auto max-h-[300px]">
              <div className="divide-y divide-gray-200">
                {categoryEntries.map((entry) => (
                  <div 
                    key={entry._id} 
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {entry.name}
                        </span>
                        {entry.dueDayOfMonth && (
                          <span className="ml-2 text-xs text-gray-500">
                            Due: Day {entry.dueDayOfMonth}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${styles.amount}`}>
                        ${Number(entry.amount).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1 mb-2">
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>{entry.recurrence.toLowerCase()}</span>
                        {entry.flexibility && (
                          <span>• {entry.flexibility.toLowerCase()}</span>
                        )}
                      </div>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
                            >
                              {tag.toLowerCase()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(entry, entryType)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Edit entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id, entryType)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
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

            {/* Category Footer */}
            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
              {categoryEntries.length} {categoryEntries.length === 1 ? 'entry' : 'entries'}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryTables;
