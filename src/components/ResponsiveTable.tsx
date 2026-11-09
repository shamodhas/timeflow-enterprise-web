import React from "react"
import { TableSkeleton } from "./Loaders"

export interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
  className?: string
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string | number
  loading?: boolean
  emptyMessage?: string
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = "No records found."
}: ResponsiveTableProps<T>) {
  if (loading) {
    return <TableSkeleton />
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 text-center text-gray-500 dark:text-slate-400 shadow-sm transition-colors">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div>
      {/* --- DESKTOP VIEW: Standard Table --- */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/70 border-b border-gray-200 dark:border-slate-800">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className={`px-6 py-4 font-semibold text-gray-700 dark:text-slate-200 ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-gray-600 dark:text-slate-300 ${col.className || ""}`}
                    >
                      {typeof col.accessor === "function"
                        ? col.accessor(item)
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MOBILE VIEW: Card Stack Layout (320px+) --- */}
      <div className="md:hidden min-w-0 space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="min-w-0 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm space-y-2.5 transition-shadow hover:shadow-md transition-colors"
          >
            {columns.map((col, colIndex) => {
              const value =
                typeof col.accessor === "function"
                  ? col.accessor(item)
                  : (item[col.accessor] as React.ReactNode)

              const isPrimary = colIndex === 0

              return (
                <div
                  key={colIndex}
                  className="flex min-w-0 flex-col gap-1.5 py-2 text-sm border-b border-gray-50 dark:border-slate-800/60 last:border-0"
                >
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    {col.header}
                  </span>
                  <div
                    className={`min-w-0 max-w-full text-left break-words [overflow-wrap:anywhere] ${isPrimary ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-slate-300"}`}
                  >
                    {value}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
