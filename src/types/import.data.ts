export type ImportType = "employees" | "attendance" | "leaves"

export interface ImportModule {
  type: ImportType
  label: string
  icon: string
  fields: string[]
}

export type ParsedRow<T = Record<string, string>> = T & {
  _isInvalid?: boolean
  _missingFields?: string[]
}
