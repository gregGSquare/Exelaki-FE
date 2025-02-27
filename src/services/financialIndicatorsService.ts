import api from "./axios";
import { fetchFinancialIndicators } from "./dashBoardService";
import { handleApiError } from "../utils/errorHandler";

export const loadFinancialIndicators = async (budgetId: string) => {
  try {
    const indicators = await fetchFinancialIndicators(budgetId);
    return indicators;
  } catch (error) {
    const processedError = handleApiError(error);
    throw processedError;
  }
}; 