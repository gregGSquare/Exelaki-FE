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
  console.log('Fetching entries for budgetId:', budgetId);
  const { incomes, expenses, fetchData } = useFetchData(budgetId); // Pass budgetId to fetch only relevant entries
  const {
    editEntry,
    handleEdit,
    handleDelete,
    handleEditSubmit,
    setEditEntry,
  } = useEditDelete(fetchData);
  const { inCategories, outCategories } = useFetchCategories();
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);

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
      console.error("Budget ID:", budgetId);
    }
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const balance = totalIncome - totalExpenses;

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

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Income Categories</h3>
                <span className="text-sm font-medium text-green-600">
                  Total: ${totalIncome.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(
                  incomes.reduce((acc, entry) => {
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
                    <span className="text-sm font-medium text-green-600">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Income</h2>
              <CategoryTables
                entries={incomes}
                entryType="INCOME"
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Expenses</h2>
              <CategoryTables
                entries={expenses}
                entryType="EXPENSE"
                handleEdit={handleEdit}
                handleDelete={handleDelete}
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
        categories={[...inCategories, ...outCategories]}
        isOpen={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
        budgetId={budgetId}
      />
    </div>
  );
};

export default Dashboard;
