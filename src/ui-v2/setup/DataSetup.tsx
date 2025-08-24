import React, { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "../layout/AppShell";
import { LayoutProvider } from "../state/LayoutContext";
import { Category, CategoryType } from "../../types/categoryTypes";
import { Entry, EntryFlexibility, EntryRecurrence, EntryTags, EntryType } from "../../types/entryTypes";
import { useParams } from "react-router-dom";
import { mockRepository } from "../testing/mock-backend/repository";
import { usePreferences } from "../state/PreferencesContext";
import { formatCurrency } from "../../utils/currency";

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
  // Start with no tags; we'll validate to require at least one for expenses
  tags: [],
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
  const [activeTab, setActiveTab] = useState<EntryType>('EXPENSE');
  const [multiRows, setMultiRows] = useState<Array<{ name: string; amount: string }>>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { currencyCode } = usePreferences();
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<boolean>(false);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState<boolean>(false);
  const [mobileAdvanced, setMobileAdvanced] = useState<boolean>(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const flatCats: Category[] = await mockRepository.categories.list();
      setCategories(flatCats);
      const ents = await mockRepository.entries.list(budgetId);
      setEntries(ents);
      setLoading(false);
    };
    load();
  }, [budgetId]);

  const typeCategories = useMemo(() => ({
    INCOME: categories.filter(c => c.type === "INCOME"),
    EXPENSE: categories.filter(c => c.type === "EXPENSE"),
    SAVING: categories.filter(c => c.type === "SAVING"),
  }), [categories]);

  useEffect(() => {
    setDraft(d => ({
      ...d,
      type: activeTab,
      categoryId: (activeTab === 'INCOME' ? typeCategories.INCOME[0]?._id : activeTab === 'SAVING' ? typeCategories.SAVING[0]?._id : typeCategories.EXPENSE[0]?._id) || ''
    }));
  }, [activeTab, typeCategories]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!categoryMenuRef.current) return;
      if (!categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const validate = (): string | null => {
    if (!draft.name || !draft.amount) return "Name and amount are required";
    if (draft.type === "EXPENSE" && !draft.categoryId) return "Expense requires a category";
    if (draft.type === "EXPENSE" && draft.tags.length === 0) return "Select at least one tag";
    return null;
  };

  const resetDraft = () => setDraft({ ...emptyDraft, categoryId: typeCategories[draft.type][0]?._id || "", type: draft.type });

  const bulkAdd = async () => {
    for (const r of multiRows) {
      if (!r.name || !r.amount) continue;
      const payload = {
        name: r.name.trim(),
        amount: parseFloat(r.amount),
        categoryId: draft.categoryId || typeCategories[activeTab][0]?._id || '',
        budgetId,
        type: activeTab,
        flexibility: activeTab === 'EXPENSE' ? draft.flexibility : 'FIXED',
        recurrence: activeTab === 'EXPENSE' ? draft.recurrence : 'MONTHLY',
        tags: activeTab === 'EXPENSE' ? draft.tags : [EntryTags.MISC],
        ...(activeTab === 'EXPENSE' && draft.dueDayOfMonth ? { dueDayOfMonth: parseInt(draft.dueDayOfMonth) } : {}),
      } as any;
      await mockRepository.entries.create(payload);
    }
    const ents = await mockRepository.entries.list(budgetId);
    setEntries(ents);
    setMultiRows([]);
  };

  const submit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError(null);
    let categoryIdToUse = draft.categoryId || typeCategories[draft.type][0]?._id || "";
    // Create category on the fly if requested
    if (customCategoryMode && customCategoryName.trim()) {
      const created = await mockRepository.categories.create({ name: customCategoryName.trim(), type: draft.type });
      categoryIdToUse = created._id || categoryIdToUse;
      const flatCats: Category[] = await mockRepository.categories.list();
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
      await mockRepository.entries.update(editingId, payload as any);
      setEditingId(null);
    } else {
      await mockRepository.entries.create(payload as any);
    }
    const ents = await mockRepository.entries.list(budgetId);
    setEntries(ents);
    resetDraft();
  };

  const remove = async (id: string) => {
    await mockRepository.entries.remove(id);
    const ents = await mockRepository.entries.list(budgetId);
    setEntries(ents);
  };

  const deleteSelectedCategory = async () => {
    if (!draft.categoryId) return;
    const selectedId = draft.categoryId;
    const selectedCat = categories.find(c => c._id === selectedId);
    if (!selectedCat) return;
    const related = entries.filter(e => e.category?._id === selectedId);
    setConfirmState({
      open: true,
      title: 'Delete category',
      message: related.length > 0
        ? `Delete category "${selectedCat.name}" and its ${related.length} entries?`
        : `Delete category "${selectedCat.name}"?`,
      onConfirm: async () => {
        for (const e of related) {
          await mockRepository.entries.remove(e._id);
        }
        await mockRepository.categories.remove(selectedId);
        const cats = await mockRepository.categories.list();
        setCategories(cats);
        const ents = await mockRepository.entries.list(budgetId);
        setEntries(ents);
        setDraft(d => ({ ...d, categoryId: typeCategories[d.type][0]?._id || "" }));
      }
    });
  };

  const deleteCategory = async (id: string) => {
    const selectedCat = categories.find(c => c._id === id);
    if (!selectedCat) return;
    const related = entries.filter(e => e.category?._id === id);
    setConfirmState({
      open: true,
      title: 'Delete category',
      message: related.length > 0
        ? `Delete category "${selectedCat.name}" and its ${related.length} entries?`
        : `Delete category "${selectedCat.name}"?`,
      onConfirm: async () => {
        for (const e of related) {
          await mockRepository.entries.remove(e._id);
        }
        await mockRepository.categories.remove(id);
        const cats = await mockRepository.categories.list();
        setCategories(cats);
        const ents = await mockRepository.entries.list(budgetId);
        setEntries(ents);
        setDraft(d => ({ ...d, categoryId: typeCategories[d.type][0]?._id || "" }));
      }
    });
  };

  const incomes = entries.filter(e => e.type === "INCOME");
  const expenses = entries.filter(e => e.type === "EXPENSE");
  const savings = entries.filter(e => e.type === "SAVING");

  const currentList = activeTab === 'INCOME' ? incomes : activeTab === 'SAVING' ? savings : expenses;
  const groupedByCategory = useMemo(() => {
    const map: Record<string, { cat: Category | undefined; items: Entry[] }> = {};
    for (const e of currentList) {
      const key = e.category?._id || 'uncategorized';
      if (!map[key]) map[key] = { cat: e.category, items: [] };
      map[key].items.push(e);
    }
    return Object.values(map);
  }, [currentList]);

  if (loading) {
    return (
      <LayoutProvider>
        <AppShell>
          <div className="text-neutral-400">Loading…</div>
        </AppShell>
      </LayoutProvider>
    );
  }

  return (
    <LayoutProvider>
      <AppShell>
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['INCOME','SAVING','EXPENSE'] as EntryType[]).map(t => {
            const label = t === 'INCOME' ? 'Incomes' : t === 'SAVING' ? 'Savings' : 'Expenses';
            return (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-full border ${activeTab===t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200'}`}>{label}</button>
            );
          })}
        </div>
        {/* Desktop/tablet full form; hidden on small screens */}
        <Section title={`${activeTab.charAt(0)+activeTab.slice(1).toLowerCase()}s`}>
            {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2 flex justify-end text-xs text-neutral-500">
                <span>Tip: tap + to add more lines. Options apply to all lines.</span>
              </div>
              {/* Top row: Category + Recurrence */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="col-span-12 md:col-span-7">
                  <label className="block text-xs mb-1">Category</label>
                  {customCategoryMode ? (
                    <div className="flex gap-2">
                      <input className="flex-1 bg-white border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" placeholder="New category name" value={customCategoryName} onChange={e => setCustomCategoryName(e.target.value)} />
                      <button type="button" className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-xs dark:bg-neutral-800 dark:border-neutral-700" onClick={() => setCustomCategoryMode(false)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2" ref={categoryMenuRef}>
                      <div className="relative flex-1">
                        <button
                          type="button"
                          className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700"
                          onClick={() => setCategoryMenuOpen(v => !v)}
                        >
                          <span>{(typeCategories[draft.type].find(c => c._id === draft.categoryId)?.name) || 'Select category'}</span>
                          <svg className="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        {categoryMenuOpen && (
                          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg p-1 max-h-56 overflow-auto">
                            {typeCategories[draft.type].map(c => (
                              <div key={c._id} className="flex items-center justify-between px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                <button type="button" className="text-sm text-left flex-1" onClick={() => { setDraft(d => ({ ...d, categoryId: c._id })); setCategoryMenuOpen(false); }}>{c.name}</button>
                                <button type="button" className="ml-2 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30" onClick={(e) => { e.stopPropagation(); deleteCategory(c._id); setCategoryMenuOpen(false); }} title="Delete category">
                                  <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 002-2h2a2 2 0 002 2m-6 0h6"/></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button type="button" className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-xs dark:bg-neutral-800 dark:border-neutral-700" onClick={() => { setCustomCategoryMode(true); setCategoryMenuOpen(false); }}>New</button>
                    </div>
                  )}
                </div>
                {draft.type === 'EXPENSE' && (
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-xs mb-1">Recurrence</label>
                    <div className="flex flex-wrap gap-2">
                      {(['MONTHLY','QUARTERLY','YEARLY','ONE_TIME'] as EntryRecurrence[]).map(r => (
                        <button
                          key={r}
                          type="button"
                          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${draft.recurrence === r ? 'bg-primary-600 border-primary-500 text-white' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700'}`}
                          onClick={() => setDraft(d => ({ ...d, recurrence: r }))}
                        >
                          {r === 'ONE_TIME' ? 'One time' : r.charAt(0) + r.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Second row: Flexibility + Tags */}
              {draft.type === 'EXPENSE' && (
                <>
                  <div className="col-span-1">
                    <label className="block text-xs mb-1">Flexibility</label>
                    <div className="flex flex-wrap gap-2">
                      {(['FIXED','FLEXIBLE','OPTIONAL'] as EntryFlexibility[]).map(f => (
                        <button
                          key={f}
                          type="button"
                          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${draft.flexibility === f ? 'bg-primary-600 border-primary-500 text-white' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700'}`}
                          onClick={() => setDraft(d => ({ ...d, flexibility: f }))}
                        >
                          {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="hidden md:block"></div>
                  <div className="md:col-span-2">
                    <label className="block text-xs mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(EntryTags).map(t => (
                        <button
                          key={t}
                          type="button"
                          className={`px-2.5 py-1.5 rounded-full text-xs border transition-colors ${draft.tags.includes(t) ? 'bg-primary-600 border-primary-500 text-white' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700'}`}
                          onClick={() => setDraft(d => {
                            const already = d.tags.includes(t);
                            const next = already ? d.tags.filter(x => x !== t) : [...d.tags, t];
                            return { ...d, tags: next };
                          })}
                        >
                          {t.toLowerCase()}
                        </button>
                      ))}
                    </div>
                    {error && draft.type === 'EXPENSE' && draft.tags.length === 0 && (
                      <div className="text-[11px] text-red-500 mt-1">At least one tag is required.</div>
                    )}
                  </div>
                </>
              )}
              {/* Name & Amount with Add / multi-row add */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-xs mb-1">Name</label>
                  <input className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Name (e.g., Groceries)" />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-xs mb-1">Amount</label>
                  <input type="number" className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.amount} onChange={(e) => setDraft(d => ({ ...d, amount: e.target.value }))} placeholder="Amount" />
                </div>
                <div className="col-span-12 md:col-span-2 md:pt-5 flex gap-2 md:justify-end">
                  <button type="button" className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 w-full md:w-auto" onClick={() => setMultiRows(rows => [...rows, { name: '', amount: '' }])}>+</button>
                </div>
              </div>
              {multiRows.map((r, idx) => (
                <div key={idx} className="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 md:col-span-6">
                    <input className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={r.name} onChange={(e) => setMultiRows(list => list.map((it,i) => i===idx ? { ...it, name: e.target.value } : it))} placeholder="Name (e.g., Groceries)" />
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <input type="number" className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={r.amount} onChange={(e) => setMultiRows(list => list.map((it,i) => i===idx ? { ...it, amount: e.target.value } : it))} placeholder="Amount" />
                  </div>
                  <div className="col-span-12 md:col-span-2 md:justify-end flex">
                    <button className="px-2 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 w-full md:w-auto" onClick={() => setMultiRows(list => list.filter((_,i) => i!==idx))}>-</button>
                  </div>
                </div>
              ))}
              
              <div className="md:col-span-2 flex flex-col md:flex-row md:justify-end gap-2 mt-2">
                {editingId && (
                  <button className="px-3 py-2 rounded border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-600 w-full md:w-auto" onClick={() => { setEditingId(null); resetDraft(); }}>Cancel</button>
                )}
                <button className="px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 w-full md:w-auto" onClick={async () => {
                  if (editingId) { await submit(); return; }
                  if (multiRows.length > 0) { await bulkAdd(); return; }
                  await submit();
                }}>{editingId ? 'Save' : (multiRows.length > 0 ? 'Add all' : 'Add')}</button>
              </div>
            </div>
            {/* Mobile helper text and CTA space */}
            <div className="md:hidden text-xs text-neutral-500">Use the button to add entries.</div>
          </Section>
          {/* Mobile floating Add entry button */}
          <button className="md:hidden fixed bottom-4 right-4 px-4 py-3 rounded-full bg-primary-600 text-white shadow-lg" onClick={() => setMobileSheetOpen(true)}>Add entry</button>
        <div className="grid gap-4">
          {activeTab === 'INCOME' && (
            <Section title="Incomes">
              <ul className="mt-1 divide-y divide-neutral-800 text-sm">
                {incomes.map(i => (
                  <li key={i._id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{i.name}</span>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{i.category?.name}</div>
                      </div>
                      <span className="text-neutral-500 dark:text-neutral-400">{formatCurrency(Number(i.amount), currencyCode)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700" onClick={() => { setEditingId(i._id); setDraft({ name: i.name, amount: String(i.amount), type: 'INCOME', categoryId: i.category._id, flexibility: 'FIXED', recurrence: 'MONTHLY', tags: [EntryTags.MISC] }); }}>Edit</button>
                      <button className="px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-800/50" onClick={() => remove(i._id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {activeTab === 'SAVING' && (
            <Section title="Savings">
              <ul className="mt-1 divide-y divide-neutral-800 text-sm">
                {savings.map(s => (
                  <li key={s._id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{s.name}</span>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{s.category?.name}</div>
                      </div>
                      <span className="text-neutral-500 dark:text-neutral-400">{formatCurrency(Number(s.amount), currencyCode)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700" onClick={() => { setEditingId(s._id); setDraft({ name: s.name, amount: String(s.amount), type: 'SAVING', categoryId: s.category._id, flexibility: 'FIXED', recurrence: 'MONTHLY', tags: [EntryTags.MISC] }); }}>Edit</button>
                      <button className="px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-800/50" onClick={() => remove(s._id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {activeTab === 'EXPENSE' && (
            <>
              {groupedByCategory.map(group => {
                const id = group.cat?._id || 'uncategorized';
                const isCollapsed = !!collapsed[id];
                return (
                  <div key={id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden dark:bg-neutral-900/80 dark:border-neutral-800">
                    <button className="w-full px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40" onClick={() => setCollapsed(s => ({ ...s, [id]: !s[id] }))}>
                      <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{group.cat?.name || 'Uncategorized'}</h4>
                      <span className="text-neutral-500 text-xs">{isCollapsed ? '▾' : '▴'}</span>
                    </button>
                    {!isCollapsed && (
                      <div className="p-0 overflow-x-auto">
                        <table className="w-full text-xs md:text-sm">
                          <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300">
                            <tr>
                              <th className="text-left px-4 py-2 font-medium">Name</th>
                              <th className="text-left px-4 py-2 font-medium">Amount</th>
                              <th className="text-left px-4 py-2 font-medium">Recurrence</th>
                              <th className="text-left px-4 py-2 font-medium">Flex</th>
                              <th className="text-left px-4 py-2 font-medium">Tags</th>
                              <th className="text-right px-4 py-2 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.items.map(x => (
                              <tr key={x._id} className="border-t border-neutral-200 dark:border-neutral-800">
                                <td className="px-4 py-2">{x.name}</td>
                                <td className="px-4 py-2">{formatCurrency(Number(x.amount), currencyCode)}</td>
                                <td className="px-4 py-2">{x.recurrence.charAt(0) + x.recurrence.slice(1).toLowerCase()}</td>
                                <td className="px-4 py-2">{x.flexibility.charAt(0) + x.flexibility.slice(1).toLowerCase()}</td>
                                <td className="px-4 py-2">
                                  <div className="flex flex-wrap gap-1">
                                    {x.tags?.map((t) => (
                                      <span key={`${x._id}-${t}`} className="text-[10px] px-1.5 py-0.5 rounded-full border border-neutral-300 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">{t.toLowerCase()}</span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <div className="inline-flex gap-2">
                                    <button className="px-2 py-1 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700" onClick={() => { setEditingId(x._id); setDraft({ name: x.name, amount: String(x.amount), type: 'EXPENSE', categoryId: x.category._id, flexibility: x.flexibility, recurrence: x.recurrence, tags: x.tags }); }}>Edit</button>
                                    <button className="px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-800/50" onClick={() => remove(x._id)}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Mobile-friendly confirm modal */}
      {confirmState?.open && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmState(null)}></div>
          <div className="relative w-full sm:w-[420px] bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-xl shadow-xl p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-2">{confirmState.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">{confirmState.message}</p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700" onClick={() => setConfirmState(null)}>Cancel</button>
              <button className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" onClick={async () => { const fn = confirmState.onConfirm; setConfirmState(null); await fn(); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet for adding entries */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-[1500]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSheetOpen(false)}></div>
          <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-neutral-900 rounded-t-2xl shadow-2xl p-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-center">
              <div className="h-1 w-16 bg-neutral-300 rounded-full mb-2"></div>
            </div>
            <h4 className="text-base font-semibold mb-2">Add entry</h4>
            {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
            <div className="grid grid-cols-1 gap-3">
              {/* Category (reuses custom dropdown) */}
              <div>
                <label className="block text-xs mb-1">Category</label>
                <div className="flex gap-2" ref={categoryMenuRef}>
                  <div className="relative flex-1">
                    <button type="button" className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700" onClick={() => setCategoryMenuOpen(v => !v)}>
                      <span>{(typeCategories[draft.type].find(c => c._id === draft.categoryId)?.name) || 'Select category'}</span>
                      <svg className="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    {categoryMenuOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg p-1 max-h-56 overflow-auto">
                        {typeCategories[draft.type].map(c => (
                          <div key={c._id} className="flex items-center justify-between px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            <button type="button" className="text-sm text-left flex-1" onClick={() => { setDraft(d => ({ ...d, categoryId: c._id })); setCategoryMenuOpen(false); }}>{c.name}</button>
                            <button type="button" className="ml-2 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30" onClick={(e) => { e.stopPropagation(); deleteCategory(c._id); setCategoryMenuOpen(false); }} title="Delete category">
                              <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 002-2h2a2 2 0 002 2m-6 0h6"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Tags */}
              {draft.type === 'EXPENSE' && (
                <div>
                  <label className="block text-xs mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(EntryTags).map(t => (
                      <button key={t} type="button" className={`px-2.5 py-1.5 rounded-full text-xs border transition-colors ${draft.tags.includes(t) ? 'bg-primary-600 border-primary-500 text-white' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700'}`} onClick={() => setDraft(d => ({ ...d, tags: d.tags.includes(t) ? d.tags.filter(x => x !== t) : [...d.tags, t] }))}>{t.toLowerCase()}</button>
                    ))}
                  </div>
                  {error && draft.type === 'EXPENSE' && draft.tags.length === 0 && (
                    <div className="text-[11px] text-red-500 mt-1">At least one tag is required.</div>
                  )}
                </div>
              )}
              {/* Name & Amount and multi-row */}
              <div className="grid grid-cols-1 gap-2 items-center">
                <div>
                  <label className="block text-xs mb-1">Name</label>
                  <input className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Name (e.g., Groceries)" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Amount</label>
                  <input type="number" className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={draft.amount} onChange={(e) => setDraft(d => ({ ...d, amount: e.target.value }))} placeholder="Amount" />
                </div>
                <div className="pt-1 flex gap-2 justify-end">
                  <button type="button" className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200" onClick={() => setMultiRows(rows => [...rows, { name: '', amount: '' }])}>+</button>
                </div>
              </div>
              {multiRows.map((r, idx) => (
                <div key={`m-${idx}`} className="grid grid-cols-1 gap-2 items-center">
                  <input className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={r.name} onChange={(e) => setMultiRows(list => list.map((it,i) => i===idx ? { ...it, name: e.target.value } : it))} placeholder="Name (e.g., Groceries)" />
                  <input type="number" className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 dark:bg-neutral-800 dark:border-neutral-700" value={r.amount} onChange={(e) => setMultiRows(list => list.map((it,i) => i===idx ? { ...it, amount: e.target.value } : it))} placeholder="Amount" />
                  <div className="flex justify-end">
                    <button className="px-2 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200" onClick={() => setMultiRows(list => list.filter((_,i) => i!==idx))}>-</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Advanced options */}
            <div className="mt-3">
              <button className="text-xs text-neutral-600 dark:text-neutral-300 underline" onClick={() => setMobileAdvanced(v => !v)}>{mobileAdvanced ? 'Hide advanced options' : 'Advanced options'}</button>
            </div>
            {mobileAdvanced && (
              <div className="mt-3 grid grid-cols-1 gap-3">
                {draft.type === 'EXPENSE' && (
                  <div>
                    <label className="block text-xs mb-1">Recurrence</label>
                    <div className="flex flex-wrap gap-2">
                      {(['MONTHLY','QUARTERLY','YEARLY','ONE_TIME'] as EntryRecurrence[]).map(r => (
                        <button key={r} type="button" className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${draft.recurrence === r ? 'bg-primary-600 border-primary-500 text-white' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700'}`} onClick={() => setDraft(d => ({ ...d, recurrence: r }))}>{r === 'ONE_TIME' ? 'One time' : r.charAt(0) + r.slice(1).toLowerCase()}</button>
                      ))}
                    </div>
                  </div>
                )}
                {draft.type === 'EXPENSE' && (
                  <div>
                    <label className="block text-xs mb-1">Flexibility</label>
                    <div className="flex flex-wrap gap-2">
                      {(['FIXED','FLEXIBLE','OPTIONAL'] as EntryFlexibility[]).map(f => (
                        <button key={f} type="button" className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${draft.flexibility === f ? 'bg-primary-600 border-primary-500 text-white' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700'}`} onClick={() => setDraft(d => ({ ...d, flexibility: f }))}>{f.charAt(0) + f.slice(1).toLowerCase()}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700" onClick={() => { setMobileSheetOpen(false); }}>Cancel</button>
              <button className="flex-1 px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700" onClick={async () => { const v = validate(); if (v) { setError(v); return; } setError(null); if (multiRows.length > 0) { await bulkAdd(); } else { await submit(); } setMobileSheetOpen(false); setMobileAdvanced(false); }}>Save</button>
            </div>
          </div>
        </div>
      )}

      </AppShell>
    </LayoutProvider>
  );
};

export default DataSetup;


