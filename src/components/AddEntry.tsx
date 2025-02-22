import React, { useState, useEffect } from "react";  
import api from "../services/axios";
import { Category, CategoryType } from "../types/categoryTypes";
import { CreateEntryPayload, EntryFlexibility, EntryRecurrence, EntryTags } from "../types/entryTypes";

interface AddEntryProps {
  onAdd: () => void;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
  preselectedType?: CategoryType;
  preselectedCategoryId?: string;
  disableTypeSelection?: boolean;
  disableCategorySelection?: boolean;
  hideTags?: boolean;
}

const AddEntry: React.FC<AddEntryProps> = ({ onAdd, categories, isOpen, onClose, budgetId, preselectedType, preselectedCategoryId, disableTypeSelection = false, disableCategorySelection = false, hideTags = false }) => {

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedType, setSelectedType] = useState<"" | CategoryType>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [dueDayOfMonth, setDueDayOfMonth] = useState<string>("");
  const [flexibility, setFlexibility] = useState<EntryFlexibility>("FIXED");
  const [recurrence, setRecurrence] = useState<EntryRecurrence>("MONTHLY");
  const [tags, setTags] = useState<EntryTags[]>([]);

  useEffect(() => {
    if (preselectedType) {
      setSelectedType(preselectedType);
      
      // Automatically select the first category for INCOME or SAVING
      if (preselectedType === 'INCOME' || preselectedType === 'SAVING') {
        const matchingCategories = categories.filter(cat => cat.type === preselectedType);
        if (matchingCategories.length > 0) {
          setSelectedCategoryId(matchingCategories[0]._id);
        }
      }
    }
  }, [preselectedType, categories]);

  useEffect(() => {
    if (preselectedCategoryId) {
      setSelectedCategoryId(preselectedCategoryId);
    }
  }, [preselectedCategoryId]);

  const resetForm = () => {
    setName("");
    setAmount("");
    setSelectedType("");
    setSelectedCategoryId("");
    setCustomCategoryMode(false);
    setCustomCategoryName("");
    setDueDayOfMonth("");
    setFlexibility("FIXED");
    setRecurrence("MONTHLY");
    setTags([]);
  };

  const handleTagToggle = (tag: EntryTags) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || !name || !amount || (!selectedCategoryId && !customCategoryName)) {
      console.error("Missing required fields");
      return;
    }

    try {
      let categoryId = selectedCategoryId;
      
      if (customCategoryMode && customCategoryName) {
        const categoryResponse = await api.post('/categories', {
          name: customCategoryName,
          type: selectedType
        });
        categoryId = categoryResponse.data._id;
      }

      const payload: CreateEntryPayload = {
        name: name.trim(),
        amount: parseFloat(amount),
        categoryId: categoryId,
        budgetId: budgetId,
        type: selectedType,
        ...(dueDayOfMonth && { dueDayOfMonth: parseInt(dueDayOfMonth) }),
        flexibility,
        recurrence,
        tags,
      };

      console.log('Submitting entry with payload:', payload);

      const response = await api.post("/entries", payload);
      
      if (response.status === 201 || response.status === 200) {
        console.log('Entry created successfully:', response.data);
        resetForm();
        onAdd();
        onClose();
      }
    } catch (error: any) {
      console.error("Error creating entry:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Add New Entry</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as CategoryType)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                disableTypeSelection ? 'bg-gray-100 text-gray-500 appearance-none cursor-not-allowed' : ''
              }`}
              required
              disabled={disableTypeSelection}
            >
              <option value="">Select type</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
              <option value="SAVING">Saving</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            {selectedType === 'EXPENSE' && (
              <>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  {!disableCategorySelection && (
                    <button
                      type="button"
                      onClick={() => setCustomCategoryMode(!customCategoryMode)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      {customCategoryMode ? "Select existing" : "Create new"}
                    </button>
                  )}
                </div>
                
                {customCategoryMode ? (
                  <input
                    type="text"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="New category name"
                    required
                  />
                ) : (
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      disableCategorySelection ? 'bg-gray-100 text-gray-500 appearance-none cursor-not-allowed' : ''
                    }`}
                    required
                    disabled={disableCategorySelection}
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter((cat) => cat.type === selectedType)
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                )}
              </>
            )}
          </div>

          {selectedType === 'EXPENSE' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDayOfMonth}
                  onChange={(e) => setDueDayOfMonth(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as EntryRecurrence)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="ONE_TIME">One Time</option>
                </select>
              </div>
            </>
          )}

          {/* Only show tags for expenses */}
          {!hideTags && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(EntryTags).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      tags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntry;
