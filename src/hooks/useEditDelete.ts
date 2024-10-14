import { useState } from "react";
import { deleteEntry, editEntry } from "../services/dashBoardService";
import { Entry } from "../types/entryTypes";

export const useEditDelete = (fetchData: () => void) => {
  const [editEntryState, setEditEntryState] = useState<Entry | null>(null);

  const handleDelete = async (id: string, type: "IN" | "OUT") => {
    try {
      console.log("in the handle delete: ", id, type);
      await deleteEntry(id);  // Unified delete function
      fetchData(); // Refresh data after deletion
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const handleEdit = (entry: Entry, entryType: "IN" | "OUT") => {
    setEditEntryState({ ...entry, type: entryType });
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
