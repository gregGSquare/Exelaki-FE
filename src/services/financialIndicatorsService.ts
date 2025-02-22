import api from "./axios";
import { fetchFinancialIndicators } from "./dashBoardService";

export const loadFinancialIndicators = async (budgetId: string) => {
  try {
    const indicators = await fetchFinancialIndicators(budgetId);
    return indicators;
  } catch (error) {
    console.error("Error fetching financial indicators:", error);
    throw error;
  }
}; 