import { useState, useEffect } from "react"
import { showToast } from "../utils/toast"
import {
  getDashboardStats,
  getMyDashboardStats
} from "../services/dashboard.service"
import {
  clockIn,
  clockOut,
  getMyTodayAttendance
} from "../services/attendance.service"
import { AttendanceWidget } from "../components/AttendanceWidget"
import { useAuthStore } from "../store/authStore"
import type { GeolocationCoordinates } from "../hooks/useGeolocation"
import { isAxiosError } from "axios"

interface LocationFailureCase {
  id: string
  clockIn: string
  clockOut: string | null
  createdAt?: string
  distanceMeters?: number | null
  clockOutDistanceMeters?: number | null
  locationVerified?: boolean | null
  clockOutLocationVerified?: boolean | null
  clockInLocationFailureReason?: string | null
  clockOutLocationFailureReason?: string | null
  employee?: {
    id: string
    fullName: string
    employeeCode: string
    email?: string
  }
  branch?: { id: string; name: string } | null
  clockOutBranch?: { id: string; name: string } | null
}

interface CompanyStats {
  presentToday: number
  onLeave: number
  pendingApprovals: number
  totalEmployees: number
  locationFailuresCount?: number
  recentLocationFailures?: LocationFailureCase[]
}

interface MyStats {
  availableLeaves: number
  usedLeaves: number
  thisMonthPresent: number
  pendingPersonalLeaves: number
}

interface AttendanceLog {
  id: string
  clockIn: string
  clockOut: string | null
  status: string
}

