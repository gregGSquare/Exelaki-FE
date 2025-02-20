import { useState, useEffect } from "react";
import { fetchCategories } from "../services/dashBoardService";
import { Category } from "../types/categoryTypes";

const useFetchCategories = () => {
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [savingCategories, setSavingCategories] = useState<Category[]>([]);

  const fetchCategoriesData = async () => {
    try {
      const response = await fetchCategories();
      
      // The API returns an object with separate category arrays
      const { incomeCategories: income, expenseCategories: expense, savingCategories: saving } = response;

      console.log('Setting categories from API:', {
        income,
        expense,
        saving
      });

      setIncomeCategories(income || []);
      setExpenseCategories(expense || []);
      setSavingCategories(saving || []);
    } catch (error) {
      console.error("Error fetching Category data:", error);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  return { incomeCategories, expenseCategories, savingCategories };
};

export default useFetchCategories;
