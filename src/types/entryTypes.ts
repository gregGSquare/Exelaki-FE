import { Category } from "./categoryTypes";

export type EntryFlexibility = 'FIXED' | 'FLEXIBLE' | 'OPTIONAL';
export type EntryRecurrence = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
export type EntryTags = 'HOUSING' | 'UTILITIES' | 'TRANSPORTATION' | 'FOOD' | 'DEBT' | 'INSURANCE' | 'SUBSCRIPTION' | 'ENTERTAINMENT' | 'MEDICAL' | 'MISC';
export type EntryType = 'EXPENSE' | 'INCOME' | 'SAVING';

export interface Entry {
  _id: string;
  name: string;
  amount: number;
  categoryId: string;
  budgetId: string;
  dueDayOfMonth?: number;
  flexibility: EntryFlexibility;
  recurrence: EntryRecurrence;
  tags: EntryTags[];
  category: Category;
  type: EntryType;
}

export interface CreateEntryPayload {
  name: string;
  amount: number;
  categoryId: string;
  type: EntryType;
  budgetId: string;
  dueDayOfMonth?: number;
  flexibility: EntryFlexibility;
  recurrence: EntryRecurrence;
  tags: EntryTags[];
}
