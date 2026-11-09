import type { ImportModule, ImportType } from "../../types/import.data"

export const IMPORT_MODULES: readonly ImportModule[] = [
  {
    type: "employees",
    label: "Employees Sheet",
    icon: "👥",
    fields: ["employeeCode", "fullName", "email", "password", "role"]
  },
  {
    type: "attendance",
    label: "Attendance Sheet",
    icon: "⏰",
    fields: ["employeeCode", "clockIn", "clockOut", "status"]
  },
  {
    type: "leaves",
    label: "Leaves Sheet",
    icon: "🌴",
    fields: [
      "employeeCode",
      "leaveTypeName",
      "startDate",
      "endDate",
      "totalDays",
      "status",
      "reason"
    ]
  }
]

export const REQUIRED_FIELDS: Record<ImportType, string[]> = {
  employees: ["employeeCode", "fullName", "email", "password", "role"],
  attendance: ["employeeCode", "clockIn", "clockOut", "status"],
  leaves: [
    "employeeCode",
    "leaveTypeName",
    "startDate",
    "endDate",
    "totalDays",
    "status"
  ]
}
