import { useState, useEffect } from "react";
import { fetchEntries } from "../services/dashBoardService";
import { Entry } from "../types/entryTypes";

export const useFetchData = (budgetId: string) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  const fetchData = async () => {
    try {
      const fetchedEntries = await fetchEntries(budgetId);
      console.log('API returned entries:', fetchedEntries);
      // Map categoryId to category
      const mappedEntries = fetchedEntries.map((entry: Entry) => ({
        ...entry,
        category: entry.categoryId
      }));
      setEntries(mappedEntries);
    } catch (error) {
      console.error("Error fetching data:", error);
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
