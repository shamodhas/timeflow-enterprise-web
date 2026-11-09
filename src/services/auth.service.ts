import api from "./api"

export const login = async (credentials: {
  email: string
  password: string
}) => {
  const res = await api.post("/auth/login", credentials)
  return res.data
}

export const googleLogin = async (token: string) => {
  const res = await api.post("/auth/google", { token })
  return res.data
}

export const register = async (formData: any) => {
  const res = await api.post("/auth/register", formData)
  return res.data
}

export const completeRegistration = async (data: { token: string; password: string }) => {
  const response = await api.post('/api/auth/complete-registration', data);
  return response.data;
};

export const getMe = async () => {
  const res = await api.get("/auth/me")
  return res.data
}

export const refreshAuthToken = async (refreshToken: string) => {
  const res = await api.post("/auth/refresh", { refreshToken })
  return res.data
}
