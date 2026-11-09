import { useState, useEffect } from "react"
import { showToast } from "../utils/toast"
import {
  clockIn,
  clockOut,
  getMyAttendance,
  getMyTodayAttendance
} from "../services/attendance.service"
import { AttendanceWidget } from "../components/AttendanceWidget"
import { ResponsiveTable, type Column } from "../components/ResponsiveTable"
import { TableSkeleton } from "../components/Loaders"
import type { GeolocationCoordinates } from "../hooks/useGeolocation"
import { isAxiosError } from "axios"

interface AttendanceLog {
  id: string
  clockIn: string
  clockOut: string | null
  status: string
  branch?: { name: string } | null
  clockOutBranch?: { name: string } | null
  clockInLocationFailureReason?: string | null
  clockInLocationFailedAt?: string | null
  clockOutLocationFailureReason?: string | null
  clockOutLocationFailedAt?: string | null
}

type WeeklyAttendance = Record<string, AttendanceLog[]>

export const Attendance = () => {
  const [logs, setLogs] = useState<WeeklyAttendance>({})
  const [todayLog, setTodayLog] = useState<AttendanceLog | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      const [res, resToday] = await Promise.all([
        getMyAttendance(),
        getMyTodayAttendance()
      ])

      setLogs(res)
      setTodayLog(resToday || null)
    } catch (error) {
      console.error("Failed to fetch attendance logs", error)
      showToast.error("Failed to load attendance history.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const executeClockIn = async (
    coordinates: GeolocationCoordinates | null,
    locationFailureReason?: string
  ) => {
    try {
      await clockIn(
        coordinates?.latitude,
        coordinates?.longitude,
        locationFailureReason
      )
      await fetchLogs()
      showToast.success("Clocked in successfully")
    } catch (error: any) {
      if (
        !isAxiosError(error) ||
        error.response?.data?.code !== "LOCATION_VERIFICATION_FAILED"
      ) {
        showToast.error(error.response?.data?.message || "Clock In failed")
      }
      throw error
    }
  }

  const executeClockOut = async (
    coordinates: GeolocationCoordinates | null,
    locationFailureReason?: string
  ) => {
    try {
      await clockOut(
        coordinates?.latitude,
        coordinates?.longitude,
        locationFailureReason
      )
      await fetchLogs()
      showToast.success("Clocked out successfully")
    } catch (error: any) {
      if (
        !isAxiosError(error) ||
        error.response?.data?.code !== "LOCATION_VERIFICATION_FAILED"
      ) {
        showToast.error(error.response?.data?.message || "Clock Out failed")
      }
      throw error
    }
  }

  const sortedWeeks = Object.keys(logs).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, "")) || 0
    const numB = parseInt(b.replace(/\D/g, "")) || 0
    return numB - numA
  })

  // Columns definition for ResponsiveTable
  const columns: Column<AttendanceLog>[] = [
    {
      header: "Date",
      accessor: (log) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900 dark:text-slate-100">
            {new Date(log.clockIn).toLocaleDateString("en-LK", {
              weekday: "short",
              month: "short",
              day: "numeric"
            })}
          </span>
          {new Date(log.clockIn).toDateString() ===
            new Date().toDateString() && (
            <span className="rounded bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              Today
            </span>
          )}
        </div>
      )
    },
    {
      header: "Clock In",
      accessor: (log) => (
        <span className="font-mono text-xs text-gray-600 dark:text-slate-300">
          {new Date(log.clockIn).toLocaleTimeString("en-LK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          })}
        </span>
      )
    },
    {
      header: "Clock Out",
      accessor: (log) =>
        log.clockOut ? (
          <span className="font-mono text-xs text-gray-600 dark:text-slate-300">
            {new Date(log.clockOut).toLocaleTimeString("en-LK", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            })}
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1.5 text-orange-600 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-md border border-orange-100 dark:border-orange-900/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span>Active Shift</span>
          </span>
        )
    },
    {
      header: "Branch",
      accessor: (log) => (
        <span className="text-xs text-gray-600 dark:text-slate-300">
          In: {log.branch?.name ?? "Unrecorded"}
          {" · "}
          Out: {log.clockOutBranch?.name ?? (log.clockOut ? "Unrecorded" : "—")}
        </span>
      )
    },
    {
      header: "Location issue",
      accessor: (log) => {
        const issues = [
          log.clockInLocationFailureReason
            ? {
            action: "In",
            reason: log.clockInLocationFailureReason,
            at: log.clockInLocationFailedAt
            }
            : null,
          log.clockOutLocationFailureReason
            ? {
            action: "Out",
            reason: log.clockOutLocationFailureReason,
            at: log.clockOutLocationFailedAt
            }
            : null
        ].filter(
          (
            issue
          ): issue is {
            action: string
            reason: string
            at: string | null | undefined
          } => issue !== null
        )
        return issues.length ? (
          <div className="space-y-1 text-xs text-red-700 dark:text-red-300">
            {issues.map((issue) => (
              <p key={issue.action}>
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
        ) : (
          <span className="text-xs text-slate-400">None</span>
        )
      }
    },
    {
      header: "Status",
      accessor: (log) => (
        <span
          className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${
            log.status === "PRESENT"
              ? "bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300"
              : "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200"
          }`}
        >
          {log.status}
        </span>
      )
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      {/* 1. Header Box */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm gap-4 transition-colors">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
            My Attendance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Showing all records for this month, organized by week.
          </p>
        </div>

        <div className="w-full md:w-auto border-t border-gray-100 dark:border-slate-800 md:border-0 pt-3 md:pt-0">
          <AttendanceWidget
            todayLog={todayLog}
            onClockIn={executeClockIn}
            onClockOut={executeClockOut}
            loading={loading}
          />
        </div>
      </div>

      {/* 2. Responsive Tables grouped by Week */}
      {loading ? (
        <TableSkeleton />
      ) : sortedWeeks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 text-center text-gray-500 dark:text-slate-400 shadow-sm transition-colors">
          No attendance records found for this month.
        </div>
      ) : (
        <div className="space-y-6">
          {sortedWeeks.map((week) => (
            <div key={week} className="space-y-3">
              <div className="bg-gray-100/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">
                  {week}
                </h3>
              </div>
              <ResponsiveTable
                data={logs[week]}
                columns={columns}
                keyExtractor={(log) => log.id}
                emptyMessage="No records for this week."
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}