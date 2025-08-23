import React, { useEffect, useMemo, useRef, useState } from "react";
import { CurrencyOption, getCurrencyList } from "../../utils/currency";

interface CurrencyPickerProps {
  value: string;
  onChange: (code: string) => void;
}

const normalize = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

const CurrencyPicker: React.FC<CurrencyPickerProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const all = useMemo<CurrencyOption[]>(() => getCurrencyList(), []);
  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return all.slice(0, 25);
    return all.filter(c => normalize(c.code).includes(q) || normalize(c.name).includes(q)).slice(0, 50);
  }, [all, query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick, true);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDocClick, true); document.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <div className="relative w-full max-w-md" ref={rootRef}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search currency (e.g., SEK or Swedish Krona)"
        className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-3 py-2 text-sm"
        aria-label="Search currency"
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow">
          {filtered.map(c => (
            <button
              key={c.code}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${value === c.code ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
              onClick={() => { onChange(c.code); setQuery(""); setOpen(false); }}
            >
              <span className="font-medium">{c.code}</span>
              <span className="text-neutral-500 ml-2">{c.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-neutral-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyPicker;


