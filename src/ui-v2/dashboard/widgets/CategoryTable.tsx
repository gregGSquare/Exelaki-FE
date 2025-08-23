import React from "react";
import { formatCurrency } from "../../../utils/currency";
import { usePreferences } from "../../state/PreferencesContext";

interface Row {
  id: string;
  name: string;
  total: number;
}

const CategoryTable: React.FC<{ rows: Row[] }> = ({ rows }) => {
  const { currencyCode } = usePreferences();
  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-neutral-500 border-b border-neutral-200 dark:text-neutral-400 dark:border-neutral-800">
          <tr>
            <th className="text-left py-2">Category</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-b border-neutral-100 dark:border-neutral-900">
              <td className="py-2">{r.name}</td>
              <td className="text-right">{formatCurrency(r.total, currencyCode)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;


