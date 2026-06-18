import { cn } from "@/utils";

export function DataTable({ columns, rows, getRowKey, emptyState, className }) {
  if (!rows.length) return emptyState;

  return (
    <div className={cn("app-card overflow-hidden rounded-lg", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("px-5 py-4 font-bold", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="transition-colors hover:bg-[hsl(var(--surface))]">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-5 py-4 align-middle text-sm", column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
