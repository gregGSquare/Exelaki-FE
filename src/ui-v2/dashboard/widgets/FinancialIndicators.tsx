import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loadFinancialIndicators } from "../../../services/financialIndicatorsService";

type Indicator = { label: string; value: string; status: string; hint?: string };

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    GOOD: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    WARN: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    BAD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  const cls = map[status] || "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
  return <span className={`px-2 py-0.5 rounded text-[11px] ${cls}`}>{status}</span>;
};

const FinancialIndicators: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const budgetId = id || "demo";
  const [loading, setLoading] = useState(true);
  const [indicators, setIndicators] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await loadFinancialIndicators(budgetId);
        setIndicators(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Failed to load indicators");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [budgetId]);

  if (loading) return <div className="h-full w-full flex items-center justify-center text-neutral-400 text-sm">Loading…</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (!indicators) return null;

  const rows: Indicator[] = [
    { label: "Total Score", value: indicators.totalScore?.value, status: indicators.totalScore?.status },
    { label: "Debt to Income", value: indicators.debtToIncomeRatio?.value, status: indicators.debtToIncomeRatio?.status },
    { label: "Savings Rate", value: indicators.savingsRate?.value, status: indicators.savingsRate?.status },
    { label: "Car Cost Ratio", value: indicators.carCostRatio?.value, status: indicators.carCostRatio?.status },
    { label: "Housing Cost Ratio", value: indicators.homeCostRatio?.value, status: indicators.homeCostRatio?.status },
    { label: "Fixed Expenses", value: indicators.fixedExpenses?.value, status: indicators.fixedExpenses?.status },
  ];

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-neutral-500 border-b border-neutral-200 dark:text-neutral-400 dark:border-neutral-800">
          <tr>
            <th className="text-left py-2">Indicator</th>
            <th className="text-left">Value</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-neutral-100 dark:border-neutral-900">
              <td className="py-2">{r.label}</td>
              <td>{r.value}</td>
              <td><StatusPill status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FinancialIndicators;


