import api from "./api"

export interface Branch {
  id: string
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
  isActive: boolean
}

export interface BranchPayload {
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
}

export const getBranches = async (): Promise<Branch[]> => {
  const response = await api.get<Branch[]>("/branches")
  return response.data
}

export const createBranch = async (payload: BranchPayload) => {
  const response = await api.post("/branches", payload)
  return response.data
}

export const updateBranch = async (
  id: string,
  payload: BranchPayload & { isActive: boolean }
) => {
  const response = await api.patch(`/branches/${id}`, payload)
  return response.data
}
