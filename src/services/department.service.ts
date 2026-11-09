import api from "./api"

export const getDepartments = async () => {
  const res = await api.get("/departments")
  return res.data
}

export const createDepartment = async (name: string) => {
  const res = await api.post("/departments", { name })
  return res.data
}
