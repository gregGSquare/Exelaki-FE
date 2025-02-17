import React from "react";
import { Entry } from "../types/entryTypes";
import { CategoryType } from "../types/categoryTypes";

interface Column {
  name: string; // The name of the column to display in the header
  field: keyof Entry; // The field in the Entry object that this column corresponds to
  format?: (value: any) => string | JSX.Element;
}

interface TableProps {
  entries: Entry[];
  columns: Column[]; // Array of column definitions
  categoryName: string;
  handleEdit: (entry: Entry, entryType: CategoryType) => void;
  handleDelete: (id: string, entryType: CategoryType) => void;
}

const formatCurrency = (amount: number) => (
  `$${Number(amount).toLocaleString()}`
);

const Table: React.FC<TableProps> = ({
  entries,
  columns,
  categoryName,
  handleEdit,
  handleDelete,
}) => {
  const totalAmount = entries.reduce(
    (total, entry) => total + Number(entry.amount),
    0,
  );

  return (
    <div className="mb-6">
      <h2 className="text-2xl mb-2">{categoryName}</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="py-2 px-4 bg-gray-200">
                {column.name}
              </th>
            ))}
            <th className="py-2 px-4 bg-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry._id}>
              {columns.map((column, index) => (
                <td key={index} className="border px-4 py-2">
                  {column.format 
                    ? column.format(entry[column.field])
                    : column.field === 'category' 
                      ? entry.category.name
                      : String(entry[column.field])
                  }
                </td>
              ))}
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(entry, entry.category.type)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(entry._id, entry.category.type)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td className="border px-4 py-2 font-bold">Total</td>
            <td className="border px-4 py-2 font-bold">{formatCurrency(totalAmount)}</td>
            <td className="border px-4 py-2" colSpan={columns.length - 1}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table;
