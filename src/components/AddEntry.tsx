import React, { useState } from "react";
import api from "../services/axios";
import { Category } from "../types/categoryTypes";
import { useBudget } from "../contexts/BudgetContext";

interface AddEntryProps {
  onAdd: () => void;
  categories: Category[];
}

const AddEntry: React.FC<AddEntryProps> = ({ onAdd, categories }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedType, setSelectedType] = useState<"" | "IN" | "OUT" | "SAVINGS">("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const { currentBudgetId } = useBudget(); // Use budget context to get current budget ID

  const handleAddCustomCategory = async () => {
    if (!customCategoryName) return;

    try {
      const response = await api.post('/categories', { name: customCategoryName, type: selectedType });
      const newCategory = response.data;
      categories.push(newCategory);
      setSelectedCategoryId(newCategory._id);
      setCustomCategoryMode(false);
    } catch (error) {
      console.error("Error adding custom category:", error);
    }
  };

  const handleAddEntry = async () => {
    const selectedCategory = categories.find(
      (cat) => cat._id === selectedCategoryId
    );
  
    if (!selectedCategory) {
      console.error("Selected category not found", selectedCategoryId);
      return;
    }
  
    try {
      const response = await api.post("/entries", {
        name,
        amount,
        type: selectedType,
        category: selectedCategory,
        budget: currentBudgetId, // Use current budget ID from context
      });
  
      if (response.status === 201) {
        setName("");
        setAmount("");
        setSelectedType("");
        setSelectedCategoryId("");
        onAdd();
      } else {
        console.error("Failed to add entry");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      <label className="block text-sm font-medium text-gray-700 mt-4">Amount</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      <label className="block text-sm font-medium text-gray-700 mt-4">Type</label>
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as "IN" | "OUT" | "SAVINGS")}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="" disabled>
          Select Type
        </option>
        <option value="IN">Income</option>
        <option value="OUT">Expense</option>
        <option value="SAVINGS">Savings</option>
      </select>
      <label className="block text-sm font-medium text-gray-700 mt-4">Category</label>

      {customCategoryMode ? (
        <div>
          <input
            type="text"
            value={customCategoryName}
            onChange={(e) => setCustomCategoryName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleAddCustomCategory}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Category
          </button>
          <button
            onClick={() => {
              setCustomCategoryMode(false);
              setCustomCategoryName("");
            }}
            className="mt-2 bg-gray-500 text-white px-4 py-2 rounded ml-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <select
          value={selectedCategoryId}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setCustomCategoryMode(true);
            } else {
              setSelectedCategoryId(e.target.value);
            }
          }}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="" disabled>
            Select Category
          </option>
          <option value="custom">Add Custom Category</option>
          {categories
            .filter((category) => category.type === selectedType)
            .map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
        </select>
      )}

      <button
        onClick={handleAddEntry}
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
        disabled={!selectedType}
      >
        Add Entry
      </button>
    </div>
  );
};

export default AddEntry;
