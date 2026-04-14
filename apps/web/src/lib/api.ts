import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send httpOnly cookie on every request
})

// Send language preference to BE
api.interceptors.request.use((config) => {
  const lang = localStorage.getItem('brewnal_lang') ?? 'id'
  config.headers['Accept-Language'] = lang
  return config
})

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      import('../store/auth.store').then(({ useAuthStore }) => {
        useAuthStore.getState().logout()
      })
      const { pathname } = window.location
      if (pathname !== '/login' && pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)
