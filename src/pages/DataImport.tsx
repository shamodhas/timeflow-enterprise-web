import { useCallback, useState } from 'react'
import Papa from 'papaparse'
import type { ImportType, ParsedRow } from '../types/import.data'
import {
  IMPORT_MODULES,
  REQUIRED_FIELDS
} from '../core/constant/import.data.constants'
import { showToast } from '../utils/toast'
import { importEmployees } from '../services/employee.service'
import { importBulkAttendance } from '../services/attendance.service'
import { importLeaves } from '../services/leave.service'
import { ModuleSelector } from '../components/ModuleSelector'
import { FileUploader } from '../components/FileUploader'
import { DataTable } from '../components/DataTable'

export const DataImport = () => {
  const [importType, setImportType] = useState<ImportType>('employees')
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])

  const currentModule = IMPORT_MODULES.find(m => m.type === importType)!

  const handleModuleChange = (type: ImportType) => {
    setImportType(type)
    setParsedData([])
    setFileName('')
  }

  const validateRows = (data: any[], type: ImportType): ParsedRow[] => {
    const required = REQUIRED_FIELDS[type] || []
    return data.map(row => {
      const missingFields = required.filter(
        field => !row[field] || String(row[field]).trim() === ''
      )
      return {
        ...row,
        _isInvalid: missingFields.length > 0,
        _missingFields: missingFields
      }
    })
  }

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv')) {
        showToast.error('Please upload a valid CSV file.')
        return
      }

      setFileName(file.name)
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: results => {
          const validated = validateRows(results.data, importType)
          setParsedData(validated)
          const invalidCount = validated.filter(r => r._isInvalid).length

          if (invalidCount > 0) {
            showToast.warning(
              `Loaded ${validated.length} rows, but ${invalidCount} rows have missing required fields.`
            )
          } else {
            showToast.success(`Successfully loaded ${validated.length} rows.`)
          }
        },
        error: err => showToast.error(`Error parsing CSV: ${err.message}`)
      })
    },
    [importType]
  )

  const handleCellChange = (
    rowIndex: number,
    columnKey: string,
    value: string
  ) => {
    setParsedData(prev => {
      const updated = [...prev]
      updated[rowIndex] = { ...updated[rowIndex], [columnKey]: value }

      const required = REQUIRED_FIELDS[importType] || []
      const missingFields = required.filter(
        field =>
          !updated[rowIndex][field] ||
          String(updated[rowIndex][field]).trim() === ''
      )

      updated[rowIndex]._isInvalid = missingFields.length > 0
      updated[rowIndex]._missingFields = missingFields
      return updated
    })
  }

  const handleRemoveRow = (rowIndex: number) => {
    setParsedData(prev => prev.filter((_, index) => index !== rowIndex))
  }

  const handleExecuteImport = async () => {
    if (parsedData.some(row => row._isInvalid)) {
      showToast.error('Please fix highlighted missing fields before importing.')
      return
    }

    if (parsedData.length === 0) {
      showToast.warning('No data to import!')
      return
    }

    setLoading(true)
    try {
      const cleanData = parsedData.map(
        ({ _isInvalid, _missingFields, ...rest }) => rest
      )

      let res
      if (importType === 'employees') res = await importEmployees(cleanData)
      else if (importType === 'attendance')
        res = await importBulkAttendance(cleanData)
      else res = await importLeaves(cleanData)

      showToast.success(res.message)
      setParsedData([])
      setFileName('')
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6 max-w-6xl mx-auto'>
      <h1 className='text-2xl font-bold text-gray-950 dark:text-white tracking-tight'>
        Legacy Data: {currentModule.label}
      </h1>

      <div className='bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors'>
        <ModuleSelector
          modules={IMPORT_MODULES}
          selectedType={importType}
          onSelect={handleModuleChange}
        />

        <FileUploader
          requiredHeaders={currentModule.fields}
          onFileSelect={processFile}
          fileName={fileName}
          recordCount={parsedData.length}
        />

        <DataTable
          data={parsedData}
          importType={importType}
          onCellChange={handleCellChange}
          onRemoveRow={handleRemoveRow}
          onExecuteImport={handleExecuteImport}
          loading={loading}
        />
      </div>
    </div>
  )
}

