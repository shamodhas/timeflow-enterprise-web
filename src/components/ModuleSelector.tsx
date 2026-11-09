import React from 'react'
import type { ImportModule, ImportType } from '../types/import.data'

interface ModuleSelectorProps {
  modules: readonly ImportModule[]
  selectedType: ImportType
  onSelect: (type: ImportType) => void
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  modules,
  selectedType,
  onSelect
}) => (
  <div>
    <label className='block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2'>
      Select Import Module & Required Schema
    </label>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
      {modules.map(item => (
        <button
          key={item.type}
          type='button'
          onClick={() => onSelect(item.type)}
          className={`flex flex-col text-left p-4 rounded-xl border transition-all overflow-hidden cursor-pointer ${
            selectedType === item.type
              ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-600'
              : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300'
          }`}
        >
          <div className='flex items-center space-x-2 font-semibold text-sm mb-2'>
            <span>{item.icon}</span>
            <span className='capitalize'>{item.label}</span>
          </div>
          <div className='flex flex-nowrap overflow-hidden gap-1 mt-auto w-full'>
            {item.fields.map(field => (
              <span
                key={field}
                className={`whitespace-nowrap flex-shrink-0 text-[11px] px-2 py-0.5 rounded font-mono font-semibold ${
                  selectedType === item.type
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
                }`}
              >
                {field}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  </div>
)
