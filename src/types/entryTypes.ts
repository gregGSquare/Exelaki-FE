import { Category } from "./categoryTypes";

export interface Entry {
  [x: string]: any;
  _id: string;
  name: string;
  amount: number;
  category: Category;
  date: string;
}
