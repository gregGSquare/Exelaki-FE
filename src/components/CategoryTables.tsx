import React from "react";
import { Entry } from "../types/entryTypes";
import Table from "./Table";

interface CategoryTablesProps {
  entries: Entry[];
  entryType: "IN" | "OUT";
  handleEdit: (entry: Entry, entryType: "IN" | "OUT") => void;
  handleDelete: (id: string, entryType: "IN" | "OUT") => void;
}

const CategoryTables: React.FC<CategoryTablesProps> = ({
  entries,
  entryType,
  handleEdit,
  handleDelete,
}) => {
  const groupedEntries = entries.reduce(
    (acc, entry) => {
      const categoryName = entry.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(entry);
      return acc;
    },
    {} as { [key: string]: Entry[] },
  );

  const columns = [
    { name: "Name", field: "name" },
    { name: "Amount", field: "amount" },
    { name: "Type", field: "type" },
    { name: "Date", field: "date" },
  ];

  return (
    <>
      {Object.keys(groupedEntries).map((categoryName) => (
        <Table
          key={categoryName}
          entries={groupedEntries[categoryName]}
          columns={columns} // Pass the dynamic columns here
          categoryName={categoryName}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ))}
    </>
  );
};

export default CategoryTables;
