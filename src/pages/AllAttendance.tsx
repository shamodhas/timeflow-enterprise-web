import { useState, useEffect } from "react"
import { showToast } from "../utils/toast"
import { getAllAttendance } from "../services/attendance.service"
import { ResponsiveTable, type Column } from "../components/ResponsiveTable"

interface AttendanceItem {
  id: string
  createdAt: string
  clockIn: string | null
  clockOut: string | null
  status: string
  locationVerified?: boolean | null
  clockOutLocationVerified?: boolean | null
  branch?: { name: string } | null
  clockOutBranch?: { name: string } | null
  clockInLocationFailureReason?: string | null
  clockInLocationFailedAt?: string | null
  clockOutLocationFailureReason?: string | null
  clockOutLocationFailedAt?: string | null
  employee: {
    employeeCode: string
    fullName: string
    email: string
  }
}

export const AllAttendance = () => {
  const [attendanceList, setAttendanceList] = useState<AttendanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("")

  const fetchAllAttendance = async () => {
    try {
      setLoading(true)
      const res = await getAllAttendance(selectedDate)
      setAttendanceList(res)
    } catch (error) {
      console.error("Failed to fetch attendance", error)
      showToast.error("Failed to load attendance records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllAttendance()
  }, [selectedDate])

  const filteredRecords = attendanceList.filter((item) => {
    const name = item.employee?.fullName || ""
    const code = item.employee?.employeeCode || ""
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Columns definition for ResponsiveTable
  const columns: Column<AttendanceItem>[] = [
    {
      header: "Employee Code",
      accessor: (item) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {item.employee?.employeeCode || "N/A"}
        </span>
      )
    },
    {
      header: "Employee Name",
      accessor: (item) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">
            {item.employee?.fullName || "N/A"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            {item.employee?.email || ""}
          </p>
        </div>
      )
    },
    {
      header: "Date",
      accessor: (item) => (
        <span className="text-slate-600 dark:text-slate-300 font-mono text-xs">
          {item.createdAt
            ? new Date(item.createdAt).toISOString().split("T")[0]
            : "N/A"}
        </span>
      )
    },
    {
      header: "Clock In",
      accessor: (item) => (
        <span className="text-slate-600 dark:text-slate-300 font-mono text-xs">
          {item.clockIn
            ? new Date(item.clockIn).toLocaleTimeString("en-LK", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })
            : "N/A"}
        </span>
      )
    },
    {
      header: "Clock Out",
      accessor: (item) =>
        item.clockOut ? (
          <span className="text-slate-600 dark:text-slate-300 font-mono text-xs">
            {new Date(item.clockOut).toLocaleTimeString("en-LK", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            })}
          </span>
        ) : (
          <span className="text-orange-600 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-md text-xs border border-orange-100 dark:border-orange-900/50">
            Active / Not Out
          </span>
        )
    },
    {
      header: "Branch",
      accessor: (item) => (
        <span className="text-slate-600 dark:text-slate-300 text-xs">
          In: {item.branch?.name ?? "Unrecorded"}
          {" Â· "}
          Out:{" "}
          {item.clockOutBranch?.name ?? (item.clockOut ? "Unrecorded" : "â€”")}
        </span>
      )
    },
    {
      header: "Location issue",
      accessor: (item) => {
        const issues: {
          action: string
          reason: string
          at?: string | null
          isPending: boolean
        }[] = []

        if (item.locationVerified === false) {
          issues.push({
            action: "In",
            reason: item.clockInLocationFailureReason || "Pending employee explanation",
            at: item.clockInLocationFailedAt,
            isPending: !item.clockInLocationFailureReason
          })
        }
        if (item.clockOutLocationVerified === false) {
          issues.push({
            action: "Out",
            reason: item.clockOutLocationFailureReason || "Pending employee explanation",
            at: item.clockOutLocationFailedAt,
            isPending: !item.clockOutLocationFailureReason
          })
        }

        if (issues.length === 0) {
          return <span className="text-xs text-slate-400">None</span>
        }

        return (
          <div className="space-y-1 text-xs">
            {issues.map((issue) => (
              <p
                key={issue.action}
                className={
                  issue.isPending
                    ? "text-amber-600 dark:text-amber-400 font-medium"
                    : "text-red-700 dark:text-red-300"
                }
              >
                <strong>{issue.action}</strong>: {issue.reason}
                {issue.at &&
                  ` (${new Intl.DateTimeFormat("en-LK", {
                    dateStyle: "short",
                    timeStyle: "medium",
                    timeZone: "Asia/Colombo"
                  }).format(new Date(issue.at))})`}
              </p>
            ))}
          </div>
        )
      }
    },
    {
      header: "Status",
      accessor: (item) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${
            item.status === "PRESENT"
              ? "bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300"
              : "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300"
          }`}
        >
          {item.status}
        </span>
      )
    }
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            All Employees Attendance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor daily clock-in and clock-out logs of all staff members.
          </p>
        </div>

        {/* Date Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 bg-white dark:bg-slate-900 shadow-xs text-slate-700 dark:text-slate-200 font-medium"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold px-2 py-1 whitespace-nowrap cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-white dark:bg-slate-900 shadow-xs text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Reusable Responsive Table Component */}
      <ResponsiveTable
        data={filteredRecords}
        columns={columns}
        keyExtractor={(item) => item.id}
        loading={loading}
        emptyMessage="No attendance records found for the selected date or search criteria."
      />
    </div>
  )
}
