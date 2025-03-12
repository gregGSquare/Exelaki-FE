import React, { useState, useEffect } from "react";  
import api from "../services/axios";
import { Category, CategoryType } from "../types/categoryTypes";
import { CreateEntryPayload, EntryFlexibility, EntryRecurrence, EntryTags, EntryType, Entry } from "../types/entryTypes";

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
  editEntry?: Entry | null;
}

const AddEntry: React.FC<AddEntryProps> = ({ 
  onAdd, 
  categories, 
  isOpen, 
  onClose, 
  budgetId, 
  preselectedType, 
  preselectedCategoryId, 
  disableTypeSelection = false, 
  disableCategorySelection = false, 
  hideTags = false,
  editEntry = null
}) => {

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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      // If editing an existing entry, populate the form with its values
      if (editEntry) {
        setName(editEntry.name || "");
        setAmount(editEntry.amount?.toString() || "");
        setSelectedType(editEntry.category.type || "");
        setSelectedCategoryId(editEntry.category._id || "");
        setDueDayOfMonth(editEntry.dueDayOfMonth?.toString() || "");
        setFlexibility(editEntry.flexibility || "FIXED");
        setRecurrence(editEntry.recurrence || "MONTHLY");
        setTags(editEntry.tags || []);
      } else {
        // For new entries
        if (preselectedType) {
          setSelectedType(preselectedType);
          
          // Automatically select the first category for INCOME or SAVING if no specific category is selected
          if ((preselectedType === 'INCOME' || preselectedType === 'SAVING') && !preselectedCategoryId) {
            const matchingCategories = categories.filter(cat => cat.type === preselectedType);
            if (matchingCategories.length > 0) {
              setSelectedCategoryId(matchingCategories[0]._id);
            }
          }
        }
      }
    } else {
      // Reset form when modal is closed
      resetForm();
    }
  }, [isOpen, preselectedType, categories, preselectedCategoryId, editEntry]);

  // Set selected category ID when preselectedCategoryId changes
  useEffect(() => {
    if (preselectedCategoryId) {
      setSelectedCategoryId(preselectedCategoryId);
    }
  }, [preselectedCategoryId]);

  // Update form when editEntry changes
  useEffect(() => {
    if (editEntry) {
      setName(editEntry.name || "");
      setAmount(editEntry.amount?.toString() || "");
      setSelectedType(editEntry.category.type || "");
      setSelectedCategoryId(editEntry.category._id || "");
      setDueDayOfMonth(editEntry.dueDayOfMonth?.toString() || "");
      setFlexibility(editEntry.flexibility || "FIXED");
      setRecurrence(editEntry.recurrence || "MONTHLY");
      setTags(editEntry.tags || []);
    }
  }, [editEntry]);

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
    setError(null);
    setAttemptedSubmit(false);
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
    
    // Set attempted submit to true to show validation errors
    setAttemptedSubmit(true);
    
    // Validate required fields
    if (!name || !amount) {
      setError("Name and amount are required");
      return;
    }
    
    // Validate that a type is selected
    if (!selectedType) {
      setError("Please select a type (Income, Expense, or Saving)");
      return;
    }
    
    // For expenses, validate category
    if (selectedType === "EXPENSE" && !selectedCategoryId && !customCategoryMode) {
      setError("Category is required for expenses");
      return;
    }

    // For expenses, validate that at least one tag is selected
    if (selectedType === "EXPENSE" && tags.length === 0) {
      setError("Please select at least one tag for the expense");
      return;
    }

    // Set loading state to true
    setIsLoading(true);

    try {
      let categoryId = selectedCategoryId;
      
      // For INCOME and SAVING, automatically use the first category of that type
      if (selectedType === 'INCOME' || selectedType === 'SAVING') {
        const matchingCategories = categories.filter(cat => cat.type === selectedType);
        if (matchingCategories.length > 0) {
          categoryId = matchingCategories[0]._id;
        }
      }
      
      // For EXPENSE, require category selection
      if (selectedType === 'EXPENSE' && !categoryId && !customCategoryMode) {
        setError("Category is required for expenses");
        setIsLoading(false);
        return;
      }

      if (customCategoryMode && customCategoryName) {
        const categoryResponse = await api.post('/categories', {
          name: customCategoryName,
          type: selectedType
        });
        categoryId = categoryResponse.data._id;
      }

      // If we're editing, update the editEntry object with the form values
      if (editEntry) {
        // Update the editEntry object with the form values
        if (editEntry) {
          editEntry.name = name.trim();
          editEntry.amount = parseFloat(amount);
          editEntry.category._id = categoryId;
          editEntry.category.type = selectedType as CategoryType;
          editEntry.flexibility = selectedType === 'EXPENSE' ? flexibility : "FIXED";
          editEntry.recurrence = selectedType === 'EXPENSE' ? recurrence : "MONTHLY";
          editEntry.tags = selectedType === 'EXPENSE' ? tags : [EntryTags.MISC];
          if (selectedType === 'EXPENSE' && dueDayOfMonth) {
            editEntry.dueDayOfMonth = parseInt(dueDayOfMonth);
          }
        }
        
        try {
          // First close the modal to prevent any interference
          onClose();
          // Then call onAdd to update data
          await onAdd();
        } catch (error) {
          console.error("Error during onAdd after edit:", error);
          // We've already closed the modal, so just log the error
        } finally {
          setIsLoading(false);
        }
      } else {
        // For new entries, make the API call directly
        const payload = {
          name: name.trim(),
          amount: parseFloat(amount),
          categoryId: categoryId,
          budgetId: budgetId,
          type: selectedType as EntryType,
          flexibility: selectedType === 'EXPENSE' ? flexibility : "FIXED",
          recurrence: selectedType === 'EXPENSE' ? recurrence : "MONTHLY",
          tags: selectedType === 'EXPENSE' ? tags : [EntryTags.MISC],
          ...(selectedType === 'EXPENSE' && dueDayOfMonth && { dueDayOfMonth: parseInt(dueDayOfMonth) }),
        };
        
        const response = await api.post("/entries", payload);
        
        if (response.status === 201 || response.status === 200) {
          resetForm();
          try {
            // First close the modal to prevent any interference
            onClose();
            // Then call onAdd to update data
            await onAdd();
          } catch (error) {
            console.error("Error during onAdd after create:", error);
            // We've already closed the modal, so just log the error
          } finally {
            setIsLoading(false);
          }
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create entry");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {editEntry ? `Edit ${selectedType.charAt(0) + selectedType.slice(1).toLowerCase()}` : `Add New Entry`}
          </h2>
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
              Type <span className="text-gray-700">*</span>
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as CategoryType)}
              className={`w-full px-3 py-2 border ${attemptedSubmit && !selectedType ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            {attemptedSubmit && !selectedType && (
              <p className="mt-1 text-sm text-red-600">Please select a type</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-gray-700">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border ${attemptedSubmit && !name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Entry name"
              required
            />
            {attemptedSubmit && !name && (
              <p className="mt-1 text-sm text-red-600">Please enter a name</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-gray-700">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-3 py-2 border ${attemptedSubmit && !amount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              placeholder="0.00"
              required
            />
            {attemptedSubmit && !amount && (
              <p className="mt-1 text-sm text-red-600">Please enter an amount</p>
            )}
          </div>

          <div>
            {selectedType === 'EXPENSE' && (
              <>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-gray-700">*</span>
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
                    className={`w-full px-3 py-2 border ${attemptedSubmit && !customCategoryName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="New category name"
                    required
                  />
                ) : (
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className={`w-full px-3 py-2 border ${attemptedSubmit && !selectedCategoryId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                {attemptedSubmit && !selectedCategoryId && !customCategoryMode && (
                  <p className="mt-1 text-sm text-red-600">Please select a category</p>
                )}
                {attemptedSubmit && customCategoryMode && !customCategoryName && (
                  <p className="mt-1 text-sm text-red-600">Please enter a category name</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flexibility
                </label>
                <select
                  value={flexibility}
                  onChange={(e) => setFlexibility(e.target.value as EntryFlexibility)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FIXED">Fixed</option>
                  <option value="FLEXIBLE">Flexible</option>
                  <option value="OPTIONAL">Optional</option>
                </select>
              </div>
            </>
          )}

          {/* Only show tags for expenses */}
          {selectedType === 'EXPENSE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags <span className="text-gray-700">*</span>
              </label>
              <div className={`flex flex-wrap gap-2 ${attemptedSubmit && tags.length === 0 ? 'border border-red-500 p-2 rounded-md' : ''}`}>
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
              {attemptedSubmit && selectedType === 'EXPENSE' && tags.length === 0 && (
                <p className="mt-1 text-sm text-red-600">Please select at least one tag</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 flex items-center justify-center min-w-[100px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                editEntry ? 'Save Changes' : 'Add Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEntry;
