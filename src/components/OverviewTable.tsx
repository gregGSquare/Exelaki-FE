import React from "react";
import { Entry } from "../types/entryTypes";

interface OverviewTableProps {
  incomes: Entry[];
  expenses: Entry[];
}

const OverviewTable: React.FC<OverviewTableProps> = ({ incomes, expenses }) => {
  const totalIn = incomes.reduce(
    (total, income) => total + Number(income.amount),
    0,
  );
  const totalOut = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );
  const balance = totalIn - totalOut;

  return (
    <div className="p-4">
      <table className="min-w-full bg-white">
        <tbody>
          <tr style={{ backgroundColor: "#e6ffed" }}>
            {" "}
            {/* Light green */}
            <td className="border px-4 py-2 font-bold">In</td>
            <td className="border px-4 py-2">{totalIn}</td>
          </tr>
          <tr style={{ backgroundColor: "#ffe6e6" }}>
            {" "}
            {/* Light red */}
            <td className="border px-4 py-2 font-bold">Out</td>
            <td className="border px-4 py-2">{totalOut}</td>
          </tr>
          <tr
            style={{
              backgroundColor: balance >= 0 ? "#e6ffed" : "#ffe6e6", // Light green for positive, light red for negative
            }}
          >
            <td className="border px-4 py-2 font-bold">Balance</td>
            <td className="border px-4 py-2">{balance}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OverviewTable;
