import React from "react";

interface TableColumn<T> {
  header: string;
  accessor: keyof T;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  renderActions?: (item: T) => React.ReactNode;
}

const Table = <T extends { id: any }>({
  columns,
  data,
  renderActions,
}: TableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                {col.header}
              </th>
            ))}
            {renderActions && (
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td
                  key={col.accessor as string}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                >
                  {String(item[col.accessor])}
                </td>
              ))}
              {renderActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {renderActions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
