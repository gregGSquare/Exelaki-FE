import { useState, useEffect } from "react";
import { fetchEntries } from "../services/dashBoardService";
import { Entry } from "../types/entryTypes";

export const useFetchData = (budgetId: string) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  const fetchData = async () => {
    try {
      const fetchedEntries = await fetchEntries(budgetId); // Pass budgetId to fetch relevant entries
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (budgetId) {
      fetchData();
    }
  }, [budgetId]);

  const incomes = entries.filter(entry => entry.category.type === 'IN');
  const expenses = entries.filter(entry => entry.category.type === 'OUT');

  return { entries, incomes, expenses, fetchData, setEntries };
};
