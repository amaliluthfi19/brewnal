import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../ui/LanguageToggle'

interface AuthLayoutProps {
  illustration: string
  illustrationAlt: string
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthLayout({ illustration, illustrationAlt, title, subtitle, children }: AuthLayoutProps) {
  const { t } = useTranslation('auth')

  return (
    <div className="min-h-screen bg-app-gradient lg:grid lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <aside className="hidden lg:flex flex-col justify-between p-12">
        <span className="font-display text-3xl font-black text-primary">brewnal</span>

        <div className="flex flex-col items-center text-center">
          <img src={illustration} alt={illustrationAlt} className="w-auto max-w-sm max-h-80 h-auto object-contain mb-10" />
          <h2 className="font-display text-3xl font-black text-ink leading-tight max-w-md">
            {t('hero.title')}
          </h2>
          <p className="text-muted mt-3 max-w-sm">{t('hero.subtitle')}</p>
        </div>

        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Brewnal ·{' '}
          <a
            href="https://www.streamlinehq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {t('illustrationCredit')}
          </a>
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col items-center justify-center p-4 py-16 sm:p-8">
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <img
              src={illustration}
              alt=""
              aria-hidden="true"
              className="mx-auto w-auto max-w-48 max-h-36 sm:max-h-44 h-auto object-contain mb-4"
            />
            <span className="block font-display text-4xl font-black text-primary">brewnal</span>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
            <div className="text-center lg:text-left mb-6">
              <h1 className="font-display text-2xl font-black text-ink">{title}</h1>
              {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
