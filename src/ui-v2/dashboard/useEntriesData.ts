import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { mockRepository } from "../testing/mock-backend/repository";
import { Entry } from "../../types/entryTypes";
import { usePreferences } from "../state/PreferencesContext";
import { formatCurrency } from "../../utils/currency";

export const useEntriesData = () => {
  const { id } = useParams<{ id: string }>();
  const budgetId = id || "demo";
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ents = await mockRepository.entries.list(budgetId);
      setEntries(ents);
      setLoading(false);
    };
    load();
  }, [budgetId]);

  const { currencyCode } = usePreferences();
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


