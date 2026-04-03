import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/auth.store'
import { LanguageToggle } from '../../components/ui/LanguageToggle'

export function LoginPage() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.login(email, password)
      setAuth(res.data.data.user, res.data.data.token)
      navigate('/')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.response?.data?.error ?? err.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-black text-ink mb-2">brewnal</h1>
          <p className="text-muted text-sm">{t('auth:loginTitle')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-2xl p-6 space-y-4"
        >
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">{t('auth:email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-ink placeholder:text-muted text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="kamu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">{t('auth:password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-ink placeholder:text-muted text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {loading ? t('common:loading') : t('auth:login')}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-4">
          {t('auth:noAccount')}{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            {t('auth:register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
