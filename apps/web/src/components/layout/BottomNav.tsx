import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bean, BookOpen, Camera, House, Plus, type LucideIcon } from 'lucide-react'

type Tab = { to: string; label: string; icon: LucideIcon; end?: boolean }

function TabLink({ to, label, icon: Icon, end }: Tab) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center gap-1 h-16 text-xs transition-colors ${
          isActive ? 'text-primary font-bold' : 'text-muted hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span aria-hidden className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-primary" />
          )}
          <Icon size={20} aria-hidden />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const { t } = useTranslation('common')

  const left: Tab[] = [
    { to: '/', label: t('nav.home'), icon: House, end: true },
    { to: '/beans', label: t('nav.beans'), icon: Bean },
  ]
  const right: Tab[] = [
    { to: '/brews', label: t('nav.journal'), icon: BookOpen },
    { to: '/beans/new', label: t('nav.scan'), icon: Camera, end: true },
  ]

  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-md grid grid-cols-5">
        {left.map((tab) => <TabLink key={tab.to} {...tab} />)}

        <div className="relative h-16">
          <Link
            to="/brews/new"
            aria-label={t('nav.addBrew')}
            title={t('nav.addBrew')}
            className="absolute left-1/2 -top-7 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full
                       bg-primary text-white border-4 border-bg hover:bg-primary-hover transition-colors"
          >
            <Plus size={24} aria-hidden />
          </Link>
        </div>

        {right.map((tab) => <TabLink key={tab.to} {...tab} />)}
      </div>
    </nav>
  )
}
