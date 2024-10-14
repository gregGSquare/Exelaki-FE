import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddEntry from "../components/AddEntry";
import { useFetchData } from "../hooks/useFetchData";
import { useEditDelete } from "../hooks/useEditDelete";
import useFetchCategories from "../hooks/useFetchCategories";
import CategoryTables from "../components/CategoryTables";
import SummaryTable from "../components/SummaryTable";
import OverviewTable from "../components/OverviewTable";
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

  return (
    <div className="p-4">
      <h1 className="text-3xl mb-4">Dashboard</h1>
      <h2 className="text-xl mb-4">Current Budget: {budgetName}</h2>

      {editEntry && (
        <div>
          <h2>Edit Entry</h2>
          <input
            type="text"
            value={editEntry.name}
            onChange={(e) =>
              setEditEntry({ ...editEntry, name: e.target.value })
            }
          />
          <input
            type="number"
            value={editEntry.amount}
            onChange={(e) =>
              setEditEntry({ ...editEntry, amount: +e.target.value })
            }
          />
          <button onClick={handleEditSubmit}>Save</button>
          <button onClick={() => setEditEntry(null)}>Cancel</button>
        </div>
      )}
      <OverviewTable incomes={incomes} expenses={expenses} />

      <SummaryTable entries={[...incomes, ...expenses]} />
      {/* Add Entries for both Income and Expense */}
      <AddEntry onAdd={fetchData} categories={[...inCategories, ...outCategories]} />

      {/* Category Tables */}
      <CategoryTables
        entries={incomes}
        entryType="IN"
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <CategoryTables
        entries={expenses}
        entryType="OUT"
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default Dashboard;
