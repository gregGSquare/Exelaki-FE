import api from "./axios";
import { fetchFinancialIndicators } from "./dashBoardService";
import { handleApiError } from "../utils/errorHandler";
import { ExpenseDistribution } from "../types/entryTypes";

// Define interface for financial indicators
interface FinancialIndicator {
  value: string;
  status: string;
  amount?: string;
}

interface FinancialIndicators {
  totalScore: FinancialIndicator;
  debtToIncomeRatio: FinancialIndicator;
  savingsRate: FinancialIndicator;
  carCostRatio: FinancialIndicator;
  homeCostRatio: FinancialIndicator;
  fixedExpenses: FinancialIndicator;
  expenseDistribution: ExpenseDistribution[];
}

export const loadFinancialIndicators = async (budgetId: string, retryCount = 0, maxRetries = 3): Promise<FinancialIndicators> => {
  // Prevent calling API with undefined budgetId
  if (!budgetId || budgetId === 'undefined') {
    return {
      totalScore: { value: "N/A", status: "GOOD" },
      debtToIncomeRatio: { value: "N/A", status: "GOOD" },
      savingsRate: { value: "N/A", status: "GOOD" },
      carCostRatio: { value: "N/A", status: "GOOD" },
      homeCostRatio: { value: "N/A", status: "GOOD" },
      fixedExpenses: { value: "N/A", status: "GOOD" },
      expenseDistribution: []
    };
  }

  try {
    const indicators = await fetchFinancialIndicators(budgetId);
    return indicators;
  } catch (error) {
    const processedError = handleApiError(error);
    
    // If we get a 404 and haven't exceeded max retries, try again
    if (processedError.statusCode === 404 && retryCount < maxRetries) {
      // Wait for a second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Retry with incremented count
      return loadFinancialIndicators(budgetId, retryCount + 1, maxRetries);
    }
    
    throw processedError;
  }
}; 