export interface Category {
  _id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "SAVING";
  user: string | null;
}
