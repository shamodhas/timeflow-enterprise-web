import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarOff,
  Upload,
  MapPinned,
  CalendarDays,
  Database,
  type LucideIcon
} from "lucide-react"
import type { UserRole } from "../../types/auth"

export interface NavItem {
  name: string
  path: string
  icon: LucideIcon
  roles?: UserRole[]
}

export const navigationConfig: NavItem[] = [
  { name: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
  {
    name: "Employees",
    path: "/app/employees",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN", "HR"]
  },
  { name: "Attendance", path: "/app/attendance", icon: Clock },
  {
    name: "All Attendance",
    path: "/app/admin/attendance",
    icon: Clock,
    roles: ["SUPER_ADMIN", "ADMIN", "HR"]
  },
  { name: "Leaves", path: "/app/leaves", icon: CalendarOff },
  {
    name: "Branches",
    path: "/app/admin/branches",
    icon: MapPinned,
    roles: ["SUPER_ADMIN", "ADMIN", "HR"]
  },
  {
    name: "Holidays",
    path: "/app/admin/holidays",
    icon: CalendarDays,
    roles: ["SUPER_ADMIN", "ADMIN", "HR"]
  },
  {
    name: "SaaS & BYOD DB",
    path: "/app/admin/tenants",
    icon: Database,
    roles: ["SUPER_ADMIN", "ADMIN"]
  },
  {
    name: "Data Import",
    path: "/app/admin/import",
    icon: Upload,
    roles: ["SUPER_ADMIN"]
  }
]
