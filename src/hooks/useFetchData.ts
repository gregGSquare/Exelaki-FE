import { useState, useEffect, useRef } from "react";
import { fetchEntries } from "../services/dashBoardService";
import { Entry } from "../types/entryTypes";
import { handleApiError } from "../utils/errorHandler";
import { useNotification } from "../contexts/NotificationContext";

export const useFetchData = (budgetId: string) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const { showNotification } = useNotification();
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  const fetchData = async () => {
    // Add validation to prevent API calls with invalid budget IDs
    if (!budgetId || budgetId === 'undefined' || budgetId === 'null') {
      return;
    }

    try {
      const fetchedEntries = await fetchEntries(budgetId);
      // Map categoryId to category
      const mappedEntries = fetchedEntries.map((entry: Entry) => ({
        ...entry,
        category: entry.categoryId
      }));
      setEntries(mappedEntries);
      // Reset retry count on success
      retryCountRef.current = 0;
    } catch (error) {
      const processedError = handleApiError(error);
      
      // If we get a 404 and haven't exceeded max retries, try again
      if (processedError.statusCode === 404 && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        // Don't show notification for retries to avoid spamming the user
        setTimeout(fetchData, retryDelay);
      } else {
        showNotification(`Failed to fetch entries: ${processedError.message}`, 'error');
      }
    }
  };

  useEffect(() => {
    if (budgetId && budgetId !== 'undefined' && budgetId !== 'null') {
      // Reset retry count when budget ID changes
      retryCountRef.current = 0;
      fetchData();
    }
  }, [budgetId]);

  const incomes = entries.filter(entry => entry.category?.type === 'INCOME');
  const expenses = entries.filter(entry => entry.category?.type === 'EXPENSE');
  const savings = entries.filter(entry => entry.category?.type === 'SAVING');

  return { entries, incomes, expenses, savings, fetchData, setEntries };
};
