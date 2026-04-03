import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/auth.store'
import { LanguageToggle } from '../ui/LanguageToggle'

export function Navbar() {
  const { t } = useTranslation(['common', 'beans', 'brew'])
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-ink hover:text-primary'}`

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="font-display text-xl font-black text-ink shrink-0">
          brewnal
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <NavLink to="/" end className={desktopLink}>{t('common:dashboard')}</NavLink>
          <NavLink to="/beans" className={desktopLink}>{t('beans:title')}</NavLink>
          <NavLink to="/brews" className={desktopLink}>{t('brew:title')}</NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />
          {user && (
            <button
              onClick={handleLogout}
              className="hidden sm:block text-sm font-medium text-muted hover:text-danger transition-colors"
            >
              {t('common:logout')}
            </button>
          )}
        </div>
      </div>

      {/* Mobile bottom nav strip */}
      <nav className="sm:hidden flex border-t border-border">
        {[
          { to: '/', label: t('common:dashboard'), end: true },
          { to: '/beans', label: t('beans:title') },
          { to: '/brews', label: t('brew:title') },
        ].map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 py-2.5 text-center text-xs font-medium transition-colors ${
                isActive ? 'text-primary border-t-2 border-primary -mt-px' : 'text-muted'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
