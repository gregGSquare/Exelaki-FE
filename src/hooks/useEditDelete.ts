import { useState } from "react";
import { deleteEntry, editEntry } from "../services/dashBoardService";
import { Entry } from "../types/entryTypes";
import { CategoryType } from "../types/categoryTypes";
import { loadFinancialIndicators } from "../services/financialIndicatorsService";

export const useEditDelete = (fetchData: () => void, budgetId: string, setFinancialIndicators: (indicators: any) => void) => {
  const [editEntryState, setEditEntryState] = useState<Entry | null>(null);

  const handleDelete = async (id: string, type: CategoryType) => {
    try {
      await deleteEntry(id);  // Unified delete function
      await fetchData(); // Refresh data after deletion
      const indicators = await loadFinancialIndicators(budgetId);
      setFinancialIndicators(indicators);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const handleEdit = (entry: Entry, entryType: CategoryType) => {
    console.log('entry + entryType', entry, entryType);
    setEditEntryState({ ...entry, category: { type: entryType, _id: entry.category._id, name: entry.category.name, user: entry.category.user } });
  };

  const handleEditSubmit = async () => {
    if (!editEntryState) return;

    try {
      const payload = {
        ...editEntryState,
        type: editEntryState.category.type,
        categoryId: editEntryState.category._id
      };
      
      await editEntry(editEntryState._id, payload);
      setEditEntryState(null);
      await fetchData();
      const indicators = await loadFinancialIndicators(budgetId);
      setFinancialIndicators(indicators);
    } catch (error) {
      console.error("Error editing entry:", error);
    }
  };

  return {
    editEntry: editEntryState,
    handleEdit,
    handleDelete,
    handleEditSubmit,
    setEditEntry: setEditEntryState,
  };
};
