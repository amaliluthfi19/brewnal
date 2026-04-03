import { api } from '../lib/api'
import type { BrewJournal, CreateBrewDto } from '@brewnal/types'

export const brewsService = {
  getAll: (beanId?: string) =>
    api.get<{ data: BrewJournal[] }>('/brews', { params: beanId ? { beanId } : undefined }),

  getById: (id: string) => api.get<{ data: BrewJournal }>(`/brews/${id}`),

  create: (data: CreateBrewDto) => api.post<{ data: BrewJournal }>('/brews', data),

  update: (id: string, data: Partial<CreateBrewDto>) => api.put(`/brews/${id}`, data),

  delete: (id: string) => api.delete(`/brews/${id}`),
}
