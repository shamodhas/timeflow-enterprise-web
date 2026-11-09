export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
}

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "HR" | "EMPLOYEE"
