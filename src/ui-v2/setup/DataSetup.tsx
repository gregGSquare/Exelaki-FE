import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../layout/AppShell";
import { LayoutProvider } from "../state/LayoutContext";
import { Category, CategoryType } from "../../types/categoryTypes";
import { Entry, EntryFlexibility, EntryRecurrence, EntryTags, EntryType } from "../../types/entryTypes";
import { fetchCategories as beFetchCategories, fetchEntries as beFetchEntries, deleteCategory as beDeleteCategory } from "../../services/dashBoardService";
import api from "../../services/axios";
import { useParams } from "react-router-dom";

const Section: React.FC<{ title: string; children: React.ReactNode; accent?: string }> = ({ title, children, accent = "primary" }) => (
  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden dark:bg-neutral-900/80 dark:border-neutral-800">
    <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

type EntryDraft = {
  name: string;
  amount: string;
  type: EntryType;
  categoryId: string;
  dueDayOfMonth?: string;
  flexibility: EntryFlexibility;
  recurrence: EntryRecurrence;
  tags: EntryTags[];
};

const emptyDraft: EntryDraft = {
  name: "",
  amount: "",
  type: "INCOME",
  categoryId: "",
  flexibility: "FIXED",
  recurrence: "MONTHLY",
  tags: [EntryTags.MISC],
};

const DataSetup: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const budgetId = id || "demo";
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<EntryDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customCategoryMode, setCustomCategoryMode] = useState<boolean>(false);
  const [customCategoryName, setCustomCategoryName] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const catsResp = await beFetchCategories();
      const flatCats: Category[] = (catsResp && (catsResp as any).incomeCategories)
        ? ([...((catsResp as any).incomeCategories || []), ...((catsResp as any).expenseCategories || []), ...((catsResp as any).savingCategories || [])])
        : (Array.isArray(catsResp) ? catsResp as any : []);
      setCategories(flatCats);
      const ents = await beFetchEntries(budgetId);
      const catMap: Record<string, Category> = Object.fromEntries(flatCats.map(c => [c._id, c]));
      const normalized = (ents || []).map((e: any) => ({ ...e, category: e.category || catMap[e.categoryId] }));
      setEntries(normalized as any);
      setLoading(false);
    };
    load();
  }, [budgetId]);

  const typeCategories = useMemo(() => ({
    INCOME: categories.filter(c => c.type === "INCOME"),
    EXPENSE: categories.filter(c => c.type === "EXPENSE"),
    SAVING: categories.filter(c => c.type === "SAVING"),
  }), [categories]);

  const validate = (): string | null => {
    if (!draft.name || !draft.amount) return "Name and amount are required";
    if (draft.type === "EXPENSE" && !draft.categoryId) return "Expense requires a category";
    if (draft.type === "EXPENSE" && draft.tags.length === 0) return "Expense requires at least one tag";
    return null;
  };

  const resetDraft = () => setDraft({ ...emptyDraft, categoryId: typeCategories[draft.type][0]?._id || "", type: draft.type });

  const submit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError(null);
    let categoryIdToUse = draft.categoryId || typeCategories[draft.type][0]?._id || "";
    // Create category on the fly if requested
    if (customCategoryMode && customCategoryName.trim()) {
      const created = await api.post('/categories', { name: customCategoryName.trim(), type: draft.type });
      categoryIdToUse = created.data?._id || created.data?.data?._id || created.data?.id || categoryIdToUse;
      // refresh categories list
      const catsResp = await beFetchCategories();
      const flatCats: Category[] = (catsResp && (catsResp as any).incomeCategories)
        ? ([...((catsResp as any).incomeCategories || []), ...((catsResp as any).expenseCategories || []), ...((catsResp as any).savingCategories || [])])
        : (Array.isArray(catsResp) ? catsResp as any : []);
      setCategories(flatCats);
      setCustomCategoryMode(false);
      setCustomCategoryName("");
    }

    const payload = {
      name: draft.name.trim(),
      amount: parseFloat(draft.amount),
      categoryId: categoryIdToUse,
      budgetId,
      type: draft.type,
      flexibility: draft.type === 'EXPENSE' ? draft.flexibility : 'FIXED',
      recurrence: draft.type === 'EXPENSE' ? draft.recurrence : 'MONTHLY',
      tags: draft.type === 'EXPENSE' ? draft.tags : [EntryTags.MISC],
      ...(draft.type === 'EXPENSE' && draft.dueDayOfMonth ? { dueDayOfMonth: parseInt(draft.dueDayOfMonth) } : {}),
    };

    if (editingId) {
      await api.put(`/entries/${editingId}`, payload);
      setEditingId(null);
    } else {
      await api.post(`/entries`, payload);
    }
    const ents = await beFetchEntries(budgetId);
    setEntries(ents);
    resetDraft();
  };

  const remove = async (id: string) => {
    await api.delete(`/entries/${id}`);
    const ents = await beFetchEntries(budgetId);
    setEntries(ents);
  };

  const deleteSelectedCategory = async () => {
    if (!draft.categoryId) return;
    const selectedId = draft.categoryId;
    const selectedCat = categories.find(c => c._id === selectedId);
    if (!selectedCat) return;
    const related = entries.filter(e => e.category?._id === selectedId);
    const ok = window.confirm(related.length > 0
      ? `Delete category "${selectedCat.name}" and its ${related.length} entries?`
      : `Delete category "${selectedCat.name}"?`);
    if (!ok) return;
    // delete related entries first to prevent backend constraint errors
    for (const e of related) {
      await api.delete(`/entries/${e._id}`);
    }
    await beDeleteCategory(selectedId);
    const cats = await beFetchCategories();
    setCategories(cats);
    const ents = await beFetchEntries(budgetId);
    setEntries(ents);
    // reset selected category if needed
    setDraft(d => ({ ...d, categoryId: typeCategories[d.type][0]?._id || "" }));
  };

  if (loading) {
    return (
      <LayoutProvider>
        <AppShell>
          <div className="text-neutral-400">Loading…</div>
        </AppShell>
      </LayoutProvider>
    );
  }

  const incomes = entries.filter(e => e.type === "INCOME");
  const expenses = entries.filter(e => e.type === "EXPENSE");
  const savings = entries.filter(e => e.type === "SAVING");

  return (
    <LayoutProvider>
      <AppShell>
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <Section title="Add / Edit Entry">
            {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs mb-1">Type</label>
                <select className="w-full bg-white border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.type} onChange={(e) => {
                  const t = e.target.value as EntryType;
                  setDraft(d => ({ ...d, type: t, categoryId: typeCategories[t][0]?._id || "" }));
                }}>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="SAVING">Saving</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1">Name</label>
                <input className="w-full bg-white border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs mb-1">Amount</label>
                <input type="number" className="w-full bg-white border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.amount} onChange={(e) => setDraft(d => ({ ...d, amount: e.target.value }))} />
              </div>
              {draft.type === 'EXPENSE' && (
                <div>
                  <label className="block text-xs mb-1">Due day</label>
                  <input type="number" min={1} max={31} className="w-full bg-white border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.dueDayOfMonth || ''} onChange={(e) => setDraft(d => ({ ...d, dueDayOfMonth: e.target.value }))} />
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-xs mb-1">Category</label>
                <div className="flex gap-2">
                  <select className="flex-1 bg-white border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.categoryId} onChange={(e) => setDraft(d => ({ ...d, categoryId: e.target.value }))}>
                    {typeCategories[draft.type].map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
                  </select>
                  <button type="button" className="px-2 rounded border border-neutral-300 bg-white hover:bg-neutral-100 text-sm dark:bg-neutral-800 dark:border-neutral-700" onClick={() => setCustomCategoryMode(v => !v)}>{customCategoryMode ? 'Cancel' : 'New'}</button>
                  <button type="button" className="px-2 rounded border border-red-300 bg-white text-red-600 hover:bg-red-50 text-sm" onClick={deleteSelectedCategory}>Delete</button>
                </div>
                {customCategoryMode && (
                  <div className="mt-2 flex gap-2">
                    <input className="flex-1 bg-white border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" placeholder="New category name" value={customCategoryName} onChange={e => setCustomCategoryName(e.target.value)} />
                  </div>
                )}
              </div>
              {draft.type === 'EXPENSE' && (
                <>
                  <div>
                    <label className="block text-xs mb-1">Recurrence</label>
                    <select className="w-full bg-white border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.recurrence} onChange={(e) => setDraft(d => ({ ...d, recurrence: e.target.value as EntryRecurrence }))}>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="ONE_TIME">One Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Flexibility</label>
                    <select className="w-full bg-white border border-neutral-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.flexibility} onChange={(e) => setDraft(d => ({ ...d, flexibility: e.target.value as EntryFlexibility }))}>
                      <option value="FIXED">Fixed</option>
                      <option value="FLEXIBLE">Flexible</option>
                      <option value="OPTIONAL">Optional</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(EntryTags).map(t => (
                        <button key={t} type="button" className={`px-2 py-1 rounded text-xs border transition-colors ${draft.tags.includes(t) ? 'bg-primary-600 border-primary-500 text-white' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700'}`} onClick={() => setDraft(d => ({ ...d, tags: d.tags.includes(t) ? d.tags.filter(x => x !== t) : [...d.tags, t] }))}>{t.toLowerCase()}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div className="col-span-2 flex justify-end gap-2 mt-2">
                {editingId && (
                  <button className="px-3 py-2 rounded border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-600" onClick={() => { setEditingId(null); resetDraft(); }}>Cancel</button>
                )}
                <button className="px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700" onClick={submit}>{editingId ? 'Save' : 'Add'}</button>
              </div>
            </div>
          </Section>
        </div>
        <div className="xl:col-span-2 grid gap-4">
          <Section title="Incomes">
            <ul className="mt-1 divide-y divide-neutral-800 text-sm">
              {incomes.map(i => (
                <li key={i._id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3"><span className="font-medium">{i.name}</span><span className="text-neutral-400">{i.amount}</span></div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-neutral-800" onClick={() => { setEditingId(i._id); setDraft({ name: i.name, amount: String(i.amount), type: 'INCOME', categoryId: i.category._id, flexibility: 'FIXED', recurrence: 'MONTHLY', tags: [EntryTags.MISC] }); }}>Edit</button>
                    <button className="px-2 py-1 rounded bg-red-700" onClick={() => remove(i._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Savings">
            <ul className="mt-1 divide-y divide-neutral-800 text-sm">
              {savings.map(s => (
                <li key={s._id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3"><span className="font-medium">{s.name}</span><span className="text-neutral-400">{s.amount}</span></div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-neutral-800" onClick={() => { setEditingId(s._id); setDraft({ name: s.name, amount: String(s.amount), type: 'SAVING', categoryId: s.category._id, flexibility: 'FIXED', recurrence: 'MONTHLY', tags: [EntryTags.MISC] }); }}>Edit</button>
                    <button className="px-2 py-1 rounded bg-red-700" onClick={() => remove(s._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Expenses">
            <ul className="mt-1 divide-y divide-neutral-800 text-sm">
              {expenses.map(x => (
                <li key={x._id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3"><span className="font-medium">{x.name}</span><span className="text-neutral-400">{x.amount}</span></div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-neutral-800" onClick={() => { setEditingId(x._id); setDraft({ name: x.name, amount: String(x.amount), type: 'EXPENSE', categoryId: x.category._id, flexibility: x.flexibility, recurrence: x.recurrence, tags: x.tags, dueDayOfMonth: x.dueDayOfMonth ? String(x.dueDayOfMonth) : undefined }); }}>Edit</button>
                    <button className="px-2 py-1 rounded bg-red-700" onClick={() => remove(x._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
      </AppShell>
    </LayoutProvider>
  );
};

export default DataSetup;


