import React, { useState } from "react"
import { isAxiosError } from "axios"
import { ConfirmDialog } from "./ConfirmDialog"
import { useElapsedTime } from "../hooks/useElapsedTime"
import {
  useGeolocation,
  type GeolocationCoordinates
} from "../hooks/useGeolocation"

interface AttendanceWidgetProps {
  todayLog: { clockIn: string; clockOut: string | null } | null
  onClockIn: (
    coordinates: GeolocationCoordinates | null,
    locationFailureReason?: string
  ) => Promise<void>
  onClockOut: (
    coordinates: GeolocationCoordinates | null,
    locationFailureReason?: string
  ) => Promise<void>
  loading?: boolean
}

export const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({
  todayLog,
  onClockIn,
  onClockOut,
  loading = false
}) => {
  const elapsedTime = useElapsedTime(todayLog?.clockIn, todayLog?.clockOut)
  const {
    error: geolocationError,
    loading: geolocationLoading,
    request
  } = useGeolocation()
  const [actionLoading, setActionLoading] = useState(false)
  const [pendingLocationFailure, setPendingLocationFailure] = useState<{
    type: "IN" | "OUT"
    coordinates: GeolocationCoordinates | null
    message: string
  } | null>(null)
  const [locationFailureReason, setLocationFailureReason] = useState("")
  const [locationFailureError, setLocationFailureError] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: "IN" | "OUT" | null
  }>({ isOpen: false, type: null })

  const handleConfirmAction = async () => {
    setActionLoading(true)
    try {
      if (confirmDialog.type === "IN") {
        const coordinates = await request()
        try {
          await onClockIn(coordinates)
        } catch (error) {
          if (
            isAxiosError<{ code?: string; message?: string }>(error) &&
            error.response?.data?.code === "LOCATION_VERIFICATION_FAILED"
          ) {
            setPendingLocationFailure({
              type: "IN",
              coordinates,
              message: error.response.data.message ?? "Location verification failed."
            })
          } else {
            throw error
          }
        }
      }
      if (confirmDialog.type === "OUT") {
        const coordinates = await request()
        try {
          await onClockOut(coordinates)
        } catch (error) {
          if (
            isAxiosError<{ code?: string; message?: string }>(error) &&
            error.response?.data?.code === "LOCATION_VERIFICATION_FAILED"
          ) {
            setPendingLocationFailure({
              type: "OUT",
              coordinates,
              message: error.response.data.message ?? "Location verification failed."
            })
          } else {
            throw error
          }
        }
      }
    } finally {
      setActionLoading(false)
      setConfirmDialog({ isOpen: false, type: null })
    }
  }

  const submitLocationFailureReason = async () => {
    const reason = locationFailureReason.trim()
    if (!pendingLocationFailure || reason.length < 5) {
      setLocationFailureError("Please enter at least 5 characters.")
      return
    }
    setActionLoading(true)
    setLocationFailureError("")
    try {
      if (pendingLocationFailure.type === "IN") {
        await onClockIn(pendingLocationFailure.coordinates, reason)
      } else {
        await onClockOut(pendingLocationFailure.coordinates, reason)
      }
      setPendingLocationFailure(null)
      setLocationFailureReason("")
    } catch (error) {
      setLocationFailureError(
        isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message ?? "Could not record attendance."
          : "Could not record attendance."
      )
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="w-full space-y-2">
      {pendingLocationFailure && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-failure-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
        >
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void submitLocationFailureReason()
            }}
            className="max-h-[92vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6 dark:bg-slate-900"
          >
            <div>
              <h2 id="location-failure-title" className="text-lg font-bold">
                Location verification failed
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {pendingLocationFailure.message}
              </p>
              <p className="mt-2 text-sm">
                Enter a reason to continue. The failed location and time will be
                recorded and shown to HR.
              </p>
            </div>
            <label className="block text-sm font-medium">
              Reason
              <textarea
                autoFocus
                required
                minLength={5}
                maxLength={1000}
                rows={4}
                value={locationFailureReason}
                onChange={(event) => setLocationFailureReason(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700"
                placeholder="Explain why you are outside the branch location."
              />
            </label>
            {locationFailureError && (
              <p role="alert" className="text-sm text-red-600">
                {locationFailureError}
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setPendingLocationFailure(null)
                  setLocationFailureReason("")
                  setLocationFailureError("")
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || locationFailureReason.trim().length < 5}
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Continue & notify HR"}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="flex items-center justify-between sm:justify-end w-full gap-3 sm:gap-4">
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={
            confirmDialog.type === "IN"
              ? "Confirm Clock In"
              : "Confirm Clock Out"
          }
          message={
            confirmDialog.type === "IN"
              ? "Are you sure you want to mark your attendance for today? You can only do this once per day."
              : "Are you sure you want to end your shift? You cannot resume this shift later."
          }
          confirmText="Yes, Confirm"
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
          isLoading={actionLoading}
          confirmButtonColor={confirmDialog.type === "IN" ? "green" : "orange"}
        />

        {todayLog && (
          <div className="flex flex-col items-start sm:items-end flex-1 sm:flex-none">
            <span className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium">
              Today's Time
            </span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              {elapsedTime}
            </span>
          </div>
        )}

        <div className="flex-shrink-0">
          {!todayLog ? (
            <button
              onClick={() => setConfirmDialog({ isOpen: true, type: "IN" })}
              disabled={actionLoading || loading}
              className="rounded-lg bg-green-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 transition-colors w-28 sm:w-40 cursor-pointer"
            >
              Clock In
            </button>
          ) : !todayLog.clockOut ? (
            <button
              onClick={() => setConfirmDialog({ isOpen: true, type: "OUT" })}
              disabled={actionLoading}
              className="rounded-lg bg-orange-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50 transition-colors w-24 sm:w-40 animate-pulse cursor-pointer"
            >
              Clock Out
            </button>
          ) : (
            <button
              disabled
              className="rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-base font-semibold text-gray-500 dark:text-slate-400 shadow-sm cursor-not-allowed w-28 sm:w-40"
            >
              Completed
            </button>
          )}
        </div>
      </div>
      {geolocationError && (
        <div className="text-xs text-red-600 dark:text-red-400">
          <span>GPS error: {geolocationError} </span>
          <button
            type="button"
            onClick={() => void request()}
            disabled={geolocationLoading}
            className="underline disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
