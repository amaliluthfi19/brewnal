import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/auth.store'
import { LanguageToggle } from '../../components/ui/LanguageToggle'
import { BrewerIdentity } from '@brewnal/types'

const IDENTITIES = [
  { value: BrewerIdentity.BEGINNER, emoji: '\u2615', key: 'beginner' },
  { value: BrewerIdentity.HOME_BREWER, emoji: '\uD83C\uDFE0', key: 'home_brewer' },
  { value: BrewerIdentity.BARISTA_CAFE, emoji: '\uD83D\uDC68\u200D\uD83C\uDF73', key: 'barista_cafe' },
  { value: BrewerIdentity.BARISTA_COMPETITION, emoji: '\uD83C\uDFC6', key: 'barista_competition' },
] as const

export function RegisterPage() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    displayName: '',
  })
  const [selectedIdentity, setSelectedIdentity] = useState<BrewerIdentity | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStep(2)
  }

  const handleRegister = async (brewerIdentity: BrewerIdentity | null) => {
    setError('')
    setLoading(true)
    try {
      const res = await authService.register({
        email: form.email,
        username: form.username,
        password: form.password,
        displayName: form.displayName || undefined,
        brewerIdentity,
      })
      setAuth(res.data.data.user, res.data.data.token)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Registration failed')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const handleStep2Submit = () => handleRegister(selectedIdentity)
  const handleSkip = () => handleRegister(null)

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
          <p className="text-muted text-sm">
            {step === 1 ? t('auth:registerTitle') : t('auth:onboarding.subtitle')}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
        </div>

        {step === 1 && (
          <>
            <form
              onSubmit={handleStep1}
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
                <input type="password" {...field('password')} required minLength={6} className={inputClass} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-ink">
                  {t('auth:displayName')}{' '}
                  <span className="text-muted font-normal">(opsional)</span>
                </label>
                <input type="text" {...field('displayName')} className={inputClass} placeholder="Nama kamu" />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors"
              >
                {t('common:next', 'Lanjut')} →
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-4">
              {t('auth:hasAccount')}{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                {t('auth:login')}
              </Link>
            </p>
          </>
        )}

        {step === 2 && (
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-display font-bold text-ink text-center mb-1">
              {t('auth:onboarding.title')}
            </h2>
            <p className="text-xs text-muted text-center mb-5">
              {t('auth:onboarding.changeable')}
            </p>

            {error && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            {/* Identity cards — 2x2 grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {IDENTITIES.map((id) => {
                const isSelected = selectedIdentity === id.value
                return (
                  <button
                    key={id.value}
                    type="button"
                    onClick={() => setSelectedIdentity(isSelected ? null : id.value)}
                    className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-bg hover:border-muted'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <span className="text-2xl mb-2">{id.emoji}</span>
                    <span className="text-sm font-semibold text-ink leading-tight">
                      {t(`auth:onboarding.identities.${id.key}`)}
                    </span>
                    <span className="text-xs text-muted mt-1 leading-snug">
                      {t(`auth:onboarding.identities.${id.key}_sub`)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="text-sm text-muted hover:text-ink transition-colors disabled:opacity-50"
              >
                {t('auth:onboarding.skip')}
              </button>
              <button
                type="button"
                onClick={handleStep2Submit}
                disabled={loading || !selectedIdentity}
                className="flex-1 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                {loading ? t('common:loading') : t('auth:onboarding.cta')} →
              </button>
            </div>

            {/* Back to step 1 */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-sm text-muted mt-4 hover:text-ink transition-colors"
            >
              ← {t('common:back')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
