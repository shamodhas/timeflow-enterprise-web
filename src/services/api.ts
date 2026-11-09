import axios from "axios"
import { useAuthStore } from "../store/authStore"
import { refreshAuthToken } from "./auth.service"
import { useLoaderStore } from "../store/loader.store"

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json"
  }
})

const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/google",
  "/auth/register",
  "/auth/refresh"
]

const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint))
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token!)
  })
  failedQueue = []
}

api.interceptors.request.use(
  (config) => {
    if (!config.headers["X-Skip-Loader"]) {
      useLoaderStore.getState().increment()
    }

    if (!isPublicEndpoint(config.url)) {
      const token = useAuthStore.getState().token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    if (error.config && !error.config.headers["X-Skip-Loader"]) {
      useLoaderStore.getState().decrement()
    }
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    if (!response.config.headers["X-Skip-Loader"]) {
      useLoaderStore.getState().decrement()
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (originalRequest && !originalRequest.headers["X-Skip-Loader"]) {
      useLoaderStore.getState().decrement()
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = useAuthStore.getState().refreshToken

      if (!refreshToken) {
        useAuthStore.getState().logout()
        return Promise.reject({
          ...error,
          message: "No refresh token available"
        })
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            if (!originalRequest.headers["X-Skip-Loader"]) {
              useLoaderStore.getState().increment() 
            }
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      try {
        const response = await refreshAuthToken(refreshToken)
        const newAccessToken = response.token

        useAuthStore.getState().setToken(newAccessToken)
        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        if (!originalRequest.headers["X-Skip-Loader"]) {
          useLoaderStore.getState().increment()
        }

        return api(originalRequest)
      } catch (refreshError: any) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        return Promise.reject({
          ...refreshError,
          isRefreshed: false,
          message: refreshError.message || "Token refresh failed"
        })
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
