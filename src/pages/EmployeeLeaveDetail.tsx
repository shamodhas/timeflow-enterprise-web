import React, { useState, useEffect } from "react"
import { formatLeaveDays } from "../utils/leave"
import { useParams, useNavigate } from "react-router-dom"
import { showToast } from "../utils/toast"
import {
  adjustEmployeeLeaveBalance,
  getEmployeeLeaveDetails,
  getLeaveTypes
} from "../services/leave.service"
import { getEmployeeDetails } from "../services/attendance.service"
import { ResponsiveTable, type Column } from "../components/ResponsiveTable"
import { PageLoader } from "../components/Loaders"

interface LeaveBalance {
  leaveTypeId: string
  leaveType: string
  balance: number
}

interface LeaveRequestItem {
  id: string
  startDate: string
  endDate: string
  totalDays: number
  status: string
  reason: string
  leaveType: { name: string }
}

interface LeaveTypeOption {
  id: string
  name: string
}

interface AttendanceRecord {
  id: string
  createdAt: string
  clockIn: string | null
  clockOut: string | null
  status: string
}

export const EmployeeLeaveDetail = () => {
  const { employeeId } = useParams()
  const navigate = useNavigate()

  const [employee, setEmployee] = useState<any>(null)
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [requests, setRequests] = useState<LeaveRequestItem[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeOption[]>([])

  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([])
  const [currentWeekHours, setCurrentWeekHours] = useState<number>(0)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [loading, setLoading] = useState(true)

  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState("")
  const [adjustAmount, setAdjustAmount] = useState("")
  const [adjustmentType, setAdjustmentType] = useState<"ADD" | "DEDUCT">("ADD")
  const [reason, setReason] = useState("")

  const fetchDetails = async () => {
    try {
      if (!employeeId) return
      const [detailRes, typeRes, attRes] = await Promise.all([
        getEmployeeLeaveDetails(employeeId),
        getLeaveTypes(),
        getEmployeeDetails(employeeId, startDate, endDate)
      ])

      setEmployee(detailRes.employee)
      setBalances(detailRes.balances)
      setTotalBalance(Number(detailRes.totalBalance))
      setRequests(detailRes.requests)
      setLeaveTypes(typeRes)

      setAttendanceRecords(attRes.attendanceRecords)
      setCurrentWeekHours(attRes.currentWeekHours)

      if (typeRes.length > 0 && !selectedLeaveTypeId) {
        setSelectedLeaveTypeId(typeRes[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch employee details", error)
      showToast.error("Failed to load employee details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [employeeId, startDate, endDate])

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId) return
    try {
      await adjustEmployeeLeaveBalance(employeeId, {
        leaveTypeId: selectedLeaveTypeId,
        amount: Number(adjustAmount),
        adjustmentType,
        reason
      })
      showToast.success("Leave balance adjusted successfully!")
      setShowAdjustModal(false)
      setAdjustAmount("")
      setReason("")
      fetchDetails()
    } catch (error: any) {
      showToast.error(
        error.response?.data?.message || "Failed to adjust balance"
      )
    }
  }

  const leaveColumns: Column<LeaveRequestItem>[] = [
    {
      header: "Leave Type",
      accessor: (req) => (
        <span className="font-medium text-slate-900">
          {req.leaveType?.name}
        </span>
      )
    },
    {
      header: "Dates",
      accessor: (req) => (
        <span className="text-slate-600 font-mono text-xs">
          {req.startDate} to {req.endDate}
        </span>
      )
    },
    {
      header: "Total Days",
      accessor: (req) => (
        <span className="text-slate-600">{formatLeaveDays(req.totalDays)}</span>
      )
    },
    {
      header: "Reason",
      accessor: (req) => (
        <span className="text-slate-600 truncate max-w-xs">{req.reason}</span>
      )
    },
    {
      header: "Status",
      accessor: (req) => (
        <span
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${
            req.status === "APPROVED"
              ? "bg-green-100 text-green-800"
              : req.status === "REJECTED"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {req.status}
        </span>
      )
    }
  ]

  const attendanceColumns: Column<AttendanceRecord>[] = [
    {
      header: "Date",
      accessor: (att) => (
        <span className="font-medium text-slate-900 font-mono text-xs">
          {att.createdAt
            ? new Date(att.createdAt).toISOString().split("T")[0]
            : "N/A"}
        </span>
      )
    },
    {
      header: "Clock In",
      accessor: (att) => (
        <span className="text-slate-600 font-mono text-xs">
          {att.clockIn ? new Date(att.clockIn).toLocaleTimeString() : "N/A"}
        </span>
      )
    },
    {
      header: "Clock Out",
      accessor: (att) => (
        <span className="text-slate-600 font-mono text-xs">
          {att.clockOut
            ? new Date(att.clockOut).toLocaleTimeString()
            : "Active / Not Out"}
        </span>
      )
    },
    {
      header: "Status",
      accessor: (att) => (
        <span
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${
            att.status === "PRESENT"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {att.status}
        </span>
      )
    }
  ]

  if (loading) return <PageLoader label="Loading details" />

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
        >
          &larr; Back to Employees
        </button>
        <button
          onClick={() => setShowAdjustModal(true)}
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors cursor-pointer"
        >
          + Adjust Leaves
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="min-w-0 break-words">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {employee?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {employee?.employeeCode} | {employee?.email}
          </p>
        </div>
        <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 tracking-wide uppercase">
          {employee?.role}
        </span>
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Leave Balances Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="sm:col-span-3 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-sm transition-colors">
            <h3 className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
              Total Leave Balance
            </h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">
              {formatLeaveDays(totalBalance)}
            </p>
          </div>
          {balances.map((b, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors"
            >
              <h3 className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                {b.leaveType} Taken
              </h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2 text-orange-600 dark:text-orange-400">
                {formatLeaveDays(b.balance)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Leave History & Requests
        </h2>
        <ResponsiveTable
          data={requests}
          columns={leaveColumns}
          keyExtractor={(req) => req.id}
          emptyMessage="No leave history found for this employee."
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Attendance & Working Hours
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Showing records for the selected date range (Default: Current
              Week)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 bg-white dark:bg-slate-800 shadow-xs font-medium text-slate-700 dark:text-slate-200"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 bg-white dark:bg-slate-800 shadow-xs font-medium text-slate-700 dark:text-slate-200"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("")
                  setEndDate("")
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold ml-2 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-emerald-900 dark:text-emerald-300 text-sm font-bold">
              Total Working Hours
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
              {startDate && endDate
                ? `From ${startDate} to ${endDate}`
                : "Current Week Summary"}
            </p>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {currentWeekHours} Hrs
          </p>
        </div>

        <div className="pt-2">
          <ResponsiveTable
            data={attendanceRecords}
            columns={attendanceColumns}
            keyExtractor={(att) => att.id}
            emptyMessage="No attendance records found for this period."
          />
        </div>
      </div>

      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Adjust Leave Balance
            </h2>
            <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Leave Type
                </label>
                <select
                  value={selectedLeaveTypeId}
                  onChange={(e) => setSelectedLeaveTypeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                >
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Action Type
                </label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                >
                  <option value="ADD">Add Days (Accrual)</option>
                  <option value="DEDUCT">Deduct Days (Deduction)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Number of Days
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                  placeholder="E.g. 2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Reason / Note
                </label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm h-20 font-medium text-slate-700 dark:text-slate-200"
                  placeholder="E.g. Manual correction / Bonus leave"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
