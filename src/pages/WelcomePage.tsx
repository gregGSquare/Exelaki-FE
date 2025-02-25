import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/axios';
import { Budget } from '../types/budget';
import { getCurrencyList } from '../utils/currency';

interface WelcomePageProps {
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
}

interface DeleteModalProps {
  budgetName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ budgetName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Budget</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{budgetName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const WelcomePage: React.FC<WelcomePageProps> = ({ budgets, setBudgets }) => {
  const navigate = useNavigate();
  const { setCurrentBudgetId } = useBudget();
  const { isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [budgetName, setBudgetName] = useState("");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const [budgetType, setBudgetType] = useState<string>("MONTHLY");
  const [description, setDescription] = useState<string>("");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currencies = useMemo(() => getCurrencyList(), []);

  const handleCreateNewBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Creating budget with currency:", currencyCode);
      const response = await api.post("/budget", { 
        name: budgetName, 
        month, 
        year,
        currency: currencyCode,
        budgetType,
        description
      });
      const newBudget = response.data;
      setBudgets((prevBudgets) => [...prevBudgets, newBudget]);
      setCurrentBudgetId(newBudget._id);
      setShowCreateModal(false);
      navigate(`/dashboard/${newBudget._id}`);
    } catch (error) {
      console.error("Error creating new budget:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBudget = (budgetId: string) => {
    setCurrentBudgetId(budgetId);
    navigate(`/dashboard/${budgetId}`);
  };

  const handleDeleteBudget = async (budget: Budget, e: React.MouseEvent) => {
    e.stopPropagation();
    setBudgetToDelete(budget);
  };

  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    
    try {
      await api.delete(`/budget/${budgetToDelete._id}`);
      setBudgets((prevBudgets) => 
        prevBudgets.filter((b) => b._id !== budgetToDelete._id)
      );
      setBudgetToDelete(null);
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Budget Archive
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create and manage multiple budgets to track your finances across different months or scenarios.
          </p>
        </div>

        {/* Create New Budget Button */}
        <div className="mb-12">
          <button
            onClick={() => setShowCreateModal(true)}
            className="mx-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Budget
          </button>
        </div>

        {/* Budgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <div
              key={budget._id}
              onClick={() => handleSelectBudget(budget._id)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden border border-gray-200 relative group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                  <button
                    onClick={(e) => handleDeleteBudget(budget, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-red-50 rounded-full"
                    title="Delete budget"
                  >
                    <svg 
                      className="w-5 h-5 text-red-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </button>
                </div>
                <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                  {months[budget.month - 1]} {budget.year}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Create Budget Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Budget</h2>
              <form onSubmit={handleCreateNewBudget} className="space-y-6">
                <div>
                  <label htmlFor="budgetName" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Name
                  </label>
                  <input
                    type="text"
                    id="budgetName"
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    id="currencyCode"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {currencies.map(({ code, name }) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      id="month"
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {months.map((monthName, index) => (
                        <option key={monthName} value={index + 1}>
                          {monthName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      id="year"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={2000}
                      max={2100}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="budgetType" className="block text-sm font-medium text-gray-700">
                    Budget Type *
                  </label>
                  <select
                    id="budgetType"
                    value={budgetType}
                    onChange={(e) => setBudgetType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="MONTHLY">Monthly Budget</option>
                    <option value="TRAVEL">Travel Budget</option>
                    <option value="PROJECT">Project Budget</option>
                    <option value="EVENT">Event Budget</option>
                    <option value="CUSTOM">Custom Budget</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Add a description for your budget"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating...' : 'Create Budget'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Empty State */}
        {budgets.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first budget.
            </p>
          </div>
        )}

        {/* Add the delete confirmation modal */}
        {budgetToDelete && (
          <DeleteModal
            budgetName={budgetToDelete.name}
            onConfirm={confirmDelete}
            onCancel={() => setBudgetToDelete(null)}
          />
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
