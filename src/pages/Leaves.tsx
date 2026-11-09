import React, { useState, useEffect } from "react"
import api from "../services/api"
import { useAuthStore } from "../store/authStore"
import { showToast } from "../utils/toast"
import { ResponsiveTable, type Column } from "../components/ResponsiveTable"
import { Skeleton } from "../components/Loaders"
import { formatLeaveDays } from "../utils/leave"

interface LeaveBalance {
  leaveTypeId: string
  leaveType: string
  taken: string | number
}

interface LeaveRequestData {
  id: string
  startDate: string
  endDate: string
  totalDays: string
  status: string
  reason: string
  employee: { fullName: string; employeeCode: string }
  leaveType: { name: string }
  session?: string
  actingEmployee?: { fullName: string } | null
}

export const Leaves = () => {
  const { user } = useAuthStore()
  const isAdmin = ["SUPER_ADMIN", "HR", "ADMIN"].includes(user?.role || "")

  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [requests, setRequests] = useState<LeaveRequestData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [totalDays, setTotalDays] = useState("")
  const [session, setSession] = useState("FULL")
  const [reason, setReason] = useState("")
  const [actingEmployeeId, setActingEmployeeId] = useState("")
  const [candidates, setCandidates] = useState<
    { id: string; fullName: string; employeeCode: string }[]
  >([])
  const [myRequests, setMyRequests] = useState<LeaveRequestData[]>([])
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")
  const [holidayDates, setHolidayDates] = useState<string[]>([])
  const [newTypeQuota, setNewTypeQuota] = useState("")

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post("/leaves/types", {
        name: newTypeName.trim(),
        defaultQuota: Number(newTypeQuota)
      })
      showToast.success("Leave type added!")
      setShowTypeModal(false)
      setNewTypeName("")
      setNewTypeQuota("")
      fetchData()
    } catch (error: any) {
      showToast.error(
        error.response?.data?.message || "Failed to add leave type"
      )
    }
  }

  const fetchData = async () => {
    try {
      const balRes = await api.get("/leaves/balance")
      api
        .get("/holidays")
        .then((r) => setHolidayDates(r.data.map((h: any) => h.date)))
        .catch(() => {})
      setTotalBalance(Number(balRes.data.totalBalance))
      setBalances(balRes.data.taken)
      if (balRes.data.taken.length > 0)
        setLeaveTypeId(balRes.data.taken[0].leaveTypeId)

      const [mineRes, candRes] = await Promise.all([
        api.get("/leaves/my-requests"),
        api.get("/leaves/acting-candidates")
      ])
      setMyRequests(mineRes.data)
      setCandidates(candRes.data)

      if (isAdmin) {
        const reqRes = await api.get("/leaves/requests")
        setRequests(reqRes.data)
      }
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session === "FULL" && startDate && endDate && endDate >= startDate) {
      const span =
        (Date.parse(endDate) - Date.parse(startDate)) / 86400000 +
        1 -
        holidayDates.filter((d) => d >= startDate && d <= endDate).length
      setTotalDays(String(Math.max(span, 0)))
    }
  }, [session, startDate, endDate, holidayDates])

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post("/leaves/request", {
        leaveTypeId,
        startDate,
        endDate,
        totalDays: session === "FULL" ? Number(totalDays) : undefined,
        session,
        reason,
        actingEmployeeId: actingEmployeeId || null
      })
      showToast.success("Leave request submitted successfully!")
      setStartDate("")
      setEndDate("")
      setTotalDays("")
      setReason("")
      setActingEmployeeId("")
      fetchData()
    } catch (error: any) {
      showToast.error(
        error.response?.data?.message || "Failed to submit request"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproval = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`))
      return
    try {
      await api.patch(`/leaves/${id}/approve`, { status })
      fetchData()
    } catch (error: any) {
      showToast.error(
        error.response?.data?.message || `Failed to ${status} request`
      )
    }
  }

  // --- Columns for Admin Pending Approval Table ---
  const pendingLeaveColumns: Column<LeaveRequestData>[] = [
    {
      header: "Employee",
      accessor: (req) => (
        <span className="font-semibold text-slate-900">
          {req.employee?.fullName} ({req.employee?.employeeCode})
        </span>
      )
    },
    {
      header: "Type",
      accessor: (req) => (
        <span className="text-slate-700 font-medium">
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
      header: "Days",
      accessor: (req) => (
        <span className="text-slate-600 font-bold">
          {formatLeaveDays(req.totalDays)}
        </span>
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
    },
    {
      header: "Actions",
      accessor: (req) => (
        <div className="flex items-center space-x-3">
          {req.status === "PENDING" && (
            <>
              <button
                onClick={() => handleApproval(req.id, "APPROVED")}
                className="text-green-600 hover:underline font-semibold text-xs"
              >
                Approve
              </button>
              <button
                onClick={() => handleApproval(req.id, "REJECTED")}
                className="text-red-600 hover:underline font-semibold text-xs"
              >
                Reject
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  const myLeaveColumns: Column<LeaveRequestData>[] = [
    { header: "Type", accessor: (req) => req.leaveType?.name },
    {
      header: "Dates",
      accessor: (req) => `${req.startDate} to ${req.endDate}`
    },
    { header: "Session", accessor: (req) => req.session },
    { header: "Days", accessor: (req) => formatLeaveDays(req.totalDays) },
    {
      header: "Acting",
      accessor: (req) => req.actingEmployee?.fullName || "-"
    },
    ...pendingLeaveColumns.filter((c) => c.header === "Status")
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-sm transition-colors sm:col-span-4">
              <h3 className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                Total Leave Balance
              </h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                {formatLeaveDays(totalBalance)}
              </p>
            </div>
            {balances.map((b) => (
              <div
                key={b.leaveTypeId}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors"
              >
                <h3 className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                  {b.leaveType} Taken
                </h3>
                <p className="text-2xl sm:text-3xl font-bold mt-2 text-orange-600 dark:text-orange-400">
                  {formatLeaveDays(b.taken)}
                </p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Request New Leave Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white">
            Request New Leave
          </h2>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowTypeModal(true)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              + Add Leave Type
            </button>
          )}
        </div>
        {showTypeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Add Leave Type
              </h2>
              <form onSubmit={handleCreateType} className="space-y-4">
                <input
                  required
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Leave type name"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                />
                <input
                  required
                  type="number"
                  step="0.25"
                  min="0"
                  value={newTypeQuota}
                  onChange={(e) => setNewTypeQuota(e.target.value)}
                  placeholder="Default quota (days)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                />
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowTypeModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Leave Type
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                required
              >
                {balances.map((b) => (
                  <option key={b.leaveTypeId} value={b.leaveTypeId}>
                    {b.leaveType}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Session
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                value={session}
                onChange={(e) => setSession(e.target.value)}
              >
                <option value="FULL">Full Day</option>
                <option value="SHORT">Short Leave</option>
                <option value="MORNING">Morning Half</option>
                <option value="AFTERNOON">Evening Half</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Total Days
              </label>
              <input
                type={session === "FULL" ? "number" : "text"}
                min={1}
                step="1"
                required={session === "FULL"}
                disabled={session !== "FULL"}
                value={
                  session === "FULL"
                    ? totalDays
                    : formatLeaveDays(session === "SHORT" ? 0.25 : 0.5)
                }
                onChange={(e) => setTotalDays(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
                placeholder="E.g. 1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Acting Person (optional)
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
                value={actingEmployeeId}
                onChange={(e) => setActingEmployeeId(e.target.value)}
              >
                <option value="">None</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Reason{" "}
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 h-24"
              placeholder="Provide reason for leave..."
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>

      {/* My Requests */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          My Leave Requests
        </h2>
        <ResponsiveTable
          data={myRequests}
          columns={myLeaveColumns}
          keyExtractor={(req) => req.id}
          loading={loading}
          emptyMessage="You have not requested any leave yet."
        />
      </div>

      {/* Admin Approval Queue (Using ResponsiveTable) */}
      {isAdmin && (
        <div className="space-y-3 mt-8">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Pending Leave Approvals
          </h2>
          <ResponsiveTable
            data={requests}
            columns={pendingLeaveColumns}
            keyExtractor={(req) => req.id}
            loading={loading}
            emptyMessage="No leave requests found."
          />
        </div>
      )}
    </div>
  )
}