import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl border border-neutral-100">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Delete Budget</h2>
        <p className="text-neutral-600 mb-6">
          Are you sure you want to delete "{budgetName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-500 focus:outline-none transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
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
  const { showNotification } = useNotification();
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
      // Make the API call and wait for it to complete
      const response = await api.post("/budget", { 
        name: budgetName, 
        month, 
        year,
        currency: currencyCode,
        budgetType,
        description
      });
      
      // Check if we have a valid response with the expected structure
      if (response && response.data) {
        // The actual budget data is nested inside the 'data' property
        const budgetData = response.data.data;
        
        if (budgetData && budgetData._id) {
          // Ensure budgets is an array before updating it
          if (Array.isArray(budgets)) {
            setBudgets((prevBudgets) => [...prevBudgets, budgetData]);
          } else {
            // If budgets is not an array, initialize it with the new budget
            setBudgets([budgetData]);
          }
          
          // Validate budget ID before setting it
          if (budgetData._id && typeof budgetData._id === 'string') {
            // Set the current budget ID in the context
            setCurrentBudgetId(budgetData._id);
            
            // Close the modal and show success notification
            setShowCreateModal(false);
            showNotification('Budget created successfully', 'success');
            
            // Only navigate after all the above operations are complete
            navigate(`/dashboard/${budgetData._id}`);
          } else {
            showNotification('Failed to create budget: Invalid budget ID', 'error');
          }
        } else {
          // Handle case where response exists but data is missing
          showNotification('Failed to create budget: Invalid server response structure', 'error');
        }
      } else {
        // Handle case where response exists but data is missing
        showNotification('Failed to create budget: Invalid server response', 'error');
      }
    } catch (error: any) {
      // Get the error message from the response
      if (error.response?.data?.message) {
        showNotification(error.response.data.message, 'error');
      } else if (error.message) {
        showNotification(error.message, 'error');
      } else {
        showNotification('Failed to create budget', 'error');
      }
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
      
      // Ensure budgets is an array before updating it
      if (Array.isArray(budgets)) {
        setBudgets((prevBudgets) => 
          prevBudgets.filter((b) => b._id !== budgetToDelete._id)
        );
      } else {
        // If budgets is not an array, initialize it as an empty array
        setBudgets([]);
      }
      
      showNotification(`Budget "${budgetToDelete.name}" deleted successfully`, 'success');
      setBudgetToDelete(null);
    } catch (error: any) {
      // Get the error message from the response
      if (error.response?.data?.message) {
        showNotification(error.response.data.message, 'error');
      } else if (error.message) {
        showNotification(error.message, 'error');
      } else {
        showNotification('Failed to delete budget', 'error');
      }
    }
  };

  // Function to get budget type icon
  const getBudgetTypeIcon = (type: string) => {
    switch (type) {
      case 'MONTHLY':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'TRAVEL':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'PROJECT':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'EVENT':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            Welcome to Your Budget Archive
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Create and manage multiple budgets to track your finances across different months or scenarios.
          </p>
        </div>

        {/* Create New Budget Button */}
        <div className="mb-12 flex justify-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Budget
          </button>
        </div>

        {/* Budgets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(budgets) ? budgets.map((budget) => (
            <div
              key={budget._id}
              onClick={() => handleSelectBudget(budget._id)}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-soft hover:shadow-card transition-all duration-200 cursor-pointer overflow-hidden border border-neutral-100 relative group"
            >
              <div className="absolute top-0 right-0 p-2">
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
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-primary-50 rounded-lg text-primary-500 mr-3">
                    {getBudgetTypeIcon(budget.budgetType)}
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 line-clamp-1">{budget.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-100 rounded-full">
                    {months[budget.month - 1]} {budget.year}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-secondary-600 bg-secondary-100 rounded-full">
                    {budget.budgetType}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-full">
                    {budget.currency}
                  </span>
                </div>
                {budget.description && (
                  <p className="text-sm text-neutral-500 line-clamp-2 mt-2">{budget.description}</p>
                )}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <button className="w-full flex items-center justify-center text-sm text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 py-2 rounded-lg transition-colors border border-primary-100">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Open Budget
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-lg bg-neutral-200 h-32 w-full mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
              <p className="text-neutral-500 mt-4">Loading budgets...</p>
            </div>
          )}
        </div>

        {/* Empty State */}
        {Array.isArray(budgets) && budgets.length === 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-8 max-w-md mx-auto text-center">
            <div className="bg-neutral-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-neutral-500"
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
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">No budgets yet</h3>
            <p className="text-neutral-600 mb-6">
              Get started by creating your first budget to track your income, expenses, and savings.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Budget
            </button>
          </div>
        )}

        {/* Create Budget Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-neutral-800/75 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl border border-neutral-100">
              <h2 className="text-2xl font-bold text-neutral-800 mb-6">Create New Budget</h2>
              <form onSubmit={handleCreateNewBudget} className="space-y-6">
                <div>
                  <label htmlFor="budgetName" className="block text-sm font-medium text-neutral-700 mb-1">
                    Budget Name
                  </label>
                  <input
                    type="text"
                    id="budgetName"
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="My Monthly Budget"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="currencyCode" className="block text-sm font-medium text-neutral-700 mb-1">
                    Currency
                  </label>
                  <div className="relative">
                    <select
                      id="currencyCode"
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none transition-colors"
                      required
                    >
                      {currencies.map(({ code, name }) => (
                        <option key={code} value={code}>
                          {code} - {name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="month" className="block text-sm font-medium text-neutral-700 mb-1">
                      Month
                    </label>
                    <div className="relative">
                      <select
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none transition-colors"
                      >
                        {months.map((monthName, index) => (
                          <option key={monthName} value={index + 1}>
                            {monthName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-neutral-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      id="year"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      min={2000}
                      max={2100}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="budgetType" className="block text-sm font-medium text-neutral-700 mb-1">
                    Budget Type
                  </label>
                  <div className="relative">
                    <select
                      id="budgetType"
                      value={budgetType}
                      onChange={(e) => setBudgetType(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none transition-colors"
                      required
                    >
                      <option value="MONTHLY">Monthly Budget</option>
                      <option value="TRAVEL">Travel Budget</option>
                      <option value="PROJECT">Project Budget</option>
                      <option value="EVENT">Event Budget</option>
                      <option value="CUSTOM">Custom Budget</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Add a description for your budget"
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-500 focus:outline-none transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : 'Create Budget'}
                  </button>
                </div>
              </form>
            </div>
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
