import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";  // Axios service for making API requests
import { useBudget } from "../contexts/BudgetContext";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import { useAuth } from "../contexts/AuthContext";

interface Budget {
  _id: string;
  name: string;
  month: number;
  year: number;
}

interface WelcomePageProps {
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ budgets, setBudgets }) => {
  const navigate = useNavigate();
  const { setCurrentBudgetId } = useBudget();
  const { isAuthenticated } = useAuth();
  const [creatingBudget, setCreatingBudget] = useState(false);
  const [budgetName, setBudgetName] = useState("");
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      console.error("User is not authenticated");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleCreateNewBudget = async () => {
    try {
      // Validate form
      if (!budgetName || !month || !year) {
        alert("Please fill in all fields");
        return;
      }

      // Make an API call to create a new budget
      const response = await api.post("/budget", { name: budgetName, month, year });
      const newBudget = response.data;

      // Update the budgets state with the new budget
      setBudgets((prevBudgets) => [...prevBudgets, newBudget]);

      // Set the current budget in context
      setCurrentBudgetId(newBudget._id);

      // Navigate to the dashboard with the new budget ID
      navigate(`/dashboard/${newBudget._id}`);
    } catch (error) {
      console.error("Error creating new budget:", error);
    }
  };

  const handleSelectBudget = (budgetId: string) => {
    setCurrentBudgetId(budgetId); // Set the current budget in context
    navigate(`/dashboard/${budgetId}`);
  };

  const handleDeleteBudget = async () => {
    if (deleteBudgetId) {
      try {
        await api.delete(`/budget/${deleteBudgetId}`);
        setBudgets((prevBudgets) => prevBudgets.filter((budget) => budget._id !== deleteBudgetId));
        setDeleteBudgetId(null);
      } catch (error) {
        console.error("Error deleting budget:", error);
      }
    }
  };

  return (
    <div className="text-center p-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to Your Budget Overview</h1>
      <hr className="w-2/3 mx-auto mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!creatingBudget ? (
          <button
            onClick={() => setCreatingBudget(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
          >
            <span className="mr-2 text-xl">+</span> Create New Monthly Budget
          </button>
        ) : (
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="Budget Name"
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              className="mb-2 px-2 py-1 border rounded"
            />
            <input
              type="number"
              placeholder="Month (1-12)"
              value={month || ""}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="mb-2 px-2 py-1 border rounded"
            />
            <input
              type="number"
              placeholder="Year"
              value={year || ""}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="mb-2 px-2 py-1 border rounded"
            />
            <button
              onClick={handleCreateNewBudget}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Create Budget
            </button>
          </div>
        )}

        {budgets.map((budget) => (
          <div key={budget._id} className="flex items-center">
            <button
              onClick={() => handleSelectBudget(budget._id)}
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded flex-grow"
            >
              Budget for {new Date(budget.year, budget.month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
            </button>
            <button
              onClick={() => setDeleteBudgetId(budget._id)}
              className="ml-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {deleteBudgetId && (
        <DeleteConfirmationModal
          onConfirm={handleDeleteBudget}
          onCancel={() => setDeleteBudgetId(null)}
        />
      )}
    </div>
  );
};

export default WelcomePage;
