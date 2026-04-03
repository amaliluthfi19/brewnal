import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/auth.store'
import { LanguageToggle } from '../../components/ui/LanguageToggle'
import { BrewerLevel } from '@brewnal/types'

export function RegisterPage() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ email: '', username: '', password: '', displayName: '', brewerLevel: BrewerLevel.BEGINNER })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.register({
        email: form.email,
        username: form.username,
        password: form.password,
        displayName: form.displayName || undefined,
        brewerLevel: form.brewerLevel
      })
      setAuth(res.data.data.user, res.data.data.token)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  })

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-border bg-bg text-ink placeholder:text-muted text-sm focus:outline-none focus:border-primary transition-colors'

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-black text-ink mb-2">brewnal</h1>
          <p className="text-muted text-sm">{t('auth:registerTitle')}</p>
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
            <input type="email" {...field('email')} required className={inputClass} placeholder="kamu@email.com" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">{t('auth:username')}</label>
            <input type="text" {...field('username')} required className={inputClass} placeholder="username" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">{t('auth:password')}</label>
            <input type="password" {...field('password')} required className={inputClass} placeholder="••••••••" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">
              {t('auth:displayName')}{' '}
              <span className="text-muted font-normal">(opsional)</span>
            </label>
            <input type="text" {...field('displayName')} className={inputClass} placeholder="Nama kamu" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">{t('auth:brewerLevel')}</label>
            <input type="text" {...field('brewerLevel')} required className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {loading ? t('common:loading') : t('auth:register')}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-4">
          {t('auth:hasAccount')}{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t('auth:login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
