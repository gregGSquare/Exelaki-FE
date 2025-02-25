export interface Budget {
  _id: string;
  name: string;
  month: number;
  year: number;
  currency: string;
  budgetType: string;
  description?: string;
  createdAt: string;
  currencyCode: string;
} 