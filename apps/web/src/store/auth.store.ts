import { create } from 'zustand'
import { User } from '@brewnal/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  setAuth: (user: User) => void
  logout: () => void
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (user) => set({ user, isAuthenticated: true }),

  logout: () => set({ user: null, isAuthenticated: false }),

  initAuth: async () => {
    try {
      const { authService } = await import('../services/auth.service')
      const res = await authService.me()
      set({ user: res.data.data, isAuthenticated: true, isInitializing: false })
    } catch {
      set({ user: null, isAuthenticated: false, isInitializing: false })
    }
  },
}))
