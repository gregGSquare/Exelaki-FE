import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEntries, fetchCategories } from "../../services/dashBoardService";
import { Entry } from "../../types/entryTypes";

export const useEntriesData = () => {
  const { id } = useParams<{ id: string }>();
  const budgetId = id || "demo";
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ents, cats] = await Promise.all([
          fetchEntries(budgetId),
          fetchCategories(),
        ]);
        const catMap: Record<string, any> = {};
        // API returns an object with incomeCategories/expenseCategories/savingCategories
        if (cats?.incomeCategories || cats?.expenseCategories || cats?.savingCategories) {
          [...(cats.incomeCategories || []), ...(cats.expenseCategories || []), ...(cats.savingCategories || [])]
            .forEach((c: any) => { if (c && c._id) catMap[c._id] = c; });
        } else if (Array.isArray(cats)) {
          cats.forEach((c: any) => { if (c && c._id) catMap[c._id] = c; });
        }

        const normalized = (ents || []).map((e: any) => {
          const category = typeof e.category === 'object' && e.category ? e.category : (catMap[e.categoryId] || (e.categoryId ? { _id: e.categoryId, name: 'Uncategorized', type: 'EXPENSE', user: null } : undefined));
          return { ...e, category };
        });
        setEntries(normalized);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [budgetId]);

  const totals = useMemo(() => {
    const income = entries.filter(e => e.type === 'INCOME').reduce((s, e) => s + Number(e.amount), 0);
    const expenses = entries.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + Number(e.amount), 0);
    const savings = entries.filter(e => e.type === 'SAVING').reduce((s, e) => s + Number(e.amount), 0);
    const balance = income - expenses - savings;
    return { income, expenses, savings, balance };
  }, [entries]);

  const expensesByCategory = useMemo(() => {
    const map: Record<string, { id: string; name: string; total: number }> = {};
    for (const e of entries) {
      if (e.type !== 'EXPENSE') continue;
      const id = e.category._id;
      if (!map[id]) map[id] = { id, name: e.category.name, total: 0 };
      map[id].total += Number(e.amount);
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [entries]);

  return { loading, entries, totals, expensesByCategory };
};


