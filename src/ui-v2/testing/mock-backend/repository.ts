import { Category, CategoryType } from "../../../types/categoryTypes";
import { Entry, EntryFlexibility, EntryRecurrence, EntryTags, EntryType } from "../../../types/entryTypes";

// In-memory mock storage. Replace with real API later.
type Id = string;

const randomId = () => Math.random().toString(36).slice(2, 10);

interface Scenario {
  _id: Id;
  budgetId: Id;
  name: string;
  createdAt: string;
  overrides: Record<string, number>; // entryId -> overridden amount
}

const db = {
  categories: [] as Category[],
  entries: [] as Entry[],
  scenarios: [] as Scenario[],
};

// Seed defaults on first import
(() => {
  if (db.categories.length === 0) {
    const defaults: Array<{ name: string; type: CategoryType; defaultCategory?: boolean }> = [
      { name: "Rent", type: "EXPENSE", defaultCategory: true },
      { name: "Groceries", type: "EXPENSE", defaultCategory: true },
      { name: "Insurances", type: "EXPENSE", defaultCategory: true },
      { name: "Subscriptions", type: "EXPENSE", defaultCategory: true },
      { name: "Car", type: "EXPENSE", defaultCategory: true },
      { name: "Utilities", type: "EXPENSE", defaultCategory: true },
      { name: "Loans and Credit card debt", type: "EXPENSE", defaultCategory: true },
      { name: "General Income", type: "INCOME", defaultCategory: true },
      { name: "General Savings", type: "SAVING", defaultCategory: true },
    ];
    db.categories = defaults.map((d) => ({ _id: randomId(), name: d.name, type: d.type, user: null, defaultCategory: d.defaultCategory }));
  }
  // Seed sample entries for demo budget
  if (db.entries.length === 0) {
    const demoBudgetId = 'mock';
    const incomeCat = db.categories.find(c => c.type === 'INCOME');
    const savingCat = db.categories.find(c => c.type === 'SAVING');
    const groceries = db.categories.find(c => c.name === 'Groceries');
    const rent = db.categories.find(c => c.name === 'Rent');
    if (incomeCat) {
      db.entries.push({
        _id: randomId(),
        name: 'Salary',
        amount: 3200,
        categoryId: incomeCat._id,
        budgetId: demoBudgetId,
        flexibility: 'FIXED',
        recurrence: 'MONTHLY',
        tags: [EntryTags.MISC],
        category: incomeCat,
        type: 'INCOME',
      } as Entry);
    }
    if (savingCat) {
      db.entries.push({
        _id: randomId(),
        name: 'Emergency fund',
        amount: 300,
        categoryId: savingCat._id,
        budgetId: demoBudgetId,
        flexibility: 'FIXED',
        recurrence: 'MONTHLY',
        tags: [EntryTags.MISC],
        category: savingCat,
        type: 'SAVING',
      } as Entry);
    }
    if (rent) {
      db.entries.push({
        _id: randomId(),
        name: 'Rent',
        amount: 1200,
        categoryId: rent._id,
        budgetId: demoBudgetId,
        dueDayOfMonth: 1,
        flexibility: 'FIXED',
        recurrence: 'MONTHLY',
        tags: [EntryTags.HOUSING],
        category: rent,
        type: 'EXPENSE',
      } as Entry);
    }
    if (groceries) {
      db.entries.push({
        _id: randomId(),
        name: 'Groceries',
        amount: 400,
        categoryId: groceries._id,
        budgetId: demoBudgetId,
        flexibility: 'FLEXIBLE',
        recurrence: 'MONTHLY',
        tags: [EntryTags.FOOD],
        category: groceries,
        type: 'EXPENSE',
      } as Entry);
    }
  }
})();

// Repository API — mirrors likely backend endpoints
export const mockRepository = {
  categories: {
    async list(): Promise<Category[]> {
      return [...db.categories];
    },
    async create(input: { name: string; type: CategoryType }): Promise<Category> {
      const c: Category = { _id: randomId(), name: input.name, type: input.type, user: null };
      db.categories.push(c);
      return c;
    },
    async remove(categoryId: Id): Promise<void> {
      db.categories = db.categories.filter((c) => c._id !== categoryId);
      db.entries = db.entries.filter((e) => e.category._id !== categoryId);
    },
  },
  entries: {
    async list(budgetId?: Id): Promise<Entry[]> {
      const data = budgetId ? db.entries.filter((e) => e.budgetId === budgetId) : db.entries;
      return data.map((e) => ({ ...e }));
    },
    async create(input: {
      name: string;
      amount: number;
      categoryId: Id;
      budgetId: Id;
      type: EntryType;
      dueDayOfMonth?: number;
      flexibility: EntryFlexibility;
      recurrence: EntryRecurrence;
      tags: EntryTags[];
    }): Promise<Entry> {
      const category = db.categories.find((c) => c._id === input.categoryId);
      if (!category) throw new Error("Category not found");
      const e: Entry = {
        _id: randomId(),
        name: input.name,
        amount: input.amount,
        categoryId: input.categoryId,
        budgetId: input.budgetId,
        dueDayOfMonth: input.dueDayOfMonth,
        flexibility: input.flexibility,
        recurrence: input.recurrence,
        tags: input.tags,
        category,
        type: input.type,
      };
      db.entries.push(e);
      return e;
    },
    async update(entryId: Id, update: Partial<Omit<Entry, "_id" | "category">> & { categoryId?: Id }): Promise<Entry> {
      const idx = db.entries.findIndex((e) => e._id === entryId);
      if (idx === -1) throw new Error("Entry not found");
      const current = db.entries[idx];
      let category = current.category;
      if (update.categoryId && update.categoryId !== current.categoryId) {
        const cat = db.categories.find((c) => c._id === update.categoryId);
        if (!cat) throw new Error("Category not found");
        category = cat;
      }
      const next: Entry = { ...current, ...update, categoryId: update.categoryId ?? current.categoryId, category } as Entry;
      db.entries[idx] = next;
      return next;
    },
    async remove(entryId: Id): Promise<void> {
      db.entries = db.entries.filter((e) => e._id !== entryId);
    },
  },
  scenarios: {
    async list(budgetId?: Id): Promise<Scenario[]> {
      return budgetId ? db.scenarios.filter((s) => s.budgetId === budgetId) : [...db.scenarios];
    },
    async create(input: { budgetId: Id; name: string }): Promise<Scenario> {
      const s: Scenario = { _id: randomId(), budgetId: input.budgetId, name: input.name, createdAt: new Date().toISOString(), overrides: {} };
      db.scenarios.push(s);
      return s;
    },
    async update(id: Id, update: Partial<Scenario>): Promise<Scenario> {
      const idx = db.scenarios.findIndex((s) => s._id === id);
      if (idx === -1) throw new Error("Scenario not found");
      db.scenarios[idx] = { ...db.scenarios[idx], ...update };
      return db.scenarios[idx];
    },
    async remove(id: Id): Promise<void> {
      db.scenarios = db.scenarios.filter((s) => s._id !== id);
    },
  },
};


