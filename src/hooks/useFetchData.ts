import { useState, useEffect } from "react";
import { fetchEntries } from "../services/dashBoardService";
import { Entry } from "../types/entryTypes";
import { handleApiError } from "../utils/errorHandler";
import { useNotification } from "../contexts/NotificationContext";

export const useFetchData = (budgetId: string) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const { showNotification } = useNotification();

  const fetchData = async () => {
    try {
      const fetchedEntries = await fetchEntries(budgetId);
      // Map categoryId to category
      const mappedEntries = fetchedEntries.map((entry: Entry) => ({
        ...entry,
        category: entry.categoryId
      }));
      setEntries(mappedEntries);
    } catch (error) {
      const processedError = handleApiError(error);
      showNotification(`Failed to fetch entries: ${processedError.message}`, 'error');
    }
  };

  useEffect(() => {
    if (budgetId) {
      fetchData();
    }
  }, [budgetId]);

  const incomes = entries.filter(entry => entry.category?.type === 'INCOME');
  const expenses = entries.filter(entry => entry.category?.type === 'EXPENSE');
  const savings = entries.filter(entry => entry.category?.type === 'SAVING');

  return { entries, incomes, expenses, savings, fetchData, setEntries };
};
