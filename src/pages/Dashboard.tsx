import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddEntry from "../components/AddEntry";
import { useFetchData } from "../hooks/useFetchData";
import { useEditDelete } from "../hooks/useEditDelete";
import useFetchCategories from "../hooks/useFetchCategories";
import CategoryTables from "../components/CategoryTables";
import { useBudget } from "../contexts/BudgetContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/axios";
import CategorySummary from '../components/CategorySummary';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const budgetId = id || "";
  const { setCurrentBudgetId } = useBudget();
  const [budgetName, setBudgetName] = useState("");
  const { isAuthenticated } = useAuth();
  const { incomes, expenses, savings, fetchData } = useFetchData(budgetId);
  const {
    editEntry,
    handleEdit,
    handleDelete,
    handleEditSubmit,
    setEditEntry,
  } = useEditDelete(fetchData);
  const { incomeCategories, expenseCategories, savingCategories } = useFetchCategories();
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isAddSavingModalOpen, setIsAddSavingModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string} | null>(null);
  const [isAddToCategoryModalOpen, setIsAddToCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      console.error("User is not authenticated");
      navigate("/login");
      return;
    }

    if (budgetId) {
      setCurrentBudgetId(budgetId); // Set the current budget in context
      fetchBudgetName(budgetId); // Fetch budget name to display
    }
  }, [navigate, budgetId, setCurrentBudgetId, isAuthenticated]);

  const fetchBudgetName = async (budgetId: string) => {
    try {
      const response = await api.get(`/budget/${budgetId}`);
      setBudgetName(response.data.name);
    } catch (error) {
      console.error("Error fetching budget name:", error);
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
      <div className="bg-white shadow-sm rounded-lg px-4 py-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold">{budgetName}</h1>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Income</span>
              <span className="text-sm font-medium text-green-600">${totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Expenses</span>
              <span className="text-sm font-medium text-red-600">${totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Balance</span>
              <span className={`text-sm font-medium ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${balance.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => setIsAddEntryModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            >
              Add Entry
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Financial Overview */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Quick Stats */}
          {/* Incomes */}
          <div className="bg-white rounded-lg shadow p-6">
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
                    Total: ${totalIncome.toLocaleString()}
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
                        ${Number(entry.amount).toLocaleString()}
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
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
                <span className="text-sm font-medium text-red-600">
                  Total: ${totalExpenses.toLocaleString()}
                </span>
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
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Savings */}
          <div className="bg-white rounded-lg shadow p-6">
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
                  <span className="text-sm font-medium text-[#562900]">
                    Total: ${totalSavings.toLocaleString()}
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
                      <span className="text-sm font-medium text-[#562900]">
                        ${Number(entry.amount).toLocaleString()}
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

          {/* Placeholder for Financial Health Score */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Financial Health</h3>
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">Coming Soon</p>
            </div>
          </div>

          {/* Placeholder for Quick Analytics */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Analytics</h3>
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">Coming Soon</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Add Entry Modal */}
      <AddEntry 
        onAdd={fetchData}
        categories={[...incomeCategories, ...expenseCategories, ...savingCategories]}
        isOpen={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
        budgetId={budgetId}
      />

      {/* Add Income Modal */}
      <AddEntry 
        onAdd={fetchData}
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
        onAdd={fetchData}
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
        onAdd={fetchData}
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
    </div>
  );
};

export default Dashboard;
