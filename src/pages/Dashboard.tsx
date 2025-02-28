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
  const [isEditCurrencyModalOpen, setIsEditCurrencyModalOpen] = useState(false);

  const currencies = useMemo<CurrencyOption[]>(() => getCurrencyList(), []);

  const handleCurrencyChange = async (newCurrencyCode: string) => {
    try {
      await api.put(`/budget/${budgetId}`, { currency: newCurrencyCode });
      setCurrentCurrencyCode(newCurrencyCode);
      setIsEditCurrencyModalOpen(false);
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

    if (!budgetId || budgetId === 'undefined' || budgetId === 'null') {
      showNotification('Invalid budget ID. Redirecting to budgets page.', 'warning');
      navigate('/budgets');
      return;
    }

    if (budgetId) {
      setCurrentBudgetId(budgetId);
      
      // Create a function to fetch budget details with retry logic
      const fetchBudgetWithRetry = async () => {
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 1000; // 1 second delay between retries
        
        const attemptFetch = async () => {
          try {
            await fetchBudgetDetails(budgetId);
            // If successful, load financial indicators
            try {
              const indicators = await loadFinancialIndicators(budgetId);
              setFinancialIndicators(indicators);
            } catch (error) {
              const processedError = handleApiError(error);
              showNotification('Failed to load financial indicators', 'error');
            }
          } catch (error: any) {
            const processedError = handleApiError(error);
            
            // If we get a 404 and haven't exceeded max retries, try again
            if (processedError.statusCode === 404 && retryCount < maxRetries) {
              retryCount++;
              showNotification(`Budget not found. Retrying (${retryCount}/${maxRetries})...`, 'info');
              setTimeout(attemptFetch, retryDelay);
            } else if (processedError.statusCode === 404) {
              // If we've exceeded retries, redirect to budgets page
              showNotification('Budget not found after multiple attempts. Redirecting to budgets page.', 'warning');
              navigate('/budgets');
            } else {
              showNotification(processedError.message, 'error');
            }
          }
        };
        
        // Start the first attempt
        await attemptFetch();
      };
      
      // Execute the fetch with retry logic
      fetchBudgetWithRetry();
    }
  }, [navigate, budgetId, setCurrentBudgetId, isAuthenticated, setCurrentCurrencyCode, showNotification]);

  const fetchBudgetDetails = async (budgetId: string) => {
    // Validate budget ID
    if (!budgetId || budgetId === 'undefined' || budgetId === 'null') {
      throw new Error('Invalid budget ID');
    }
    
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
        return true;
      } else {
        throw new Error('Failed to load budget details: Missing budget data');
      }
    } else {
      throw new Error('Failed to load budget details: Invalid response format');
    }
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalSavings = savings.reduce((sum, sav) => sum + Number(sav.amount), 0);
  const balance = totalIncome - totalExpenses;

  // Group expenses by category and calculate totals
  const expensesByCategory = useMemo(() => {
    const grouped: Record<string, { categoryId: string, categoryName: string, total: number, entries: any[] }> = {};
    
    expenses.forEach(expense => {
      const categoryId = expense.category?._id || 'uncategorized';
      const categoryName = expense.category?.name || 'Uncategorized';
      
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          categoryId,
          categoryName,
          total: 0,
          entries: []
        };
      }
      
      grouped[categoryId].total += Number(expense.amount);
      grouped[categoryId].entries.push(expense);
    });
    
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [expenses]);

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
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-neutral-800">Financial Dashboard</h1>
              <p className="text-sm text-neutral-500">
                Track your income, expenses, and savings in one place
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={currentCurrencyCode}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="appearance-none bg-white border border-neutral-200 rounded-lg py-2 pl-3 pr-10 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} ({currency.name})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => setIsEditCurrencyModalOpen(true)}
                className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Edit Currency"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Income Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-5 transition-all hover:shadow-card group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">Total Income</p>
                <h3 className="text-2xl font-bold text-primary-600 group-hover:text-primary-700 transition-colors">
                  {formatCurrency(totalIncome, currentCurrencyCode)}
                </h3>
              </div>
              <div className="p-2 bg-primary-50 rounded-lg text-primary-500 group-hover:bg-primary-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-5 transition-all hover:shadow-card group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">Total Expenses</p>
                <h3 className="text-2xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                  {formatCurrency(totalExpenses, currentCurrencyCode)}
                </h3>
              </div>
              <div className="p-2 bg-red-50 rounded-lg text-red-500 group-hover:bg-red-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="w-full flex items-center justify-center text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors border border-red-100"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Expense
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-5 transition-all hover:shadow-card group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">Balance</p>
                <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600 group-hover:text-green-700' : 'text-red-600 group-hover:text-red-700'} transition-colors`}>
                  {formatCurrency(balance, currentCurrencyCode)}
                </h3>
              </div>
              <div className={`p-2 ${balance >= 0 ? 'bg-green-50 text-green-500 group-hover:bg-green-100' : 'bg-red-50 text-red-500 group-hover:bg-red-100'} rounded-lg transition-colors`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-neutral-100 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    totalExpenses / totalIncome > 0.8 
                      ? 'bg-red-500' 
                      : totalExpenses / totalIncome > 0.6 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome) * 100) : 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-neutral-500">
                  {totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}% of income spent
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Income and Savings Overview */}
      <div className="container mx-auto px-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Income Overview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-5 transition-all hover:shadow-card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-neutral-800 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Income Overview
              </h3>
              <span className="text-sm font-medium text-primary-600">
                Total: {formatCurrency(totalIncome, currentCurrencyCode)}
              </span>
            </div>
            <div className="overflow-hidden">
              {incomes.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  <table className="min-w-full divide-y divide-neutral-100">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Source</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-100">
                      {incomes.map((income) => (
                        <tr key={income._id} className="hover:bg-neutral-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-800">{income.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-primary-600 text-right font-medium flex items-center justify-end space-x-2">
                            <span>{formatCurrency(Number(income.amount), currentCurrencyCode)}</span>
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => handleEdit(income, 'INCOME')}
                                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-primary-500 transition-colors"
                                title="Edit income"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(income._id, 'INCOME')}
                                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-red-500 transition-colors"
                                title="Delete income"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-neutral-500">
                  <p className="text-sm">No income entries yet</p>
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setIsAddIncomeModalOpen(true)}
                className="flex items-center text-xs font-medium text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors border border-primary-100"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Income
              </button>
            </div>
          </div>

          {/* Savings Overview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-5 transition-all hover:shadow-card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-neutral-800 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Savings Overview
              </h3>
              <span className="text-sm font-medium text-secondary-600">
                Total: {formatCurrency(totalSavings, currentCurrencyCode)}
              </span>
            </div>
            <div className="overflow-hidden">
              {savings.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  <table className="min-w-full divide-y divide-neutral-100">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Account</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-100">
                      {savings.map((saving) => (
                        <tr key={saving._id} className="hover:bg-neutral-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-800">{saving.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-secondary-600 text-right font-medium flex items-center justify-end space-x-2">
                            <span>{formatCurrency(Number(saving.amount), currentCurrencyCode)}</span>
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => handleEdit(saving, 'SAVING')}
                                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-secondary-500 transition-colors"
                                title="Edit saving"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(saving._id, 'SAVING')}
                                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-red-500 transition-colors"
                                title="Delete saving"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-neutral-500">
                  <p className="text-sm">No savings entries yet</p>
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setIsAddSavingModalOpen(true)}
                className="flex items-center text-xs font-medium text-secondary-600 hover:text-secondary-800 bg-secondary-50 hover:bg-secondary-100 px-3 py-1.5 rounded-lg transition-colors border border-secondary-100"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Savings
              </button>
            </div>
          </div>

          {/* Expense Overview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-5 transition-all hover:shadow-card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-neutral-800 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Expense Overview
              </h3>
              <span className="text-sm font-medium text-red-600">
                Total: {formatCurrency(totalExpenses, currentCurrencyCode)}
              </span>
            </div>
            <div className="overflow-hidden">
              {expensesByCategory.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  <table className="min-w-full divide-y divide-neutral-100">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-100">
                      {expensesByCategory.map((category) => (
                        <tr key={category.categoryId} className="hover:bg-neutral-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-800">{category.categoryName}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600 text-right font-medium">
                            {formatCurrency(category.total, currentCurrencyCode)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-neutral-500">
                  <p className="text-sm">No expense entries yet</p>
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="flex items-center text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial indicators */}
      <div className="bg-white/80 backdrop-blur-sm shadow-soft rounded-xl px-6 py-6 mb-6 border border-neutral-100 relative z-10 transition-all hover:shadow-card">
        <h2 className="text-lg font-bold text-neutral-800 mb-5 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Financial Health
        </h2>
        <div className="md:w-full">
          <FinancialIndicatorCards indicators={financialIndicators} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Financial Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Score Display */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 transition-all hover:shadow-card">
              <TotalScoreDisplay score={financialIndicators.totalScore} />
            </div>
            
            {/* Expense Distribution Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-6 transition-all hover:shadow-card">
              <h3 className="text-base font-semibold text-neutral-800 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Expense Distribution
              </h3>
              <div className="h-64">
                {(() => {
                  if (financialIndicators.expenseDistribution && financialIndicators.expenseDistribution.length > 0) {
                    return <ExpensePieChart expenseDistribution={financialIndicators.expenseDistribution} />;
                  } else {
                    return (
                      <div className="h-full flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
                        <p className="text-sm text-neutral-500">No expense data available</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
          
          {/* Expense Categories Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-100 p-6 transition-all hover:shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-neutral-800 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expense Categories
              </h3>
              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Expense
              </button>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              Track and manage your expenses effectively. Add categories to organize your spending habits.
            </p>
            <CategoryTables
              entries={expenses}
              entryType="EXPENSE"
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              onAddToCategory={(categoryId, categoryName) => {
                setSelectedCategory({ id: categoryId, name: categoryName });
                setIsAddToCategoryModalOpen(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddEntry
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onAdd={async () => {
          await fetchData();
          const indicators = await loadFinancialIndicators(budgetId);
          setFinancialIndicators(indicators);
        }}
        budgetId={budgetId}
        preselectedType="EXPENSE"
        categories={expenseCategories}
        disableTypeSelection={true}
        disableCategorySelection={false}
      />
      
      <AddEntry
        isOpen={isAddToCategoryModalOpen}
        onClose={() => {
          setIsAddToCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        onAdd={async () => {
          await fetchData();
          const indicators = await loadFinancialIndicators(budgetId);
          setFinancialIndicators(indicators);
        }}
        budgetId={budgetId}
        preselectedType="EXPENSE"
        categories={expenseCategories}
        preselectedCategoryId={selectedCategory?.id}
        disableTypeSelection={true}
        disableCategorySelection={true}
      />
      
      <AddEntry
        isOpen={!!editEntry}
        onClose={() => setEditEntry(null)}
        onAdd={handleEditSubmit}
        budgetId={budgetId}
        preselectedType="EXPENSE"
        categories={expenseCategories}
        disableTypeSelection={true}
        disableCategorySelection={false}
      />
      
      <AddEntry
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        onAdd={async () => {
          await fetchData();
          const indicators = await loadFinancialIndicators(budgetId);
          setFinancialIndicators(indicators);
        }}
        budgetId={budgetId}
        preselectedType="INCOME"
        categories={incomeCategories}
        disableTypeSelection={true}
        disableCategorySelection={false}
      />
      
      <AddEntry
        isOpen={isAddSavingModalOpen}
        onClose={() => setIsAddSavingModalOpen(false)}
        onAdd={async () => {
          await fetchData();
          const indicators = await loadFinancialIndicators(budgetId);
          setFinancialIndicators(indicators);
        }}
        budgetId={budgetId}
        preselectedType="SAVING"
        categories={savingCategories}
        disableTypeSelection={true}
        disableCategorySelection={false}
      />
    </div>
  );
};

export default Dashboard;