// import React, { useState, useRef } from 'react'
// import Papa from 'papaparse'
// import { showToast } from '../utils/toast'
// import { importEmployees } from '../services/employee.service'
// import { importBulkAttendance } from '../services/attendance.service'
// import { importLeaves } from '../services/leave.service'

// const IMPORT_MODULES = [
//   {
//     type: 'employees',
//     label: 'Employees Sheet',
//     icon: '👥',
//     fields: ['employeeCode', 'fullName', 'email', 'password', 'role']
//   },
//   {
//     type: 'attendance',
//     label: 'Attendance Sheet',
//     icon: '⏰',
//     fields: ['employeeCode', 'clockIn', 'clockOut', 'status']
//   },
//   {
//     type: 'leaves',
//     label: 'Leaves Sheet',
//     icon: '🌴',
//     fields: [
//       'employeeCode',
//       'leaveTypeName',
//       'startDate',
//       'endDate',
//       'totalDays',
//       'status',
//       'reason'
//     ]
//   }
// ] as const

// const REQUIRED_FIELDS: Record<string, string[]> = {
//   employees: ['employeeCode', 'fullName', 'email', 'password', 'role'],
//   attendance: ['employeeCode', 'clockIn', 'clockOut', 'status'],
//   leaves: [
//     'employeeCode',
//     'leaveTypeName',
//     'startDate',
//     'endDate',
//     'totalDays',
//     'status'
//   ]
// }

// export const DataImport = () => {
//   const [importType, setImportType] = useState<
//     'employees' | 'attendance' | 'leaves'
//   >('employees')
//   const [loading, setLoading] = useState(false)
//   const [fileName, setFileName] = useState('')
//   const [parsedData, setParsedData] = useState<any[]>([])
//   const [isDragging, setIsDragging] = useState(false)

//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const currentModule = IMPORT_MODULES.find(m => m.type === importType)!

//   const validateRows = (data: any[], type: string) => {
//     const required = REQUIRED_FIELDS[type] || []
//     return data.map(row => {
//       const missingFields = required.filter(
//         field => !row[field] || String(row[field]).trim() === ''
//       )
//       return {
//         ...row,
//         _isInvalid: missingFields.length > 0,
//         _missingFields: missingFields
//       }
//     })
//   }

//   const processFile = (file: File) => {
//     if (!file.name.endsWith('.csv')) {
//       showToast.error('Please upload a valid CSV file.')
//       return
//     }

//     setFileName(file.name)

//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: results => {
//         const validated = validateRows(results.data, importType)
//         setParsedData(validated)
//         const invalidCount = validated.filter(r => r._isInvalid).length
//         if (invalidCount > 0) {
//           showToast.warning(
//             `Loaded ${validated.length} rows, but ${invalidCount} rows have missing required fields.`
//           )
//         } else {
//           showToast.success(`Successfully loaded ${validated.length} rows.`)
//         }
//       },
//       error: err => {
//         showToast.error('Error parsing CSV: ' + err.message)
//       }
//     })
//   }

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) processFile(file)
//   }

//   const handleCellChange = (
//     rowIndex: number,
//     columnKey: string,
//     value: string
//   ) => {
//     const updatedData = [...parsedData]
//     updatedData[rowIndex] = {
//       ...updatedData[rowIndex],
//       [columnKey]: value
//     }
//     const required = REQUIRED_FIELDS[importType] || []
//     const missingFields = required.filter(
//       field =>
//         !updatedData[rowIndex][field] ||
//         String(updatedData[rowIndex][field]).trim() === ''
//     )
//     updatedData[rowIndex]._isInvalid = missingFields.length > 0
//     updatedData[rowIndex]._missingFields = missingFields

//     setParsedData(updatedData)
//   }

//   const handleRemoveRow = (rowIndex: number) => {
//     setParsedData(parsedData.filter((_, index) => index !== rowIndex))
//   }

//   const handleExecuteImport = async () => {
//     const hasInvalid = parsedData.some(row => row._isInvalid)
//     if (hasInvalid) {
//       showToast.error('Please fix highlighted missing fields before importing.')
//       return
//     }

//     if (parsedData.length === 0) {
//       showToast.warning('No data to import!')
//       return
//     }

//     setLoading(true)
//     try {
//       const cleanData = parsedData.map(
//         ({ _isInvalid, _missingFields, ...rest }) => rest
//       )

