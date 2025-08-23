import React, { useMemo, useState } from "react";
import { Responsive, WidthProvider, Layouts, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useLayoutContext } from "../state/LayoutContext";
import { useEntriesData } from "./useEntriesData";
import MainChart from "./widgets/MainChart";
import KpiCards from "./widgets/KpiCards";
import CategoryTable from "./widgets/CategoryTable";
import FinancialIndicators from "./widgets/FinancialIndicators";

const Card: React.FC<{ title: string; children?: React.ReactNode; actions?: React.ReactNode }> = ({ title, children, actions }) => (
  <div className="h-full w-full bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden dark:bg-neutral-900/80 dark:border-neutral-800">
    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800">
      <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{title}</h3>
      <div className="flex items-center gap-1">
        {actions}
        <button className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01"/></svg>
        </button>
      </div>
    </div>
    <div className="p-4 h-[260px]">{children}</div>
  </div>
);

const ResponsiveGrid = WidthProvider(Responsive);

const defaultLayouts: Layouts = {
  lg: [
    { i: "main", x: 0, y: 0, w: 12, h: 8 },
    { i: "kpi", x: 0, y: 8, w: 6, h: 6 },
    { i: "table", x: 6, y: 8, w: 6, h: 6 },
    { i: "indicators", x: 0, y: 14, w: 12, h: 8 },
  ],
  md: [
    { i: "main", x: 0, y: 0, w: 10, h: 8 },
    { i: "kpi", x: 0, y: 8, w: 5, h: 6 },
    { i: "table", x: 5, y: 8, w: 5, h: 6 },
    { i: "indicators", x: 0, y: 14, w: 10, h: 8 },
  ],
  sm: [
    { i: "main", x: 0, y: 0, w: 1, h: 8 },
    { i: "kpi", x: 0, y: 8, w: 1, h: 6 },
    { i: "table", x: 0, y: 14, w: 1, h: 6 },
    { i: "indicators", x: 0, y: 20, w: 1, h: 8 },
  ],
};

const WidgetGrid: React.FC = () => {
  const storageKey = "v2-layout";
  const { widgets, removeWidget } = useLayoutContext();
  const [layouts, setLayouts] = useState<Layouts>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultLayouts;
    } catch {
      return defaultLayouts;
    }
  });

  // Reset layouts when Topbar requests a reset
  React.useEffect(() => {
    const handler = () => {
      setLayouts(defaultLayouts);
    };
    window.addEventListener('layout-reset', handler as any);
    return () => window.removeEventListener('layout-reset', handler as any);
  }, []);

  const onLayoutChange = (_: Layout[], newLayouts: Layouts) => {
    setLayouts(newLayouts);
    localStorage.setItem(storageKey, JSON.stringify(newLayouts));
  };

  const cols = { lg: 12, md: 10, sm: 1, xs: 1, xxs: 1 };
  const rowHeight = 30;

  const { loading, entries, totals, expensesByCategory } = useEntriesData();

  return (
    <div style={{ zIndex: 1, position: 'relative' }}>
    <ResponsiveGrid
      className="layout"
      layouts={layouts}
      cols={cols}
      rowHeight={rowHeight}
      breakpoints={{ lg: 1200, md: 996, sm: 640, xs: 480, xxs: 0 }}
      onLayoutChange={onLayoutChange}
      draggableHandle=".drag-handle"
      isBounded
      compactType="vertical"
    >
      <div key="main" className="h-full">
        <Card title="Main Chart" actions={<span className="drag-handle cursor-move px-2 py-1 text-xs text-neutral-400">drag</span>}>
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-neutral-400 text-sm">Loading…</div>
          ) : (
            <MainChart entries={entries} />
          )}
        </Card>
      </div>
      <div key="kpi" className="h-full">
        <Card title="KPI Cards" actions={<span className="drag-handle cursor-move px-2 py-1 text-xs text-neutral-400">drag</span>}>
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-neutral-400 text-sm">Loading…</div>
          ) : (
            <KpiCards income={totals.income} expenses={totals.expenses} savings={totals.savings} balance={totals.balance} />
          )}
        </Card>
      </div>
      <div key="table" className="h-full">
        <Card title="Category Table" actions={<span className="drag-handle cursor-move px-2 py-1 text-xs text-neutral-400">drag</span>}>
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-neutral-400 text-sm">Loading…</div>
          ) : (
            <CategoryTable rows={expensesByCategory} />
          )}
        </Card>
      </div>
      <div key="indicators" className="h-full">
        <Card title="Financial Indicators" actions={<span className="drag-handle cursor-move px-2 py-1 text-xs text-neutral-400">drag</span>}>
          <FinancialIndicators />
        </Card>
      </div>
    </ResponsiveGrid>
    </div>
  );
};

export default WidgetGrid;


