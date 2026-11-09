import api from "./api"

export const getEmployees = async () => {
  const res = await api.get("/employees")
  return res.data
}

export const getPendingEmployees = async () => {
  const res = await api.get("/employees/pending")
  return res.data
}

export const createEmployee = async (data: any) => {
  const res = await api.post("/employees", data)
  return res.data
}

export const inviteEmployee = async (employeeData: any) => {
  const response = await api.post('/api/employees/invite', employeeData);
  return response.data;
};

export const updateEmployee = async (id: string, data: any) => {
  const res = await api.put(`/employees/${id}`, data)
  return res.data
}

export const deleteEmployee = async (id: string) => {
  const res = await api.delete(`/employees/${id}`)
  return res.data
}

export const updateEmployeeStatus = async (
  id: string,
  status: "ACTIVE" | "REJECTED"
) => {
  const res = await api.patch(`/employees/${id}/status`, { status })
  return res.data
}

export const importEmployees = async (employees: any[]) => {
  const res = await api.post("/import/employees", { employees })
  return res.data
}
