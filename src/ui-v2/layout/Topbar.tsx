import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useLayoutContext } from "../state/LayoutContext";
import { useAuth } from "../../contexts/AuthContext";
import { useBudget } from "../../contexts/BudgetContext";

interface TopbarProps {
  onOpenSidebar?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentBudgetId } = useBudget();
  const budgetId = id || currentBudgetId || localStorage.getItem('lastBudgetId') || "";
  const location = useLocation();
  const [openAdd, setOpenAdd] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobileNav, setOpenMobileNav] = useState(false);
  const { addWidget, resetDefault, resetGridLayouts } = useLayoutContext();
  const addRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (openAdd && addRef.current && !addRef.current.contains(target)) setOpenAdd(false);
      if (openMenu && menuRef.current && !menuRef.current.contains(target)) setOpenMenu(false);
      if (openMobileNav && mobileRef.current && !mobileRef.current.contains(target)) setOpenMobileNav(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpenAdd(false); setOpenMenu(false); }
    };
    document.addEventListener('mousedown', onDocClick, true);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDocClick, true); document.removeEventListener('keydown', onKey); };
  }, [openAdd, openMenu, openMobileNav]);

  // Close menus on route change
  useEffect(() => { setOpenAdd(false); setOpenMenu(false); setOpenMobileNav(false); }, [location.pathname]);

  return (
    <div className="h-16 border-b border-neutral-200 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/80 backdrop-blur flex items-center justify-between px-3 sm:px-4 relative z-[200]">
      <div className="flex items-center gap-2">
        <div className="relative md:hidden" ref={mobileRef}>
          <button
            className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => { onOpenSidebar ? onOpenSidebar() : setOpenMobileNav(v => !v); }}
            aria-label="Open navigation"
            aria-haspopup="true"
            aria-expanded={openMobileNav}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          {!onOpenSidebar && openMobileNav && (
            <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl p-2 z-[1000]">
              <Link to={budgetId ? `/app/${budgetId}` : `/`} className={`block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${!budgetId ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => setOpenMobileNav(false)}>Dashboard</Link>
              <Link to={budgetId ? `/app/${budgetId}/setup` : `/`} className={`block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${!budgetId ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => setOpenMobileNav(false)}>Data Setup</Link>
              <Link to={budgetId ? `/app/${budgetId}/projections` : `/`} className={`block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${!budgetId ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => setOpenMobileNav(false)}>Projections</Link>
              <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
              <Link to="/settings" className="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setOpenMobileNav(false)}>Settings</Link>
              <button className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { setOpenMobileNav(false); logout(); }}>Logout</button>
            </div>
          )}
        </div>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">Budget</span>
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{budgetId}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative" ref={addRef}>
          <button
            className="px-3 py-1.5 text-xs sm:text-sm rounded-md bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
            onClick={() => setOpenAdd(!openAdd)}
          >
            Add Widget
          </button>
          {openAdd && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl p-1 z-[1000]">
              <button className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { addWidget('main'); setOpenAdd(false); }}>Main Chart</button>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { addWidget('kpi'); setOpenAdd(false); }}>KPI Cards</button>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { addWidget('table'); setOpenAdd(false); }}>Category Table</button>
            </div>
          )}
        </div>
        {/* menu removed */}
      </div>
    </div>
  );
};

export default Topbar;


