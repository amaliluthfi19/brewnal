import { create } from 'zustand'
import { User } from '@brewnal/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('brewnal_token'),
  isAuthenticated: !!localStorage.getItem('brewnal_token'),

  setAuth: (user, token) => {
    localStorage.setItem('brewnal_token', token)
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('brewnal_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
