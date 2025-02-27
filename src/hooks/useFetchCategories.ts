import { useState, useEffect } from "react";
import { fetchCategories } from "../services/dashBoardService";
import { Category } from "../types/categoryTypes";
import { useNotification } from "../contexts/NotificationContext";

const useFetchCategories = () => {
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [savingCategories, setSavingCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();

  const fetchCategoriesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCategories();
      
      // The API returns an object with separate category arrays
      const { incomeCategories: income, expenseCategories: expense, savingCategories: saving } = response;

      setIncomeCategories(income || []);
      setExpenseCategories(expense || []);
      setSavingCategories(saving || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load categories";
      setError(errorMessage);
      showNotification("Failed to load categories. Some features may not work correctly.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  return { incomeCategories, expenseCategories, savingCategories, error, loading, refetch: fetchCategoriesData };
};

export default useFetchCategories;

