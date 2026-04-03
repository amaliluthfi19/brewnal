import { api } from '../lib/api'
import type { AuthResponse, BrewerLevel, User } from '@brewnal/types'

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ data: AuthResponse }>('/auth/login', { email, password }),

  register: (data: { email: string; username: string; password: string; displayName?: string, brewerLevel: BrewerLevel }) =>
    api.post<{ data: AuthResponse }>('/auth/register', data),

  me: () => api.get<{ data: User }>('/auth/me'),
}
