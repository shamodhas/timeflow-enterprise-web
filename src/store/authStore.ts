import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../types/auth"
import api from "../services/api"

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  tenantSlug: string
  isAuthenticated: boolean
  login: (user: User, token: string, refreshToken: string) => void
  setToken: (token: string) => void
  setTenantSlug: (slug: string) => void
  fetchUser: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      tenantSlug: "ijse",
      isAuthenticated: false,
      login: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
          tenantSlug: user.tenantSlug || get().tenantSlug || "ijse",
          isAuthenticated: true
        })
      },
      setToken: (token) => {
        set({ token })
      },
      setTenantSlug: (slug) => {
        set({ tenantSlug: slug.trim().toLowerCase() || "ijse" })
      },
      fetchUser: async () => {
        try {
          const response = await api.get("/auth/me")
          set({
            user: response.data,
            tenantSlug: response.data?.tenantSlug || get().tenantSlug || "ijse",
            isAuthenticated: true
          })
        } catch (error: any) {
          if (error.response?.status === 401 || error.isRefreshed === false) {
            get().logout()
          }
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        })
      }
    }),
    {
      name: "timeflow-auth",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        tenantSlug: state.tenantSlug
      })
    }
  )
)
