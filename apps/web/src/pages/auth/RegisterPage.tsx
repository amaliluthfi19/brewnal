import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Bean, Check, CircleAlert, CircleCheck, Coffee, House, Trophy } from 'lucide-react'
import { authService } from '../../services/auth.service'
import { profileService } from '../../services/profile.service'
import { useAuthStore } from '../../store/auth.store'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { BrewerIdentity } from '@brewnal/types'
import welcomeIllustration from '../../assets/illustrations/team-work.svg'

const IDENTITIES = [
  { value: BrewerIdentity.BEGINNER, Icon: Bean, key: 'beginner' },
  { value: BrewerIdentity.HOME_BREWER, Icon: House, key: 'home_brewer' },
  { value: BrewerIdentity.BARISTA_CAFE, Icon: Coffee, key: 'barista_cafe' },
  { value: BrewerIdentity.BARISTA_COMPETITION, Icon: Trophy, key: 'barista_competition' },
] as const

const PASSWORD_MIN = 8
// bcrypt only uses the first 72 bytes
const PASSWORD_MAX = 72

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-ink placeholder:text-muted text-sm focus:outline-none focus:border-primary transition-colors'

export function RegisterPage() {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    displayName: '',
    birthdate: '',
  })
  const [selectedIdentity, setSelectedIdentity] = useState<BrewerIdentity | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1: create the account. The user is signed in (httpOnly cookie) on success.
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.register({
        email: form.email,
        username: form.username,
        password: form.password,
        displayName: form.displayName || undefined,
        birthdate: form.birthdate,
      })
      setAuth(res.data.data.user)
      // Drop the password from memory once it's no longer needed
      setForm((prev) => ({ ...prev, password: '' }))
      setStep(2)
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('auth:registerFailed'))
    } finally {
      setLoading(false)
    }
  }

  // Step 2: pick a brewer level for the already-created account.
  const handleSaveIdentity = async () => {
    if (!user || !selectedIdentity) return
    setError('')
    setLoading(true)
    try {
      const res = await profileService.updateIdentity(selectedIdentity)
      setAuth({ ...user, brewerIdentity: res.data.data.brewerIdentity, onboardingCompleted: true })
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('auth:onboarding.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => navigate('/', { replace: true })

  // Local calendar date, so the max matches what the date picker shows
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <AuthLayout
      illustration={welcomeIllustration}
      illustrationAlt={t('auth:illustration.register')}
      title={step === 1 ? t('auth:registerTitle') : t('auth:onboarding.title')}
      subtitle={step === 1 ? t('auth:registerSubtitle') : t('auth:onboarding.subtitle')}
    >
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
        </div>
        <span className="text-xs font-mono text-muted">{t('auth:step', { step, total: 2 })}</span>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 mb-4"
        >
          <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {step === 1 && (
        <>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-sm font-medium text-ink">
                {t('auth:email')}
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                {...field('email')}
                required
                className={inputClass}
                placeholder={t('auth:emailPlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-username" className="text-sm font-medium text-ink">
                {t('auth:username')}
              </label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                {...field('username')}
                required
                className={inputClass}
                placeholder={t('auth:usernamePlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-sm font-medium text-ink">
                {t('auth:password')}
              </label>
              <PasswordInput
                id="reg-password"
                autoComplete="new-password"
                aria-describedby="reg-password-hint"
                {...field('password')}
                required
                minLength={PASSWORD_MIN}
                maxLength={PASSWORD_MAX}
                className={inputClass}
                placeholder="••••••••"
              />
              <p id="reg-password-hint" className="text-xs text-muted">
                {t('auth:passwordHint', { min: PASSWORD_MIN })}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-display-name" className="text-sm font-medium text-ink">
                {t('auth:displayName')}{' '}
                <span className="text-muted font-normal">({t('auth:optional')})</span>
              </label>
              <input
                id="reg-display-name"
                type="text"
                autoComplete="nickname"
                {...field('displayName')}
                className={inputClass}
                placeholder={t('auth:displayNamePlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-birthdate" className="text-sm font-medium text-ink">
                {t('auth:birthdate')}
              </label>
              <input
                id="reg-birthdate"
                type="date"
                autoComplete="bday"
                {...field('birthdate')}
                required
                min="1900-01-01"
                max={today}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {loading ? t('common:loading') : t('auth:register')}
              {!loading && <ArrowRight size={16} aria-hidden="true" />}
            </button>
          </form>

          <p className="text-center lg:text-left text-sm text-muted mt-6">
            {t('auth:hasAccount')}{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              {t('auth:login')}
            </Link>
          </p>
        </>
      )}

      {step === 2 && (
        <div>
          <p
            role="status"
            className="flex items-start gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 mb-4"
          >
            <CircleCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            {t('auth:onboarding.accountCreated')}
          </p>
          <p className="text-xs text-muted mb-4">{t('auth:onboarding.changeable')}</p>

          {/* Identity cards — 2x2 grid */}
          <div role="radiogroup" aria-label={t('auth:onboarding.title')} className="grid grid-cols-2 gap-3 mb-6">
            {IDENTITIES.map(({ value, Icon, key }) => {
              const isSelected = selectedIdentity === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedIdentity(isSelected ? null : value)}
                  className={`relative flex flex-col items-start text-left p-4 rounded-xl border transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-surface hover:border-primary'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                      <Check size={12} strokeWidth={3} aria-hidden="true" />
                    </span>
                  )}
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                      isSelected ? 'bg-primary text-white' : 'bg-secondary/15 text-secondary-ink'
                    }`}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-ink leading-tight">
                    {t(`auth:onboarding.identities.${key}`)}
                  </span>
                  <span className="text-xs text-muted mt-1 leading-snug">
                    {t(`auth:onboarding.identities.${key}_sub`)}
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
              className="px-4 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-ink transition-colors disabled:opacity-50"
            >
              {t('auth:onboarding.skip')}
            </button>
            <button
              type="button"
              onClick={handleSaveIdentity}
              disabled={loading || !selectedIdentity}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {loading ? t('common:loading') : t('auth:onboarding.cta')}
              {!loading && <ArrowRight size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
