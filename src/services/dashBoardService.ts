import api from "./axios";
import { handleApiError } from "../utils/errorHandler";

export const fetchCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    const processedError = handleApiError(error);
    throw processedError;
  }
};

export const fetchEntries = async (budgetId: string) => {
  try {
    const response = await api.get(`/entries?budgetId=${budgetId}`);
    return response.data;
  } catch (error) {
    const processedError = handleApiError(error);
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
    return response.data;
  } catch (error) {
    const processedError = handleApiError(error);
    throw processedError;
  }
};

export const fetchFinancialIndicators = async (budgetId: string) => {
  try {
    const response = await api.get(`/financial-indicators/${budgetId}`);
    
    // Ensure expenseDistribution is always an array
    if (!response.data.expenseDistribution) {
      response.data.expenseDistribution = [];
    }
    
    return response.data;
  } catch (error) {
    // Process the error but still return default values
    handleApiError(error);
    
    // Return default structure on error
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