//       let res
//       if (importType === 'employees') {
//         res = await importEmployees(cleanData)
//       } else if (importType === 'attendance') {
//         res = await importBulkAttendance(cleanData)
//       } else {
//         res = await importLeaves(cleanData)
//       }

//       showToast.success(res.message)
//       setParsedData([])
//       setFileName('')
//       if (fileInputRef.current) fileInputRef.current.value = ''
//     } catch (error: any) {
//       showToast.error(error.response?.data?.message || 'Import failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className='space-y-6 max-w-6xl mx-auto'>
//       <h1 className='text-2xl font-bold text-gray-950 tracking-tight'>
//         Legacy Data: {currentModule.label}
//       </h1>

//       <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6'>
//         <div>
//           <label className='block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2'>
//             Select Import Module & Required Schema
//           </label>
//           <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
//             {IMPORT_MODULES.map(item => (
//               <button
//                 key={item.type}
//                 type='button'
//                 onClick={() => {
//                   setImportType(item.type)
//                   setParsedData([])
//                   setFileName('')
//                   if (fileInputRef.current) fileInputRef.current.value = ''
//                 }}
//                 className={`flex flex-col text-left p-4 rounded-xl border transition-all overflow-hidden ${
//                   importType === item.type
//                     ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-sm ring-1 ring-blue-600'
//                     : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
//                 }`}
//               >
//                 <div className='flex items-center space-x-2 font-semibold text-sm mb-2'>
//                   <span>{item.icon}</span>
//                   <span className='capitalize'>{item.label}</span>
//                 </div>
//                 {/* Updated single-line container with flex-nowrap and overflow-hidden */}
//                 <div className='flex flex-nowrap overflow-hidden gap-1 mt-auto w-full'>
//                   {item.fields.map(field => (
//                     <span
//                       key={field}
//                       className={`whitespace-nowrap flex-shrink-0 text-[11px] px-2 py-0.5 rounded font-mono font-semibold ${
//                         importType === item.type
//                           ? 'bg-blue-600 text-white shadow-sm'
//                           : 'bg-gray-100 text-gray-700 border border-gray-200'
//                       }`}
//                     >
//                       {field}
//                     </span>
//                   ))}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>

//         <div>
//           <div className='flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2'>
//             <label className='block text-xs font-semibold uppercase tracking-wider text-gray-500'>
//               Upload Source File
//             </label>
//             <div className='flex flex-wrap items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200'>
//               <span className='text-[11px] font-semibold text-gray-500 uppercase'>
//                 Required Headers:
//               </span>
//               {currentModule.fields.map(f => (
//                 <span
//                   key={f}
//                   className='text-[11px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded'
//                 >
//                   {f}
//                 </span>
//               ))}
//             </div>
//           </div>

//           <div
//             onDragOver={e => {
//               e.preventDefault()
//               setIsDragging(true)
//             }}
//             onDragLeave={e => {
//               e.preventDefault()
//               setIsDragging(false)
//             }}
//             onDrop={e => {
//               e.preventDefault()
//               setIsDragging(false)
//               const f = e.dataTransfer.files?.[0]
//               if (f) processFile(f)
//             }}
//             onClick={() => fileInputRef.current?.click()}
//             className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
//               isDragging
//                 ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
//                 : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
//             }`}
//           >
//             <div
//               className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
//                 isDragging
//                   ? 'bg-blue-100 text-blue-600'
//                   : 'bg-gray-100 text-gray-500'
//               }`}
//             >
//               <svg
//                 className='w-6 h-6'
//                 fill='none'
//                 stroke='currentColor'
//                 viewBox='0 0 24 24'
//               >
//                 <path
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                   strokeWidth='1.75'
//                   d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
//                 />
//               </svg>
//             </div>

//             <div>
//               <p className='text-sm text-gray-700 font-medium'>
//                 <span className='text-blue-600 hover:underline'>
//                   Click to upload
//                 </span>{' '}
//                 or drag and drop
//               </p>
//               <p className='text-xs text-gray-400 mt-0.5'>
//                 CSV files structured for {importType}
//               </p>
//             </div>

//             <input
//               ref={fileInputRef}
//               type='file'
//               accept='.csv'
//               onChange={handleFileUpload}
//               className='hidden'
//             />
//           </div>

