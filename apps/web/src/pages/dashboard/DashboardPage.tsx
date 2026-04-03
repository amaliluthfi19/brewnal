import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { beansService } from '../../services/beans.service'
import { brewsService } from '../../services/brews.service'
import { useAuthStore } from '../../store/auth.store'

export function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'brew', 'common'])
  const user = useAuthStore((s) => s.user)

  const { data: beansRes } = useQuery({ queryKey: ['beans'], queryFn: beansService.getAll })
  const { data: brewsRes } = useQuery({ queryKey: ['brews'], queryFn: brewsService.getAll })

  const beans = beansRes?.data.data ?? []
  const brews = brewsRes?.data.data ?? []

  const ratedBrews = brews.filter((b) => b.rating)
  const avgRating =
    ratedBrews.length > 0
      ? (ratedBrews.reduce((sum, b) => sum + (b.rating ?? 0), 0) / ratedBrews.length).toFixed(1)
      : '—'

  const brewCountByBean = brews.reduce<Record<string, number>>((acc, b) => {
    acc[b.beanId] = (acc[b.beanId] ?? 0) + 1
    return acc
  }, {})

  const favoriteBeans = beans
    .filter((b) => brewCountByBean[b.id])
    .sort((a, b) => (brewCountByBean[b.id] ?? 0) - (brewCountByBean[a.id] ?? 0))
    .slice(0, 3)

  const recentBrews = [...brews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const beanMap = Object.fromEntries(beans.map((b) => [b.id, b]))

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl font-black text-ink">
          {user?.displayName ?? user?.username} ☕
        </h1>
        <p className="text-muted text-sm mt-0.5">{t('dashboard:title')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('dashboard:totalBeans'), value: beans.length },
          { label: t('dashboard:totalBrews'), value: brews.length },
          { label: t('dashboard:avgRating'), value: avgRating },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="font-display text-3xl font-black text-primary">{value}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent brews */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-sans font-bold text-ink">{t('dashboard:recentBrews')}</h2>
          <Link to="/brews/new" className="text-sm text-primary hover:underline">
            + {t('brew:add')}
          </Link>
        </div>

        {recentBrews.length === 0 ? (
          <div className="text-center py-10 bg-surface border border-border rounded-xl">
            <p className="text-muted text-sm">{t('brew:emptyState')}</p>
            <Link to="/brews/new" className="mt-2 inline-block text-sm text-primary hover:underline">
              {t('brew:add')}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentBrews.map((brew) => {
              const bean = beanMap[brew.beanId]
              return (
                <Link
                  key={brew.id}
                  to={`/brews/${brew.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border hover:border-primary transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink truncate">
                      {bean ? `${bean.roastery} — ${bean.beanName}` : '—'}
                    </div>
                    <div className="text-xs text-muted">
                      {brew.brewMethod} · {new Date(brew.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {brew.rating && (
                    <span className="text-pop font-mono text-sm font-bold shrink-0 ml-3">
                      ★ {brew.rating}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Favorite beans */}
      {favoriteBeans.length > 0 && (
        <div>
          <h2 className="font-sans font-bold text-ink mb-3">{t('dashboard:favoriteBeans')}</h2>
          <div className="flex gap-2 flex-wrap">
            {favoriteBeans.map((bean) => (
              <Link
                key={bean.id}
                to={`/beans/${bean.id}`}
                className="px-3 py-1.5 rounded-full bg-secondary/20 text-ink text-sm font-medium hover:bg-secondary/30 transition-colors"
              >
                {bean.roastery} · {bean.beanName}
                <span className="ml-1.5 text-xs text-muted">×{brewCountByBean[bean.id]}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
