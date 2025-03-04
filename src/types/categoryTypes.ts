export interface Category {
  _id: string;
  name: string;
  type: CategoryType;
  user: string | null;
  defaultCategory?: boolean;
}

export type CategoryType = "INCOME" | "EXPENSE" | "SAVING";
