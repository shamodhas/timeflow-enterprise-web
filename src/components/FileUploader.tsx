import React, { useState, useRef } from 'react'

interface FileUploaderProps {
  requiredHeaders: string[]
  onFileSelect: (file: File) => void
  fileName: string
  recordCount: number
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  requiredHeaders,
  onFileSelect,
  fileName,
  recordCount
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2'>
        <label className='block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400'>
          Upload Source File
        </label>
        <div className='flex flex-wrap items-center gap-1.5 bg-gray-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700'>
          <span className='text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase'>
            Required Headers:
          </span>
          {requiredHeaders.map(f => (
            <span
              key={f}
              className='text-[11px] font-mono font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded'
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div
        onDragOver={e => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={e => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[0.99]'
            : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600 bg-gray-50/50 dark:bg-slate-900/50'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isDragging
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
          }`}
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.75'
              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
            />
          </svg>
        </div>
        <div>
          <p className='text-sm text-gray-700 dark:text-slate-300 font-medium'>
            <span className='text-blue-600 dark:text-blue-400 hover:underline'>
              Click to upload
            </span>{' '}
            or drag and drop
          </p>
          <p className='text-xs text-gray-400 dark:text-slate-500 mt-0.5'>
            CSV files structured for selected module
          </p>
        </div>
        <input
          ref={fileInputRef}
          type='file'
          accept='.csv'
          onChange={handleChange}
          className='hidden'
        />
      </div>

      {fileName && (
        <div className='mt-3 flex items-center justify-between text-xs text-gray-600 dark:text-slate-300 bg-blue-50/80 dark:bg-blue-950/40 px-4 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900'>
          <span className='font-medium text-blue-800 dark:text-blue-300 flex items-center space-x-2'>
            <span>📎</span>
            <span className='truncate max-w-xs'>{fileName}</span>
          </span>
          <span className='text-blue-600 dark:text-blue-400 font-semibold'>
            {recordCount} records ready
          </span>
        </div>
      )}
    </div>
  )
}
