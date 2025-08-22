import { mockRepository } from "../testing/mock-backend/repository";
import { Entry } from "../../types/entryTypes";
import { Category } from "../../types/categoryTypes";

export const budgetRepository = {
  async listEntries(budgetId?: string): Promise<Entry[]> {
    return mockRepository.entries.list(budgetId);
  },
  async createEntry(payload: any): Promise<Entry> {
    return mockRepository.entries.create(payload);
  },
  async updateEntry(id: string, payload: any): Promise<Entry> {
    return mockRepository.entries.update(id, payload);
  },
  async deleteEntry(id: string): Promise<void> {
    return mockRepository.entries.remove(id);
  },
  async listCategories(): Promise<Category[]> {
    return mockRepository.categories.list();
  },
  async createCategory(name: string, type: Category["type"]): Promise<Category> {
    return mockRepository.categories.create({ name, type });
  },
};


