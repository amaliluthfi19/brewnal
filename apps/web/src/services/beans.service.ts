import { api } from '../lib/api'
import type { Bean, CreateBeanDto, ScanResult } from '@brewnal/types'

export const beansService = {
  getAll: () => api.get<{ data: Bean[] }>('/beans'),

  getById: (id: string) => api.get<{ data: Bean }>(`/beans/${id}`),

  create: (data: CreateBeanDto) => api.post<{ data: Bean }>('/beans', data),

  update: (id: string, data: Partial<CreateBeanDto>) => api.put(`/beans/${id}`, data),

  delete: (id: string) => api.delete(`/beans/${id}`),

  scanLabel: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ data: ScanResult }>('/ai/scan-label', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
