import { useEffect, useRef } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export const ProtectedRoute = () => {
  const { token, refreshToken, isAuthenticated, user, fetchUser, logout } =
    useAuthStore()

  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    if ((token || refreshToken) && !user) {
      fetchUser().catch(() => {
        logout()
      })
    }
  }, [token, refreshToken, user, fetchUser, logout])

  if (!isAuthenticated && !token && !refreshToken) {
    return <Navigate to='/auth/login' replace />
  }

  return <Outlet />
}
