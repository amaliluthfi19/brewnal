import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './lib/i18n' // init i18n

import { useAuthStore } from './store/auth.store'

// Pages (to be created)
// import { DashboardPage } from './pages/Dashboard'
// import { BeansPage } from './pages/Beans'
// import { BrewsPage } from './pages/Brews'
// import { LoginPage } from './pages/Login'
// import { RegisterPage } from './pages/Register'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<div>Login Page — coming soon</div>} />
          <Route path="/register" element={<div>Register Page — coming soon</div>} />

          {/* Protected */}
          <Route path="/" element={<ProtectedRoute><div>Dashboard — coming soon</div></ProtectedRoute>} />
          <Route path="/beans" element={<ProtectedRoute><div>Beans — coming soon</div></ProtectedRoute>} />
          <Route path="/beans/:id" element={<ProtectedRoute><div>Bean Detail — coming soon</div></ProtectedRoute>} />
          <Route path="/brews" element={<ProtectedRoute><div>Brews — coming soon</div></ProtectedRoute>} />
          <Route path="/brews/:id" element={<ProtectedRoute><div>Brew Detail — coming soon</div></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
