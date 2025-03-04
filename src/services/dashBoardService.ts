import api from "./axios";
import { handleApiError } from "../utils/errorHandler";

export const fetchCategories = async () => {
  try {
    const response = await api.get("/categories");
    
    // Check if the data is nested inside a 'data' property
    const categoriesData = response.data.data || response.data;
    
    return categoriesData;
  } catch (error) {
    const processedError = handleApiError(error);
    throw processedError;
  }
};

export const fetchEntries = async (budgetId: string) => {
  try {
    const response = await api.get(`/entries?budgetId=${budgetId}`);
    
    // Check if the data is nested inside a 'data' property
    const entriesData = response.data.data || response.data;
    
    return entriesData;
  } catch (error) {
    const processedError = handleApiError(error);
    
    // Propagate the error with status code for retry logic
    throw processedError;
  }
};

export const deleteEntry = async (id: string) => {
  try {
    const response = await api.delete(`/entries/${id}`);
    if (!response.status.toString().startsWith("2")) {
      throw new Error(`Failed to delete entry`);
    }
  } catch (error) {
    const processedError = handleApiError(error);
    throw processedError;
  }
};

export const editEntry = async (id: string, updatedEntry: any) => {
  try {
    const response = await api.put(`/entries/${id}`, updatedEntry);
    if (!response.status.toString().startsWith("2")) {
      throw new Error(`Failed to edit entry`);
    }
    
    // Check if the data is nested inside a 'data' property
    const entryData = response.data.data || response.data;
    
    return entryData;
  } catch (error) {
    const processedError = handleApiError(error);
    throw processedError;
  }
};

export const fetchFinancialIndicators = async (budgetId: string) => {
  // Validate budget ID
  if (!budgetId || budgetId === 'undefined' || budgetId === 'null') {
    return {
      totalScore: { value: "N/A", status: "GOOD" },
      debtToIncomeRatio: { value: "N/A", status: "GOOD" },
      savingsRate: { value: "N/A", status: "GOOD" },
      carCostRatio: { value: "N/A", status: "GOOD" },
      homeCostRatio: { value: "N/A", status: "GOOD" },
      expenseDistribution: []
    };
  }

  try {
    const response = await api.get(`/financial-indicators/${budgetId}`);
    
    // Check if the data is nested inside a 'data' property
    const indicatorsData = response.data.data || response.data;
    
    // Ensure expenseDistribution is always an array
    if (!indicatorsData.expenseDistribution) {
      indicatorsData.expenseDistribution = [];
    }
    
    return indicatorsData;
  } catch (error) {
    // Process the error
    const processedError = handleApiError(error);
    
    // If it's a 404, propagate it for retry logic
    if (processedError.statusCode === 404) {
      throw processedError;
    }
    
    // For other errors, return default structure
    return {
      totalScore: { value: "N/A", status: "GOOD" },
      debtToIncomeRatio: { value: "N/A", status: "GOOD" },
      savingsRate: { value: "N/A", status: "GOOD" },
      carCostRatio: { value: "N/A", status: "GOOD" },
      homeCostRatio: { value: "N/A", status: "GOOD" },
      expenseDistribution: []
    };
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    if (!response.status.toString().startsWith("2")) {
      throw new Error(`Failed to delete category`);
    }
  } catch (error) {
    const processedError = handleApiError(error);
    throw processedError;
  }
};
