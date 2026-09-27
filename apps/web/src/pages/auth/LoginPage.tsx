import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CircleAlert } from 'lucide-react'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/auth.store'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { PasswordInput } from '../../components/ui/PasswordInput'
import loginIllustration from '../../assets/illustrations/coffee-tea.svg'

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-ink placeholder:text-muted text-sm focus:outline-none focus:border-primary transition-colors'

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
      setAuth(res.data.data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('auth:loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      illustration={loginIllustration}
      illustrationAlt={t('auth:illustration.login')}
      title={t('auth:loginTitle')}
      subtitle={t('auth:loginSubtitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2"
          >
            <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-ink">
            {t('auth:email')}
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
            placeholder={t('auth:emailPlaceholder')}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-sm font-medium text-ink">
            {t('auth:password')}
          </label>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {loading ? t('common:loading') : t('auth:login')}
          {!loading && <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </form>

      <p className="text-center lg:text-left text-sm text-muted mt-6">
        {t('auth:noAccount')}{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          {t('auth:register')}
        </Link>
      </p>
    </AuthLayout>
  )
}
