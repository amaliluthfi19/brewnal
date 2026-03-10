import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('brewnal_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Send language preference to BE
  const lang = localStorage.getItem('brewnal_lang') ?? 'id'
  config.headers['Accept-Language'] = lang

  return config
})

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('brewnal_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
