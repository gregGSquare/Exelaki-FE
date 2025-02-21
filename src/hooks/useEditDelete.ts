import { useState } from "react";
import { deleteEntry, editEntry } from "../services/dashBoardService";
import { Entry } from "../types/entryTypes";
import { CategoryType } from "../types/categoryTypes";

export const useEditDelete = (fetchData: () => void) => {
  const [editEntryState, setEditEntryState] = useState<Entry | null>(null);

  const handleDelete = async (id: string, type: CategoryType) => {
    try {
      await deleteEntry(id);  // Unified delete function
      fetchData(); // Refresh data after deletion
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const handleEdit = (entry: Entry, entryType: CategoryType) => {
    setEditEntryState({ ...entry, category: { type: entryType, _id: entry.category._id, name: entry.category.name, user: entry.category.user } });
  };

  const handleEditSubmit = async () => {
    if (!editEntryState) return;

    try {
      await editEntry(editEntryState._id, editEntryState); // Unified edit function
      setEditEntryState(null);
      fetchData(); // Refresh data after editing
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
