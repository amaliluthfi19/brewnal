import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { authService } from '../../services/auth.service'
import { LanguageToggle } from '../ui/LanguageToggle'
import { Logo } from '../ui/Logo'

export function Navbar() {
  const { t } = useTranslation('common')
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-bg/40 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />
          {user && (
            <button
              onClick={handleLogout}
              aria-label={t('logout')}
              title={t('logout')}
              className="p-2 rounded-lg text-muted hover:text-danger transition-colors"
            >
              <LogOut size={20} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