export const Dashboard = () => {
  const { user, fetchUser } = useAuthStore()
  const role = user?.role || "EMPLOYEE"

  const showPersonalSummary = role === "EMPLOYEE" || role === "HR"
  const showCompanySummary =
    role === "HR" || role === "ADMIN" || role === "SUPER_ADMIN"

  const [companyStats, setCompanyStats] = useState<CompanyStats>({
    presentToday: 0,
    onLeave: 0,
    pendingApprovals: 0,
    totalEmployees: 0,
    locationFailuresCount: 0,
    recentLocationFailures: []
  })

  const [myStats, setMyStats] = useState<MyStats>({
    availableLeaves: 0,
    usedLeaves: 0,
    thisMonthPresent: 0,
    pendingPersonalLeaves: 0
  })

  const [todayLog, setTodayLog] = useState<AttendanceLog | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      if (!user) {
        await fetchUser()
      }

      const apiCalls: Promise<any>[] = []

      if (showCompanySummary) {
        apiCalls.push(getDashboardStats().then(setCompanyStats))
      }
      if (showPersonalSummary) {
        apiCalls.push(
          getMyTodayAttendance().then((res) => setTodayLog(res || null))
        )
        apiCalls.push(getMyDashboardStats().then(setMyStats))
      }

      await Promise.all(apiCalls)
    } catch (error: any) {
      console.error(error)
      showToast.error(
        error.response?.data?.message || "Failed to load dashboard data"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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
      await fetchData()
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
      await fetchData()
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

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {showPersonalSummary && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-sm transition-colors">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                Personal Overview
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
                Welcome back, {user?.fullName || "User"}!
              </p>
            </div>
            <div className="w-full lg:w-auto border-t border-gray-100 dark:border-slate-800 lg:border-0 pt-3 lg:pt-0">
              <AttendanceWidget
                todayLog={todayLog}
                onClockIn={executeClockIn}
                onClockOut={executeClockOut}
                loading={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-gray-500 dark:text-slate-400 text-[11px] sm:text-sm font-medium uppercase tracking-wider">
                Available Leaves
              </h3>
              <p className="text-xl sm:text-3xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
                {loading ? <span className="inline-block h-7 w-12 skeleton rounded align-middle" /> : myStats.availableLeaves}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-gray-500 dark:text-slate-400 text-[11px] sm:text-sm font-medium uppercase tracking-wider">
                Leaves Used
              </h3>
              <p className="text-xl sm:text-3xl font-bold mt-2 text-amber-600 dark:text-amber-400">
                {loading ? <span className="inline-block h-7 w-12 skeleton rounded align-middle" /> : myStats.usedLeaves}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-gray-500 dark:text-slate-400 text-[11px] sm:text-sm font-medium uppercase tracking-wider">
                Monthly Present
              </h3>
              <p className="text-xl sm:text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                {loading ? <span className="inline-block h-7 w-12 skeleton rounded align-middle" /> : myStats.thisMonthPresent}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm col-span-2 lg:col-span-1 transition-colors">
              <h3 className="text-gray-500 dark:text-slate-400 text-[11px] sm:text-sm font-medium uppercase tracking-wider">
                Pending Leaves
              </h3>
              <p className="text-xl sm:text-3xl font-bold mt-2 text-purple-600 dark:text-purple-400">
                {loading ? <span className="inline-block h-7 w-12 skeleton rounded align-middle" /> : myStats.pendingPersonalLeaves}
              </p>
            </div>
          </div>
        </div>
      )}

      {showCompanySummary && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-slate-100">
              Company Overview
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-sm font-medium uppercase tracking-wider">
                Total Employees
              </h3>
              <p className="text-xl sm:text-3xl font-bold mt-2 text-slate-800 dark:text-slate-100">
                {loading ? <span className="inline-block h-7 w-12 skeleton rounded align-middle" /> : companyStats.totalEmployees}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-sm font-medium uppercase tracking-wider">
                Present Today
              </h3>
              <p className="text-xl sm:text-3xl font-bold mt-2 text-emerald-700 dark:text-emerald-400">
                {loading ? <span className="inline-block h-7 w-12 skeleton rounded align-middle" /> : companyStats.presentToday}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-sm font-medium uppercase tracking-wider">
                On Leave Today
              </h3>
              <p className="text-xl sm:text-3xl font-bold mt-2 text-amber-700 dark:text-amber-400">
                {loading ? <span className="inline-block h-7 w-12 skeleton rounded align-middle" /> : companyStats.onLeave}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-sm font-medium uppercase tracking-wider">
                Pending Approvals
              </h3>
              <p className="text-xl sm:text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                {loading ? <span className="inline-block h-7 w-12 skeleton rounded align-middle" /> : companyStats.pendingApprovals}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 rounded-xl border border-rose-200 dark:border-rose-950 shadow-sm col-span-2 lg:col-span-1 transition-colors">
              <h3 className="text-rose-500 dark:text-rose-400 text-[11px] sm:text-sm font-medium uppercase tracking-wider">
                Location Failures
              </h3>
              <p className="text-xl sm:text-3xl font-bold mt-2 text-rose-600 dark:text-rose-400">
                {loading ? <span className="inline-block h-7 w-12 skeleton rounded align-middle" /> : (companyStats.locationFailuresCount || 0)}
              </p>
            </div>
          </div>

          {/* Location Verification Failures List */}
          {companyStats.recentLocationFailures && companyStats.recentLocationFailures.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-950 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="text-rose-500">⚠️</span> Location Verification Failures
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Employees who clocked in or out outside authorized branch boundaries
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-full border border-rose-200 dark:border-rose-900">
                  {companyStats.recentLocationFailures.length} Case(s)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800 text-xs text-gray-400 uppercase">
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Event & Time</th>
                      <th className="py-2.5 px-3">Location & Distance</th>
                      <th className="py-2.5 px-3">Reason / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {companyStats.recentLocationFailures.map((failure) => {
                      const emp = failure.employee
                      const isClockOutFailed = failure.clockOutLocationVerified === false
                      const reason = isClockOutFailed
                        ? failure.clockOutLocationFailureReason
                        : failure.clockInLocationFailureReason
                      const branchName = isClockOutFailed
                        ? failure.clockOutBranch?.name
                        : failure.branch?.name
                      const distance = isClockOutFailed
                        ? failure.clockOutDistanceMeters
                        : failure.distanceMeters
                      const actionText = isClockOutFailed ? "Clock Out" : "Clock In"
                      const shiftTime = isClockOutFailed ? failure.clockOut : failure.clockIn

                      return (
                        <tr key={failure.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-gray-900 dark:text-slate-100">
                              {emp?.fullName || "Employee"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">
                              Code: {emp?.employeeCode} {emp?.email ? `· ${emp.email}` : ""}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mr-2">
                              {actionText}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-slate-300">
                              {shiftTime ? new Date(shiftTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                            </span>
                            <div className="text-[11px] text-gray-400">
                              {shiftTime ? new Date(shiftTime).toISOString().slice(0, 10) : ""}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-rose-600 dark:text-rose-400 font-medium text-xs">
                              {distance ? `${distance}m from ${branchName || "branch perimeter"}` : "Outside branch perimeter"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {reason ? (
                              <div className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                                "{reason}"
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                                ⚠️ Reason Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
