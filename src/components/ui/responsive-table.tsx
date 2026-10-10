import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  primary?: boolean;
  hideOnMobile?: boolean;
  className?: string;
};

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  rowActions?: (row: T) => ReactNode;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  columns,
  rows,
  getRowKey,
  rowActions,
  emptyMessage = "No results found.",
}: ResponsiveTableProps<T>) {
  const primary = columns.find((column) => column.primary) ?? columns[0];

  if (!primary) return null;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {rowActions && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={getRowKey(row)}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell className="text-right">
                      {rowActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {rows.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground md:hidden">
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-3 p-3 md:hidden">
          {rows.map((row) => (
            <li key={getRowKey(row)} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 break-words font-medium">{primary.cell(row)}</div>
                {rowActions?.(row)}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {columns
                  .filter(
                    (column) => column !== primary && !column.hideOnMobile,
                  )
                  .map((column) => (
                    <div key={column.key} className="contents">
                      <dt className="text-muted-foreground">{column.header}</dt>
                      <dd className="min-w-0 break-words text-right">{column.cell(row)}</dd>
                    </div>
                  ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
