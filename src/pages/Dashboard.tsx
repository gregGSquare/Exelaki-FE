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
      
      setBudgetName(response.data.name);
      setCurrentCurrencyCode(response.data.currency || "USD");
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

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      {/* Financial overview row */}
      <div className="bg-white shadow-sm rounded-lg px-2 sm:px-4 py-3 mb-6 overflow-x-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">{budgetName}</h1>
            <div className="flex items-center">
              {isEditingCurrency ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={currentCurrencyCode}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    {currencies.map(({ code, name }) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsEditingCurrency(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingCurrency(true)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <span className="mr-1">{currentCurrencyCode}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center divide-x divide-gray-200 lg:w-1/3">
              <div className="pr-6">
                <span className="text-sm text-gray-500 block">Income</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(totalIncome, currentCurrencyCode)}
                </span>
              </div>
              <div className="px-6">
                <span className="text-sm text-gray-500 block">Expenses</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(totalExpenses, currentCurrencyCode)}
                </span>
              </div>
              <div className="px-6">
                <span className="text-sm text-gray-500 block">Balance</span>
                <span className={`text-sm font-medium ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(balance, currentCurrencyCode)}
                </span>
              </div>
            </div>

            <div className="md:w-2/3">
              <FinancialIndicatorCards indicators={financialIndicators} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Financial Overview */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Quick Stats */}
          {/* Incomes */}
          <div className="bg-green-50/80 rounded-lg shadow p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Income</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddIncomeModalOpen(true)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-green-600">
                    Total: {formatCurrency(totalIncome, currentCurrencyCode)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {incomes.map((entry) => (
                  <div key={entry._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">{entry.name}</span>
                      <span className="text-xs text-gray-500">{entry.category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
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
                ))}
              </div>
            </div>
          </div>
          {/* Expenses */}
          <div className="bg-red-50/80 rounded-lg shadow p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddExpenseModalOpen(true)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-red-600">
                    Total: {formatCurrency(totalExpenses, currentCurrencyCode)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(
                  expenses.reduce((acc, entry) => {
                    const categoryName = entry.category.name;
                    if (!acc[categoryName]) {
                      acc[categoryName] = 0;
                    }
                    acc[categoryName] += Number(entry.amount);
                    return acc;
                  }, {} as { [key: string]: number })
                ).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{category}</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(amount, currentCurrencyCode)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Savings */}
          <div className="bg-blue-50/80 rounded-lg shadow p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Savings</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddSavingModalOpen(true)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-blue-600">
                    Total: {formatCurrency(totalSavings, currentCurrencyCode)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {savings.map((entry) => (
                  <div key={entry._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">{entry.name}</span>
                      <span className="text-xs text-gray-500">{entry.category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
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
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <TotalScoreDisplay score={financialIndicators.totalScore} />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Expense Distribution</h3>
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
        <div className="col-span-12 lg:col-span-9 space-y-4">
          {/* Transactions Sections */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Expenses</h2>
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editEntry.name}
                  onChange={(e) => setEditEntry({ ...editEntry, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={editEntry.amount}
                  onChange={(e) => setEditEntry({ ...editEntry, amount: +e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setEditEntry(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
