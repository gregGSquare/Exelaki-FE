export interface Category {
  _id: string;
  name: string;
  type: CategoryType;
  user: string | null;
}

export type CategoryType = "INCOME" | "EXPENSE" | "SAVING";
