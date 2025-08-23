import React, { useEffect, useState } from "react";
import AppShell from "../layout/AppShell";
import { LayoutProvider } from "../state/LayoutContext";
import { useParams } from "react-router-dom";
import { mockRepository } from "../testing/mock-backend/repository";
import { Entry } from "../../types/entryTypes";
import { usePreferences } from "../state/PreferencesContext";
import { formatCurrency } from "../../utils/currency";

interface ScenarioView {
  _id: string;
  name: string;
  createdAt: string;
  overrides: Record<string, number>;
}

const Projections: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const budgetId = id || "demo";
  const [entries, setEntries] = useState<Entry[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioView[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const { currencyCode } = usePreferences();

  useEffect(() => {
    const init = async () => {
      const ents = await mockRepository.entries.list(budgetId);
      setEntries(ents);
      // Temporary: use backend when available; for now keep empty scenario list until API exists
      const sc: any[] = [];
      setScenarios(sc);
      if (sc.length) setActiveId(sc[0]._id);
    };
    init();
  }, [budgetId]);

  const active = scenarios.find(s => s._id === activeId) || null;

  const totalIncome = entries.filter(e => e.type === 'INCOME').reduce((s, e) => s + (active?.overrides[e._id] ?? e.amount), 0);
  const totalExpenses = entries.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + (active?.overrides[e._id] ?? e.amount), 0);
  const totalSavings = entries.filter(e => e.type === 'SAVING').reduce((s, e) => s + (active?.overrides[e._id] ?? e.amount), 0);
  const balance = totalIncome - totalExpenses - totalSavings;

  const createScenario = async () => {
    // Placeholder: when backend endpoint exists, replace with POST /scenarios
    const newScenario: any = { _id: Math.random().toString(36).slice(2), budgetId, name: name || `Scenario ${scenarios.length + 1}`, createdAt: new Date().toISOString(), overrides: {} };
    const sc = [newScenario, ...scenarios];
    setScenarios(sc);
    setActiveId(newScenario._id);
    setName("");
  };

  const setOverride = async (entryId: string, value: number) => {
    if (!active) return;
    const updated = { ...active.overrides, [entryId]: value };
    // Placeholder: when backend endpoint exists, replace with PUT /scenarios/:id
    const next = scenarios.map(s => s._id === active._id ? { ...s, overrides: updated } : s);
    setScenarios(next);
  };

  return (
    <LayoutProvider>
      <AppShell>
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 bg-white border border-neutral-200 rounded-xl p-4 dark:bg-neutral-900/80 dark:border-neutral-800">
          <h2 className="text-lg font-semibold mb-3">Projections</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded bg-neutral-50 border border-neutral-200 p-3 dark:bg-neutral-800/80 dark:border-neutral-700">
              <div className="text-neutral-500 dark:text-neutral-400">Income</div>
              <div className="text-xl font-semibold">{formatCurrency(totalIncome, currencyCode)}</div>
            </div>
            <div className="rounded bg-neutral-50 border border-neutral-200 p-3 dark:bg-neutral-800/80 dark:border-neutral-700">
              <div className="text-neutral-500 dark:text-neutral-400">Expenses</div>
              <div className="text-xl font-semibold">{formatCurrency(totalExpenses, currencyCode)}</div>
            </div>
            <div className="rounded bg-neutral-50 border border-neutral-200 p-3 dark:bg-neutral-800/80 dark:border-neutral-700">
              <div className="text-neutral-500 dark:text-neutral-400">Balance</div>
              <div className={`text-xl font-semibold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(balance, currencyCode)}</div>
            </div>
          </div>
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead className="text-neutral-500 border-b border-neutral-200 dark:text-neutral-400 dark:border-neutral-800">
                <tr>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left">Type</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Override</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e._id} className="border-b border-neutral-100 dark:border-neutral-900">
                    <td className="py-2">{e.name}</td>
                    <td className="text-neutral-400">{e.type}</td>
                    <td className="text-right">{formatCurrency(Number(e.amount), currencyCode)}</td>
                    <td className="text-right">
                      {active ? (
                        <input type="number" className="w-28 bg-white border border-neutral-300 rounded p-1 text-sm text-right dark:bg-neutral-800 dark:border-neutral-700" value={active.overrides[e._id] ?? e.amount} onChange={(ev) => setOverride(e._id, parseFloat(ev.target.value || '0'))} />
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 dark:bg-neutral-900/80 dark:border-neutral-800">
          <h3 className="text-base font-semibold mb-2">Scenarios</h3>
          <div className="space-y-2">
            {scenarios.map(s => (
              <button key={s._id} className={`w-full text-left px-3 py-2 rounded border ${activeId === s._id ? 'border-primary-500 bg-neutral-100 dark:bg-neutral-800' : 'border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800'}`} onClick={() => setActiveId(s._id)}>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{new Date(s.createdAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="block text-xs mb-1">New scenario name</label>
            <input className="w-full bg-white border border-neutral-300 rounded p-2 text-sm dark:bg-neutral-800 dark:border-neutral-700" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="mt-2 w-full px-3 py-2 rounded bg-primary-600 text-white" onClick={createScenario}>Create Scenario</button>
          </div>
        </div>
      </div>
      </AppShell>
    </LayoutProvider>
  );
};

export default Projections;


