import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types/auth'
import { PageLoader } from './Loaders'

interface RoleRouteProps {
  allowedRoles: UserRole[]
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user, token, refreshToken } = useAuthStore()

  if ((token || refreshToken) && !user) {
    return <PageLoader fullScreen label='Loading your session' />
  }

  const userRole = user?.role as UserRole

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to='/app/dashboard' replace />
  }

  return <Outlet />
}
