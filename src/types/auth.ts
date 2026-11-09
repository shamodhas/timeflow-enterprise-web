export interface User {
  id: string
  employeeCode?: string
  email: string
  fullName: string
  role: UserRole
  tenantId?: string
  tenantSlug?: string
  tenantName?: string
}

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "HR" | "EMPLOYEE"
