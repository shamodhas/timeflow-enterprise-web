import api from "./api"

export const getMyAttendance = async () => {
  const res = await api.get("/attendance/me")
  return res.data
}

export const getMyTodayAttendance = async () => {
  const res = await api.get("/attendance/me/today")
  return res.data
}

export const getAllAttendance = async (date?: string) => {
  let url = "/attendance/all"
  if (date) url += `?date=${date}`
  const res = await api.get(url)
  return res.data
}

export const clockIn = async (
  latitude?: number,
  longitude?: number,
  locationFailureReason?: string
) => {
  const payload: {
    latitude?: number
    longitude?: number
    locationFailureReason?: string
  } = {}
  if (latitude !== undefined && longitude !== undefined) {
    payload.latitude = latitude
    payload.longitude = longitude
  }
  if (locationFailureReason) payload.locationFailureReason = locationFailureReason
  const res = await api.post("/attendance/clock-in", payload)
  return res.data
}

export const clockOut = async (
  latitude?: number,
  longitude?: number,
  locationFailureReason?: string
) => {
  const payload: {
    latitude?: number
    longitude?: number
    locationFailureReason?: string
  } = {}
  if (latitude !== undefined && longitude !== undefined) {
    payload.latitude = latitude
    payload.longitude = longitude
  }
  if (locationFailureReason) payload.locationFailureReason = locationFailureReason
  const res = await api.post("/attendance/clock-out", payload)
  return res.data
}

export const getEmployeeDetails = async (
  employeeId: string,
  startDate?: string,
  endDate?: string
) => {
  let url = `/attendance/employee/${employeeId}`
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`
  }
  const res = await api.get(url)
  return res.data
}

export const importBulkAttendance = async (attendanceLogs: any[]) => {
  const res = await api.post("/import/attendance", { attendanceLogs })
  return res.data
}
