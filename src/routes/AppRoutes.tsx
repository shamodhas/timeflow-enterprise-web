import { Routes as RouterDomRoutes, Route, Navigate } from 'react-router-dom'
import { Suspense, type ComponentType, type ReactNode } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { PageLoader } from '../components/Loaders'
import { RoleRoute } from '../components/RoleRoute'
import {
  publicRoutes,
  staffRoutes,
  managementRoutes,
  adminsRoutes,
  systemRoutes,
  type RouteConfig
} from './routes'
import type { LayoutType } from '../types/layout.ts'

import MainLayout from '../layouts/MainLayout.tsx'
import DashboardLayout from '../layouts/DashboardLayout.tsx'
import BlankLayout from '../layouts/BlankLayout.tsx'

const layoutMap: Record<LayoutType, ComponentType<{ children: ReactNode }>> = {
  MainLayout,
  DashboardLayout,
  BlankLayout
}

const renderRoutes = (routes: RouteConfig[]) => {
  return routes.map((route, index) => {
    const Layout =
      layoutMap[route.layout || 'DashboardLayout'] || DashboardLayout

    const element = (
      <Layout>
        <route.component />
      </Layout>
    )

    if (route.roles && route.roles.length > 0) {
      return (
        <Route
          key={`${route.path}-${index}`}
          element={<RoleRoute allowedRoles={route.roles} />}
        >
          <Route path={route.path} element={element} />
        </Route>
      )
    }

    return (
      <Route
        key={`${route.path}-${index}`}
        path={route.path}
        element={element}
      />
    )
  })
}

export const AppRouter = () => {
  return (
    <Suspense
      fallback={<PageLoader fullScreen label='Loading' />}
    >
      <RouterDomRoutes>
        {renderRoutes(publicRoutes)}

        <Route element={<ProtectedRoute />}>
          {renderRoutes(staffRoutes)}
          {renderRoutes(managementRoutes)}
          {renderRoutes(adminsRoutes)}
          {renderRoutes(systemRoutes)}
        </Route>

        <Route path='*' element={<Navigate to='/app/dashboard' replace />} />
      </RouterDomRoutes>
    </Suspense>
  )
}
