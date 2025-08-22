import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type WidgetType = "main" | "kpi" | "table";

export interface DashboardWidget {
  id: string;
  type: WidgetType;
}

interface LayoutContextValue {
  widgets: DashboardWidget[];
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  resetDefault: () => void;
  resetGridLayouts: () => void;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

const randomId = () => Math.random().toString(36).slice(2, 9);

export const defaultWidgets: DashboardWidget[] = [
  { id: "main", type: "main" },
  { id: "kpi", type: "kpi" },
  { id: "table", type: "table" },
];

export const GRID_LAYOUT_STORAGE_KEY = "v2-layout";

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storageKey = "v2-widgets";
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : defaultWidgets;
    } catch {
      return defaultWidgets;
    }
  });

  const persist = (next: DashboardWidget[]) => {
    setWidgets(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const addWidget = useCallback((type: WidgetType) => {
    const id = `${type}-${randomId()}`;
    persist([...widgets, { id, type }]);
  }, [widgets]);

  const removeWidget = useCallback((id: string) => {
    persist(widgets.filter(w => w.id !== id));
  }, [widgets]);

  const resetDefault = useCallback(() => {
    persist(defaultWidgets);
  }, []);

  const resetGridLayouts = useCallback(() => {
    try {
      localStorage.removeItem(GRID_LAYOUT_STORAGE_KEY);
    } catch {}
    window.dispatchEvent(new CustomEvent('layout-reset'));
  }, []);

  const value = useMemo(() => ({ widgets, addWidget, removeWidget, resetDefault, resetGridLayouts }), [widgets, addWidget, removeWidget, resetDefault, resetGridLayouts]);

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};

export const useLayoutContext = (): LayoutContextValue => {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayoutContext must be used within LayoutProvider");
  return ctx;
};


