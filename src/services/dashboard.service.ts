import api from "./api"

export const getDashboardStats = async () => {
  const res = await api.get("/dashboard/company")
  return res.data
}

export const getMyDashboardStats = async () => {
  const response = await api.get('/dashboard/me');
  return response.data;
};