import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useBudget } from "../../contexts/BudgetContext";

const Sidebar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentBudgetId } = useBudget();
  const [effectiveBudgetId, setEffectiveBudgetId] = useState<string>("");

  useEffect(() => {
    const fromLocal = localStorage.getItem('lastBudgetId') || "";
    setEffectiveBudgetId(id || currentBudgetId || fromLocal || "");
  }, [id, currentBudgetId]);
  const basePath = effectiveBudgetId ? `/app/${effectiveBudgetId}` : `/`;
  const disabledCls = !effectiveBudgetId ? 'opacity-50 pointer-events-none cursor-default' : '';

  return (
    <aside className="w-64 shrink-0 h-full bg-neutral-100 dark:bg-neutral-950/90 border-r border-neutral-200 dark:border-neutral-800 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-neutral-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white font-bold">
          E
        </div>
        <span className="ml-2 font-semibold">Exelaki</span>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="px-2 space-y-1">
          <li>
            <Link
              to={basePath}
              className={`block px-3 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 ${disabledCls}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to={effectiveBudgetId ? `/app/${effectiveBudgetId}/setup` : `/`}
              className={`block px-3 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 ${disabledCls}`}
            >
              Data Setup
            </Link>
          </li>
          <li>
            <Link
              to={effectiveBudgetId ? `/app/${effectiveBudgetId}/projections` : `/`}
              className={`block px-3 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 ${disabledCls}`}
            >
              Projections
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className="block px-3 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;


