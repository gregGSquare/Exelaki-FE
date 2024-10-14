import { useState, useEffect } from "react";
import { fetchCategories } from "../services/dashBoardService";
import { Category } from "../types/categoryTypes";

const useFetchCategories = () => {
  const [inCategories, setInCategories] = useState<Category[]>([]);
  const [outCategories, setOutCategories] = useState<Category[]>([]);

  const fetchCategoriesData = async () => {
    try {
      const fetchedCategories = await fetchCategories();

      // Separate categories based on type
      setInCategories(fetchedCategories.inCategories || []);
      setOutCategories(fetchedCategories.outCategories || []);
    } catch (error) {
      console.error("Error fetching Category data:", error);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  return { inCategories, outCategories };
};

export default useFetchCategories;
