import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useBudget } from "../../contexts/BudgetContext";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { currentBudgetId } = useBudget();
  const { logout } = useAuth();
  const [effectiveBudgetId, setEffectiveBudgetId] = useState<string>("");

  useEffect(() => {
    const fromLocal = localStorage.getItem('lastBudgetId') || "";
    setEffectiveBudgetId(id || currentBudgetId || fromLocal || "");
  }, [id, currentBudgetId]);
  const basePath = effectiveBudgetId ? `/app/${effectiveBudgetId}` : `/`;
  const disabledCls = !effectiveBudgetId ? 'opacity-50 pointer-events-none cursor-default' : '';

  const NavList = (
    <ul className="px-2 space-y-1">
      <li>
        <Link
          to={basePath}
          className={`block px-3 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 ${disabledCls} ${location.pathname === basePath ? 'bg-neutral-200/70 dark:bg-neutral-800' : ''}`}
          onClick={onClose}
        >
          Dashboard
        </Link>
      </li>
      <li>
        <Link
          to={effectiveBudgetId ? `/app/${effectiveBudgetId}/setup` : `/`}
          className={`block px-3 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 ${disabledCls} ${location.pathname.endsWith('/setup') ? 'bg-neutral-200/70 dark:bg-neutral-800' : ''}`}
          onClick={onClose}
        >
          Data Setup
        </Link>
      </li>
      <li>
        <Link
          to={effectiveBudgetId ? `/app/${effectiveBudgetId}/projections` : `/`}
          className={`block px-3 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 ${disabledCls} ${location.pathname.endsWith('/projections') ? 'bg-neutral-200/70 dark:bg-neutral-800' : ''}`}
          onClick={onClose}
        >
          Projections
        </Link>
      </li>
      <li>
        <Link
          to="/settings"
          className={`block px-3 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 ${location.pathname === '/settings' ? 'bg-neutral-200/70 dark:bg-neutral-800' : ''}`}
          onClick={onClose}
        >
          Settings
        </Link>
      </li>
    </ul>
  );

  return (
    <>
      {/* Mobile off-canvas */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-72 bg-neutral-100 dark:bg-neutral-950/90 border-r border-neutral-200 dark:border-neutral-800 shadow-xl flex flex-col">
            <div className="h-16 flex items-center px-4 border-b border-neutral-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white font-bold">E</div>
              <span className="ml-2 font-semibold">Exelaki</span>
            </div>
            <nav className="flex-1 overflow-auto py-4">{NavList}</nav>
            <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
              <button className="w-full px-3 py-2 rounded-md text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-700" onClick={() => { onClose && onClose(); logout(); }}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col bg-neutral-100 dark:bg-neutral-950/90 border-r border-neutral-200 dark:border-neutral-800">
        <div className="h-16 flex items-center px-4 border-b border-neutral-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white font-bold">E</div>
          <span className="ml-2 font-semibold">Exelaki</span>
        </div>
        <nav className="flex-1 overflow-auto py-4">{NavList}</nav>
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
          <button className="w-full px-3 py-2 rounded-md text-red-600 border border-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-700" onClick={() => logout()}>Logout</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


