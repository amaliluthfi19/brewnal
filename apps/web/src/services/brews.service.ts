import { api } from '../lib/api'
import type { BrewJournal, BrewSuggestions, CreateBrewDto } from '@brewnal/types'

export const brewsService = {
  getAll: (beanId?: string) =>
    api.get<{ data: BrewJournal[] }>('/brews', { params: beanId ? { beanId } : undefined }),

  getById: (id: string) => api.get<{ data: BrewJournal }>(`/brews/${id}`),

  getSuggestions: () => api.get<{ data: BrewSuggestions }>('/brews/suggestions'),

  create: (data: CreateBrewDto) => api.post<{ data: BrewJournal }>('/brews', data),

  update: (id: string, data: CreateBrewDto) => api.put(`/brews/${id}`, data),

  delete: (id: string) => api.delete(`/brews/${id}`),
}
