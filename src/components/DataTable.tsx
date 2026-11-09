import React from 'react'
import type { ImportType, ParsedRow } from '../types/import.data'
import { REQUIRED_FIELDS } from '../core/constant/import.data.constants'

interface DataTableProps {
  data: ParsedRow[]
  importType: ImportType
  onCellChange: (rowIndex: number, columnKey: string, value: string) => void
  onRemoveRow: (rowIndex: number) => void
  onExecuteImport: () => void
  loading: boolean
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  importType,
  onCellChange,
  onRemoveRow,
  onExecuteImport,
  loading
}) => {
  if (data.length === 0) return null

  const invalidCount = data.filter(r => r._isInvalid).length
  const columns = Object.keys(data[0] || {}).filter(k => !k.startsWith('_'))
  const requiredCols = REQUIRED_FIELDS[importType] || []

  return (
    <div className='space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-wrap items-center gap-2'>
          <h2 className='text-base font-semibold text-gray-900 dark:text-slate-100'>
            Data Verification Preview
          </h2>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              invalidCount > 0
                ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                : 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300'
            }`}
          >
            {invalidCount} Invalid Rows
          </span>
        </div>
        <button
          onClick={onExecuteImport}
          disabled={loading}
          className='flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer'
        >
          <span>🚀</span>
          <span>
            {loading ? 'Importing...' : `Import ${data.length} Records`}
          </span>
        </button>
      </div>

      <div className='max-h-[400px] overflow-auto border border-gray-200 dark:border-slate-800 rounded-xl shadow-inner'>
        <table className='w-full text-left border-collapse text-sm'>
          <thead className='bg-gray-50 dark:bg-slate-800/90 sticky top-0 z-10 border-b border-gray-200 dark:border-slate-700 shadow-sm'>
            <tr>
              <th className='p-3 font-semibold text-gray-500 dark:text-slate-400 w-12 text-center text-xs'>
                #
              </th>
              {columns.map(key => (
                <th
                  key={key}
                  className='p-3 font-semibold text-gray-700 dark:text-slate-200 whitespace-nowrap text-xs uppercase tracking-wider bg-gray-50 dark:bg-slate-800'
                >
                  <div className='flex items-center space-x-1'>
                    <span>{key}</span>
                    {requiredCols.includes(key) && (
                      <span
                        className='text-red-500 font-bold'
                        title='Required Field'
                      >
                        *
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className='p-3 font-semibold text-gray-500 dark:text-slate-400 text-center w-20 text-xs uppercase tracking-wider bg-gray-50 dark:bg-slate-800'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900'>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-colors ${
                  row._isInvalid
                    ? 'bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100/50 dark:hover:bg-red-900/30'
                    : 'hover:bg-gray-50/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <td className='p-3 text-center text-gray-400 dark:text-slate-500 text-xs font-mono'>
                  {rowIndex + 1}
                </td>
                {columns.map(columnKey => (
                  <td key={columnKey} className='p-2'>
                    <input
                      type='text'
                      value={row[columnKey] ?? ''}
                      onChange={e =>
                        onCellChange(rowIndex, columnKey, e.target.value)
                      }
                      className={`w-full bg-transparent border rounded-lg px-2.5 py-1.5 outline-none text-gray-800 dark:text-slate-200 transition-all text-sm ${
                        row._missingFields?.includes(columnKey)
                          ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/40 focus:border-red-600'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800'
                      }`}
                    />
                  </td>
                ))}
                <td className='p-2 text-center'>
                  <button
                    onClick={() => onRemoveRow(rowIndex)}
                    className='text-red-500 hover:text-red-700 text-xs font-medium p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer'
                    title='Remove Row'
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
