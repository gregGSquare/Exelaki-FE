import React, { useEffect, useMemo, useState } from "react";
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

  const nav = useMemo(() => ([
    {
      section: 'Overview',
      items: [
        { label: 'Dashboard', href: basePath, active: location.pathname === basePath, icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/></svg>
        )},
        { label: 'Data Setup', href: effectiveBudgetId ? `/app/${effectiveBudgetId}/setup` : `/`, active: location.pathname.endsWith('/setup'), icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 7h18M3 12h18M3 17h18"/></svg>
        )},
        { label: 'Projections', href: effectiveBudgetId ? `/app/${effectiveBudgetId}/projections` : `/`, active: location.pathname.endsWith('/projections'), icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 3v18h18M7 13l3 3 7-7"/></svg>
        )},
        { label: 'Indicators', href: basePath, active: false, icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M11 3v18M3 13h8M13 7h8M13 17h8"/></svg>
        )},
      ]
    },
    {
      section: 'Account',
      items: [
        { label: 'Settings', href: '/settings', active: location.pathname === '/settings', icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M10.325 4.317a1 1 0 011.35-.436l.39.195a1 1 0 00.894 0l.39-.195a1 1 0 011.35.436l.2.4a1 1 0 00.746.54l.441.073a1 1 0 01.832.832l.073.441a1 1 0 00.54.746l.4.2a1 1 0 01.436 1.35l-.195.39a1 1 0 000 .894l.195.39a1 1 0 01-.436 1.35l-.4.2a1 1 0 00-.54.746l-.073.441a1 1 0 01-.832.832l-.441.073a1 1 0 00-.746.54l-.2.4a1 1 0 01-1.35.436l-.39-.195a1 1 0 00-.894 0l-.39.195a1 1 0 01-1.35-.436l-.2-.4a1 1 0 00-.746-.54l-.441-.073a1 1 0 01-.832-.832l-.073-.441a1 1 0 00-.54-.746l-.4-.2a1 1 0 01-.436-1.35l.195-.39a1 1 0 000-.894l-.195-.39a1 1 0 01.436-1.35l.4-.2a1 1 0 00.54-.746l.073-.441a1 1 0 01.832-.832l.441-.073a1 1 0 00.746-.54l.2-.4z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        )},
      ]
    }
  ]), [basePath, effectiveBudgetId, location.pathname]);

  const NavList = (
    <div className="px-2 py-3 space-y-6">
      {nav.map((group) => (
        <div key={group.section}>
          <div className="px-3 text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">{group.section}</div>
          <ul className="mt-2 space-y-1">
            {group.items.map((it) => (
              <li key={it.label}>
                <Link
                  to={it.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 ${disabledCls} ${it.active ? 'bg-neutral-200/70 dark:bg-neutral-800' : ''}`}
                  onClick={onClose}
                >
                  <span className="text-neutral-500">{it.icon}</span>
                  <span>{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile off-canvas */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-72 bg-neutral-100 dark:bg-neutral-950/90 border-r border-neutral-200 dark:border-neutral-800 shadow-xl flex flex-col transform transition-transform duration-200 ease-out translate-x-0">
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


