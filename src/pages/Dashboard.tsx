import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddEntry from "../components/AddEntry";
import { useFetchData } from "../hooks/useFetchData";
import { useEditDelete } from "../hooks/useEditDelete";
import useFetchCategories from "../hooks/useFetchCategories";
import CategoryTables from "../components/CategoryTables";
import { useBudget } from "../contexts/BudgetContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import api from "../services/axios";
import {ExpenseDistribution } from "../types/entryTypes";
import ExpensePieChart from "../components/ExpensePieChart";
import FinancialIndicatorCards from "../components/FinancialIndicatorCards";
import TotalScoreDisplay from "../components/TotalScoreDisplay";
import { loadFinancialIndicators } from "../services/financialIndicatorsService";
import { formatCurrency, getCurrencyList, CurrencyOption } from "../utils/currency";
import { handleApiError } from "../utils/errorHandler";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const budgetId = id || "";
  const { setCurrentBudgetId, setCurrentCurrencyCode, currentCurrencyCode } = useBudget();
  const [budgetName, setBudgetName] = useState("");
  const [budgetMonth, setBudgetMonth] = useState<number | null>(null);
  const [budgetYear, setBudgetYear] = useState<number | null>(null);
  const [budgetType, setBudgetType] = useState("");
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const { incomes, expenses, savings, fetchData } = useFetchData(budgetId);
  const [financialIndicators, setFinancialIndicators] = useState({
    totalScore: { value: "N/A", status: "GOOD" },
    debtToIncomeRatio: { value: "N/A", status: "GOOD" },
    savingsRate: { value: "N/A", status: "GOOD" },
    carCostRatio: { value: "N/A", status: "GOOD" },
    homeCostRatio: { value: "N/A", status: "GOOD" },
    expenseDistribution: [] as ExpenseDistribution[]
  });
  const {
    editEntry,
    handleEdit,
    handleDelete,
    handleEditSubmit,
    setEditEntry,
  } = useEditDelete(fetchData, budgetId, setFinancialIndicators);
  const { incomeCategories, expenseCategories, savingCategories } = useFetchCategories();
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isAddSavingModalOpen, setIsAddSavingModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string} | null>(null);
  const [isAddToCategoryModalOpen, setIsAddToCategoryModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);

  const currencies = useMemo<CurrencyOption[]>(() => getCurrencyList(), []);

  const handleCurrencyChange = async (newCurrencyCode: string) => {
    try {
      await api.put(`/budget/${budgetId}`, { currency: newCurrencyCode });
      setCurrentCurrencyCode(newCurrencyCode);
      setIsEditingCurrency(false);
      const indicators = await loadFinancialIndicators(budgetId);
      setFinancialIndicators(indicators);
      showNotification('Currency updated successfully', 'success');
    } catch (error) {
      const processedError = handleApiError(error);
      showNotification(processedError.message, 'error');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      showNotification('Please log in to access this page', 'warning');
      navigate("/login");
      return;
    }

    if (budgetId) {
      setCurrentBudgetId(budgetId);
      fetchBudgetDetails(budgetId);
      const loadIndicators = async () => {
        try {
          const indicators = await loadFinancialIndicators(budgetId);
          setFinancialIndicators(indicators);
        } catch (error) {
          const processedError = handleApiError(error);
          showNotification('Failed to load financial indicators', 'error');
        }
      };
      loadIndicators();
    }
  }, [navigate, budgetId, setCurrentBudgetId, isAuthenticated, setCurrentCurrencyCode, showNotification]);

  const fetchBudgetDetails = async (budgetId: string) => {
    try {
      // Get the token
      const token = localStorage.getItem('accessToken');
      
      // Make the request
      const response = await api.get(`/budget/${budgetId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      // Check if the response has the expected properties
      if (response.data && response.data.success) {
        // The actual budget data is nested inside the 'data' property
        const budgetData = response.data.data;
        
        if (budgetData) {
          // Extract values from the budget data
          const name = budgetData.name || '';
          const month = budgetData.month !== undefined ? budgetData.month : null;
          const year = budgetData.year !== undefined ? budgetData.year : null;
          const type = budgetData.budgetType || '';
          const currency = budgetData.currency || "USD";
          
          // Set state with the extracted values
          setBudgetName(name);
          setBudgetMonth(month);
          setBudgetYear(year);
          setBudgetType(type);
          setCurrentCurrencyCode(currency);
        } else {
          showNotification('Failed to load budget details', 'error');
        }
      } else {
        showNotification('Failed to load budget details', 'error');
      }
    } catch (error: any) {
      const processedError = handleApiError(error);
      
      // Handle 404 errors specifically
      if (processedError.statusCode === 404) {
        showNotification('Budget not found. Redirecting to budgets page.', 'warning');
        navigate('/budgets');
      } else {
        showNotification(processedError.message, 'error');
      }
    }
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalSavings = savings.reduce((sum, sav) => sum + Number(sav.amount), 0);
  const balance = totalIncome - totalExpenses;

  const handleAddToCategory = (categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setIsAddToCategoryModalOpen(true);
  };

  // Helper function to get month name
  const getMonthName = (month: number | null) => {
    if (month === null || month === undefined) return "";
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    // Ensure month is within valid range (1-12)
    if (month < 1 || month > 12) return "";
    return monthNames[month - 1]; // Adjust for 0-based array
  };

  // Format the budget period and type for display
  const formatBudgetInfo = () => {
    const monthName = getMonthName(budgetMonth);
    const parts = [];
    
    if (monthName) parts.push(monthName);
    if (budgetYear) parts.push(budgetYear.toString());
    if (budgetType) parts.push(`• ${budgetType}`);
    
    return parts.join(' ');
  };

  return (
    <div className="container mx-auto px-4 py-4 mt-12 bg-gray-50">
      {/* Header with budget info */}
      <div className="bg-white shadow-md rounded-lg px-4 sm:px-6 py-5 mb-6 overflow-hidden border-l-4 border-blue-500">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <div className="mb-2 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-800">{budgetName || "My Budget"}</h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatBudgetInfo()}
              </p>
            </div>
            <div className="flex items-center mt-2 sm:mt-0 relative">
              {isEditingCurrency ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 z-10 absolute right-0 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                  <select
                    value={currentCurrencyCode}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {currencies.map(({ code, name }) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsEditingCurrency(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingCurrency(true)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-md transition-colors"
                  aria-label="Change currency"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{currentCurrencyCode}</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Financial summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-4 border border-green-200">
              <div className="flex items-center">
                <div className="rounded-full bg-green-200 p-2 mr-3">
                  <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-green-800 uppercase">Income</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(totalIncome, currentCurrencyCode)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm p-4 border border-red-200">
              <div className="flex items-center">
                <div className="rounded-full bg-red-200 p-2 mr-3">
                  <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-800 uppercase">Expenses</p>
                  <p className="text-xl font-bold text-red-700">
                    {formatCurrency(totalExpenses, currentCurrencyCode)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-red-50 to-red-100 border-red-200'} rounded-lg shadow-sm p-4 border`}>
              <div className="flex items-center">
                <div className={`rounded-full ${balance >= 0 ? 'bg-blue-200' : 'bg-red-200'} p-2 mr-3`}>
                  <svg className={`w-5 h-5 ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div>
                  <p className={`text-xs font-medium ${balance >= 0 ? 'text-blue-800' : 'text-red-800'} uppercase`}>Balance</p>
                  <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    {formatCurrency(balance, currentCurrencyCode)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial indicators */}
      <div className="bg-white shadow-md rounded-lg px-4 sm:px-6 py-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Health</h2>
        <div className="md:w-full">
          <FinancialIndicatorCards indicators={financialIndicators} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Financial Overview */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Quick Stats */}
          {/* Incomes */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-50 px-4 py-3 border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Income
                </h3>
                <span className="text-sm font-medium text-green-600">
                  Total: {formatCurrency(totalIncome, currentCurrencyCode)}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {incomes.length > 0 ? (
                incomes.map((entry) => (
                  <div key={entry._id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">{entry.name}</span>
                      <span className="text-xs text-gray-500">{entry.category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(Number(entry.amount), currentCurrencyCode)}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(entry, 'INCOME')}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Edit entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id, 'INCOME')}
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
                ))
              ) : (
                <div className="py-4 text-center text-gray-500">
                  <p>No income entries yet</p>
                </div>
              )}
              {incomes.length > 0 && <div className="h-1 bg-gray-100"></div>}
            </div>
            <div className="p-3 flex justify-end">
              <button
                onClick={() => setIsAddIncomeModalOpen(true)}
                className="flex items-center text-sm text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors border border-green-200"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
          </div>
          
          {/* Expenses */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-l-4 border-red-500">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Expenses
                </h3>
                <span className="text-sm font-medium text-red-600">
                  Total: {formatCurrency(totalExpenses, currentCurrencyCode)}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {Object.entries(
                expenses.reduce((acc, entry) => {
                  const categoryName = entry.category.name;
                  if (!acc[categoryName]) {
                    acc[categoryName] = 0;
                  }
                  acc[categoryName] += Number(entry.amount);
                  return acc;
                }, {} as { [key: string]: number })
              ).length > 0 ? (
                Object.entries(
                  expenses.reduce((acc, entry) => {
                    const categoryName = entry.category.name;
                    if (!acc[categoryName]) {
                      acc[categoryName] = 0;
                    }
                    acc[categoryName] += Number(entry.amount);
                    return acc;
                  }, {} as { [key: string]: number })
                ).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center p-4 hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-800">{category}</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(amount, currentCurrencyCode)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-gray-500">
                  <p>No expense entries yet</p>
                </div>
              )}
              {Object.keys(expenses.reduce((acc, entry) => {
                const categoryName = entry.category.name;
                if (!acc[categoryName]) {
                  acc[categoryName] = 0;
                }
                acc[categoryName] += Number(entry.amount);
                return acc;
              }, {} as { [key: string]: number })).length > 0 && <div className="h-1 bg-gray-100"></div>}
            </div>
            <div className="p-3 flex justify-end">
              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors border border-blue-200"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
          </div>
          
          {/* Savings */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Savings
                </h3>
                <span className="text-sm font-medium text-blue-600">
                  Total: {formatCurrency(totalSavings, currentCurrencyCode)}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {savings.length > 0 ? (
                savings.map((entry) => (
                  <div key={entry._id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">{entry.name}</span>
                      <span className="text-xs text-gray-500">{entry.category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(Number(entry.amount), currentCurrencyCode)}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(entry, 'SAVING')}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Edit entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id, 'SAVING')}
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
                ))
              ) : (
                <div className="py-4 text-center text-gray-500">
                  <p>No savings entries yet</p>
                </div>
              )}
              {savings.length > 0 && <div className="h-1 bg-gray-100"></div>}
            </div>
            <div className="p-3 flex justify-end">
              <button
                onClick={() => setIsAddSavingModalOpen(true)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors border border-blue-200"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <TotalScoreDisplay score={financialIndicators.totalScore} />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Distribution</h3>
              <div className="h-64">
                {(() => {
                  if (financialIndicators.expenseDistribution && financialIndicators.expenseDistribution.length > 0) {
                    return <ExpensePieChart expenseDistribution={financialIndicators.expenseDistribution} />;
                  } else {
                    return (
                      <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-500">No expense data available</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Transactions */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Transactions Sections */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Expense Details</h2>
                <button
                  onClick={() => setIsAddExpenseModalOpen(true)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors border border-blue-200"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Expense
                </button>
              </div>
              <CategoryTables
                entries={expenses}
                entryType="EXPENSE"
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                onAddToCategory={handleAddToCategory}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editEntry && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Entry</h2>
              <button 
                onClick={() => setEditEntry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editEntry.name}
                  onChange={(e) => setEditEntry({ ...editEntry, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{currentCurrencyCode}</span>
                  </div>
                  <input
                    type="number"
                    value={editEntry.amount}
                    onChange={(e) => setEditEntry({ ...editEntry, amount: +e.target.value })}
                    className="w-full pl-16 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setEditEntry(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      <AddEntry 
        onAdd={async () => {
          await fetchData();
          const indicators = await loadFinancialIndicators(budgetId);
          setFinancialIndicators(indicators);
        }}
        categories={incomeCategories}
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        budgetId={budgetId}
        preselectedType="INCOME"
        disableTypeSelection={true}
        disableCategorySelection={false}
      />

      {/* Add Saving Modal */}
      <AddEntry 
        onAdd={async () => {
          await fetchData();
          const indicators = await loadFinancialIndicators(budgetId);
          setFinancialIndicators(indicators);
        }}
        categories={savingCategories}
        isOpen={isAddSavingModalOpen}
        onClose={() => setIsAddSavingModalOpen(false)}
        budgetId={budgetId}
        preselectedType="SAVING"
        disableTypeSelection={true}
        disableCategorySelection={false}
      />

      {/* Add to Category Modal */}
      <AddEntry 
        onAdd={async () => {
          await fetchData();
          const indicators = await loadFinancialIndicators(budgetId);
          setFinancialIndicators(indicators);
        }}
        categories={expenseCategories}
        isOpen={isAddToCategoryModalOpen}
        onClose={() => {
          setIsAddToCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        budgetId={budgetId}
        preselectedType="EXPENSE"
        preselectedCategoryId={selectedCategory?.id}
        disableTypeSelection={true}
        disableCategorySelection={true}
      />

      {/* Add Expense Modal */}
      <AddEntry 
        onAdd={async () => {
          await fetchData();
          const indicators = await loadFinancialIndicators(budgetId);
          setFinancialIndicators(indicators);
        }}
        categories={expenseCategories}
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        budgetId={budgetId}
        preselectedType="EXPENSE"
        disableTypeSelection={true}
        disableCategorySelection={false}
      />
    </div>
  );
};

export default Dashboard;