//           {fileName && (
//             <div className='mt-3 flex items-center justify-between text-xs text-gray-600 bg-blue-50/80 px-4 py-2.5 rounded-xl border border-blue-100'>
//               <span className='font-medium text-blue-800 flex items-center space-x-2'>
//                 <span>📎</span>
//                 <span className='truncate max-w-xs'>{fileName}</span>
//               </span>
//               <span className='text-blue-600 font-semibold'>
//                 {parsedData.length} records ready
//               </span>
//             </div>
//           )}
//         </div>

//         {parsedData.length > 0 && (
//           <div className='space-y-4 pt-4 border-t border-gray-100'>
//             <div className='flex justify-between items-center'>
//               <div className='flex items-center space-x-2'>
//                 <h2 className='text-base font-semibold text-gray-900'>
//                   Data Verification Preview
//                 </h2>
//                 <span
//                   className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
//                     parsedData.some(r => r._isInvalid)
//                       ? 'bg-red-100 text-red-700'
//                       : 'bg-green-100 text-green-700'
//                   }`}
//                 >
//                   {parsedData.filter(r => r._isInvalid).length} Invalid Rows
//                 </span>
//               </div>
//               <button
//                 onClick={handleExecuteImport}
//                 disabled={loading}
//                 className='flex items-center space-x-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors'
//               >
//                 <span>🚀</span>
//                 <span>
//                   {loading
//                     ? 'Importing...'
//                     : `Import ${parsedData.length} Records`}
//                 </span>
//               </button>
//             </div>

//             <div className='max-h-[400px] overflow-auto border border-gray-200 rounded-xl shadow-inner'>
//               <table className='w-full text-left border-collapse text-sm'>
//                 <thead className='bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm'>
//                   <tr>
//                     <th className='p-3 font-semibold text-gray-500 w-12 text-center text-xs'>
//                       #
//                     </th>
//                     {Object.keys(parsedData[0] || {})
//                       .filter(k => !k.startsWith('_'))
//                       .map(key => (
//                         <th
//                           key={key}
//                           className='p-3 font-semibold text-gray-700 whitespace-nowrap text-xs uppercase tracking-wider bg-gray-50'
//                         >
//                           <div className='flex items-center space-x-1'>
//                             <span>{key}</span>
//                             {REQUIRED_FIELDS[importType]?.includes(key) && (
//                               <span
//                                 className='text-red-500 font-bold'
//                                 title='Required Field'
//                               >
//                                 *
//                               </span>
//                             )}
//                           </div>
//                         </th>
//                       ))}
//                     <th className='p-3 font-semibold text-gray-500 text-center w-20 text-xs uppercase tracking-wider bg-gray-50'>
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className='divide-y divide-gray-200 bg-white'>
//                   {parsedData.map((row, rowIndex) => (
//                     <tr
//                       key={rowIndex}
//                       className={`transition-colors ${
//                         row._isInvalid
//                           ? 'bg-red-50/50 hover:bg-red-100/50'
//                           : 'hover:bg-gray-50/80'
//                       }`}
//                     >
//                       <td className='p-3 text-center text-gray-400 text-xs font-mono'>
//                         {rowIndex + 1}
//                       </td>
//                       {Object.keys(row)
//                         .filter(k => !k.startsWith('_'))
//                         .map(columnKey => (
//                           <td key={columnKey} className='p-2'>
//                             <input
//                               type='text'
//                               value={row[columnKey] ?? ''}
//                               onChange={e =>
//                                 handleCellChange(
//                                   rowIndex,
//                                   columnKey,
//                                   e.target.value
//                                 )
//                               }
//                               className={`w-full bg-transparent border rounded-lg px-2.5 py-1.5 outline-none text-gray-800 transition-all text-sm ${
//                                 row._missingFields?.includes(columnKey)
//                                   ? 'border-red-400 bg-red-50 focus:border-red-600'
//                                   : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:bg-white'
//                               }`}
//                             />
//                           </td>
//                         ))}
//                       <td className='p-2 text-center'>
//                         <button
//                           onClick={() => handleRemoveRow(rowIndex)}
//                           className='text-red-500 hover:text-red-700 text-xs font-medium p-1.5 rounded-lg hover:bg-red-50 transition-colors'
//                           title='Remove Row'
//                         >
//                           🗑️
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
