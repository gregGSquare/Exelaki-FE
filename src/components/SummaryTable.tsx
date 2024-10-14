import React from "react";

interface SummaryEntry {
  category: string;
  total: number;
}

interface SummaryTableProps {
  entries: { category: { name: string }; amount: number }[];
}

const SummaryTable: React.FC<SummaryTableProps> = ({ entries }) => {
  const summaryData = entries.reduce(
    (acc, entry) => {
      const categoryName = entry.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { category: categoryName, total: 0 };
      }
      acc[categoryName].total += Number(entry.amount);
      return acc;
    },
    {} as { [key: string]: SummaryEntry },
  );

  const summaryEntries = Object.values(summaryData);

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Summary Table</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200">Category</th>
            <th className="py-2 px-4 bg-gray-200">Total</th>
          </tr>
        </thead>
        <tbody>
          {summaryEntries.map((entry) => (
            <tr key={entry.category}>
              <td className="border px-4 py-2">{entry.category}</td>
              <td className="border px-4 py-2">{entry.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;
