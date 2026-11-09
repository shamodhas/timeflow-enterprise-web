import { lazy, type LazyExoticComponent, type ComponentType } from "react"
import type { LayoutType } from "../../types/layout"
import type { UserRole } from "../../types/auth"

export interface RouteConfig {
  path: string
  component: LazyExoticComponent<ComponentType<any>>
  layout?: LayoutType
  roles?: UserRole[]
}

export const publicRoutes: RouteConfig[] = [
  {
    path: "/auth/login",
    component: lazy(() =>
      import("../../pages/Login").then((m) => ({ default: m.Login }))
    ),
    layout: "BlankLayout"
  },
  {
    path: "/auth/register",
    component: lazy(() =>
      import("../../pages/Register").then((m) => ({ default: m.Register }))
    ),
    layout: "BlankLayout"
  },
  {
    path: "/auth/onboard",
    component: lazy(() =>
      import("../../pages/TenantOnboarding").then((m) => ({
        default: m.TenantOnboarding
      }))
    ),
    layout: "BlankLayout"
  },
  {
    path: "/auth/invite/register",
    component: lazy(() =>
      import("../../pages/CompleteRegistration").then((m) => ({
        default: m.CompleteRegistration
      }))
    ),
    layout: "BlankLayout"
  }
]

export const staffRoutes: RouteConfig[] = [
  {
    path: "/app/dashboard",
    component: lazy(() =>
      import("../../pages/Dashboard").then((m) => ({ default: m.Dashboard }))
    ),
    layout: "DashboardLayout"
  },
  {
    path: "/app/leaves",
    component: lazy(() =>
      import("../../pages/Leaves").then((m) => ({ default: m.Leaves }))
    ),
    layout: "DashboardLayout"
  },
  {
    path: "/app/attendance",
    component: lazy(() =>
      import("../../pages/Attendance").then((m) => ({ default: m.Attendance }))
    ),
    layout: "DashboardLayout"
  }
]

export const managementRoutes: RouteConfig[] = [
  {
    path: "/app/employees",
    component: lazy(() =>
      import("../../pages/Employees").then((m) => ({ default: m.Employees }))
    ),
    layout: "DashboardLayout",
    roles: ["SUPER_ADMIN", "ADMIN", "HR"]
  },
  {
    path: "/app/employees/:employeeId/leaves",
    component: lazy(() =>
      import("../../pages/EmployeeLeaveDetail").then((m) => ({
        default: m.EmployeeLeaveDetail
      }))
    ),
    layout: "DashboardLayout",
    roles: ["SUPER_ADMIN", "ADMIN", "HR"]
  },
  {
    path: "/app/admin/attendance",
    component: lazy(() =>
      import("../../pages/AllAttendance").then((m) => ({
        default: m.AllAttendance
      }))
    ),
    layout: "DashboardLayout",
    roles: ["SUPER_ADMIN", "ADMIN", "HR"]
  },
  {
    path: "/app/admin/branches",
    component: lazy(() =>
      import("../../pages/Branches").then((m) => ({ default: m.Branches }))
    ),
    layout: "DashboardLayout",
    roles: ["SUPER_ADMIN", "ADMIN", "HR"]
  },
  {
    path: "/app/admin/holidays",
    component: lazy(() =>
      import("../../pages/Holidays").then((m) => ({ default: m.Holidays }))
    ),
    layout: "DashboardLayout",
    roles: ["SUPER_ADMIN", "ADMIN", "HR"]
  }
]

export const adminsRoutes: RouteConfig[] = [
  {
    path: "/app/admin/tenants",
    component: lazy(() =>
      import("../../pages/TenantSettings").then((m) => ({
        default: m.TenantSettings
      }))
    ),
    layout: "DashboardLayout",
    roles: ["SUPER_ADMIN", "ADMIN"]
  }
]

export const systemRoutes: RouteConfig[] = [
  {
    path: "/app/admin/import",
    component: lazy(() =>
      import("../../pages/DataImport").then((m) => ({ default: m.DataImport }))
    ),
    layout: "DashboardLayout",
    roles: ["SUPER_ADMIN"]
  }
]

export const Routes: RouteConfig[] = [
  ...publicRoutes,
  ...staffRoutes,
  ...managementRoutes,
  ...adminsRoutes,
  ...systemRoutes
]
