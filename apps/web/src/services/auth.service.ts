import { api } from '../lib/api'
import type { AuthResponse, BrewerIdentity, User } from '@brewnal/types'

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ data: AuthResponse }>('/auth/login', { email, password }),

  register: (data: { email: string; username: string; password: string; displayName?: string; brewerIdentity?: BrewerIdentity | null }) =>
    api.post<{ data: AuthResponse }>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<{ data: User }>('/auth/me'),
}
