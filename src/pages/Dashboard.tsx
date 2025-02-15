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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header Section - More Compact */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{budgetName}</h1>
          <p className="text-sm text-gray-500">Budget Overview</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Financial Overview */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Income</p>
                <p className="text-lg font-semibold text-green-600">${totalIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expenses</p>
                <p className="text-lg font-semibold text-red-600">${totalExpenses.toLocaleString()}</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500">Balance</p>
                <p className={`text-lg font-semibold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${balance.toLocaleString()}
                </p>
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
          {/* Add Entry Section */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsAddEntryModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Entry
            </button>
          </div>

          {/* Transactions Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Income</h2>
              <CategoryTables
                entries={incomes}
                entryType="IN"
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Expenses</h2>
              <CategoryTables
                entries={expenses}
                entryType="OUT"
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
      />
    </div>
  );
};

export default Dashboard;
