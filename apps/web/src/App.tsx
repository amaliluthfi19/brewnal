import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './lib/i18n'

import { useAuthStore } from './store/auth.store'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { BeansPage } from './pages/beans/BeansPage'
import { BeanDetailPage } from './pages/beans/BeanDetailPage'
import { BeanFormPage } from './pages/beans/BeanFormPage'
import { BrewsPage } from './pages/brews/BrewsPage'
import { BrewDetailPage } from './pages/brews/BrewDetailPage'
import { BrewFormPage } from './pages/brews/BrewFormPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuthStore()
  if (isInitializing) return null
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AuthInit() {
  const initAuth = useAuthStore((s) => s.initAuth)
  useEffect(() => { initAuth() }, [])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInit />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected — wrapped in Layout with Navbar */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/beans" element={<BeansPage />} />
            <Route path="/beans/new" element={<BeanFormPage />} />
            <Route path="/beans/:id" element={<BeanDetailPage />} />
            <Route path="/beans/:id/edit" element={<BeanFormPage />} />
            <Route path="/brews" element={<BrewsPage />} />
            <Route path="/brews/new" element={<BrewFormPage />} />
            <Route path="/brews/:id" element={<BrewDetailPage />} />
            <Route path="/brews/:id/edit" element={<BrewFormPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
