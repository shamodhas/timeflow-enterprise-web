import api from "./api"

export const getLeaveTypes = async () => {
  const res = await api.get("/leaves/types")
  return res.data
}

export const createLeaveType = async (data: {
  name: string
  defaultQuota: number
}) => {
  const res = await api.post("/leaves/types", data)
  return res.data
}

export const getLeaveBalances = async () => {
  const res = await api.get("/leaves/balance")
  return res.data
}

export const getAllLeaveRequests = async () => {
  const res = await api.get("/leaves/requests")
  return res.data
}

export const requestLeave = async (data: any) => {
  const res = await api.post("/leaves/request", data)
  return res.data
}

export const approveLeaveRequest = async (
  id: string,
  status: "APPROVED" | "REJECTED"
) => {
  const res = await api.patch(`/leaves/${id}/approve`, { status })
  return res.data
}

export const getEmployeeLeaveDetails = async (employeeId: string) => {
  const res = await api.get(`/leaves/employee/${employeeId}`)
  return res.data
}

export const adjustEmployeeLeaveBalance = async (
  employeeId: string,
  data: any
) => {
  const res = await api.post(`/leaves/employee/${employeeId}/adjust`, data)
  return res.data
}

export const importLeaves = async (leaveRecords: any[]) => {
  const res = await api.post("/import/leaves", { leaveRecords })
  return res.data
}
