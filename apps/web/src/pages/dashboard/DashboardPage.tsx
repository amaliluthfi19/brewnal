import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bean, Coffee, Plus, Star, User } from 'lucide-react'
import { beansService } from '../../services/beans.service'
import { brewsService } from '../../services/brews.service'
import { useAuthStore } from '../../store/auth.store'
import { beanPhotoSrc } from '../../lib/bean-photo'
import coffeeIllustration from '../../assets/illustrations/coffee-tea.svg'

export function DashboardPage() {
  const { t, i18n } = useTranslation(['dashboard', 'brew', 'beans', 'common'])
  const user = useAuthStore((s) => s.user)
  const displayName = user?.displayName ?? user?.username ?? ''
  const initial = displayName.trim().charAt(0).toUpperCase()

  const { data: beansRes } = useQuery({ queryKey: ['beans'], queryFn: beansService.getAll })
  const { data: brewsRes } = useQuery({ queryKey: ['brews'], queryFn: () => brewsService.getAll() })

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
    .slice(0, 4)

  const recentBrews = [...brews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const beanMap = Object.fromEntries(beans.map((b) => [b.id, b]))
  const dateFmt = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' })

  return (
    <div className="mx-auto max-w-md space-y-8">
      {/* Greeting + overview */}
      <section>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div
              aria-hidden
              className="h-12 w-12 shrink-0 rounded-full bg-primary text-white font-display text-xl font-black flex items-center justify-center"
            >
              {initial || <User size={20} />}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-black text-ink truncate">
                {t('dashboard:greeting', { name: displayName })}
              </h1>
              <p className="text-muted text-sm">{t('dashboard:subtitle')}</p>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <div className="text-sm font-bold text-ink">{t('brew:title')}</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="font-display text-4xl font-black text-primary leading-none">
                  {brews.length}
                </div>
                <div className="text-xs text-muted mt-1">{t('dashboard:totalBrews')}</div>
              </div>
              <div className="flex gap-5 text-right">
                <div>
                  <div className="font-mono text-lg font-bold text-ink">{beans.length}</div>
                  <div className="text-xs text-muted">{t('dashboard:totalBeans')}</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-ink flex items-center justify-end gap-1">
                    <Star size={16} aria-hidden className="text-pop fill-pop" />
                    {avgRating}
                  </div>
                  <div className="text-xs text-muted">{t('dashboard:avgRating')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-border divide-x divide-border">
            <Link
              to="/brews/new"
              className="py-3 text-center text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
            >
              {t('brew:add')}
            </Link>
            <Link
              to="/beans/new"
              className="py-3 text-center text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
            >
              {t('beans:add')}
            </Link>
          </div>
        </div>
      </section>

      {/* Recent brews */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-ink">{t('dashboard:recentBrews')}</h2>
          {recentBrews.length > 0 && (
            <Link to="/brews" className="text-sm font-medium text-primary hover:underline">
              {t('dashboard:seeAll')}
            </Link>
          )}
        </div>

        {recentBrews.length === 0 ? (
          <div className="flex flex-col items-center text-center px-6 py-8 bg-surface border border-border rounded-xl">
            <img src={coffeeIllustration} alt={t('dashboard:emptyIllustration')} className="w-40 max-w-full" />
            <p className="text-muted text-sm mt-4">{t('dashboard:noBrews')}</p>
            <Link
              to="/brews/new"
              className="mt-4 inline-flex items-center gap-1.5 bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus size={16} aria-hidden />
              {t('brew:add')}
            </Link>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
            {recentBrews.map((brew) => {
              const bean = beanMap[brew.beanId]
              return (
                <Link
                  key={brew.id}
                  to={`/brews/${brew.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-primary/5 transition-colors"
                >
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Coffee size={20} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-ink truncate">
                      {bean ? bean.beanName : '—'}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {bean ? `${bean.roastery} · ` : ''}
                      {t(`brew:wizard.drinks.${brew.drinkType}`, brew.drinkType)} ·{' '}
                      {dateFmt.format(new Date(brew.createdAt))}
                    </div>
                  </div>
                  {brew.rating != null && (
                    <span className="flex items-center gap-1 font-mono text-sm font-bold text-ink shrink-0">
                      <Star size={14} aria-hidden className="text-pop fill-pop" />
                      {brew.rating}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Favorite beans */}
      {favoriteBeans.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-black text-ink">{t('dashboard:favoriteBeans')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {favoriteBeans.map((bean) => {
              const photoSrc = beanPhotoSrc(bean.photoUrl)
              return (
                <Link
                  key={bean.id}
                  to={`/beans/${bean.id}`}
                  className="flex flex-col bg-surface border border-border rounded-xl p-4 hover:border-primary transition-colors"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-lg bg-secondary/15 text-secondary-ink flex items-center justify-center">
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={t('beans:photoAlt', { name: bean.beanName })}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Bean size={24} aria-hidden />
                    )}
                  </div>
                  <div className="mt-4 text-sm text-muted truncate">{bean.roastery}</div>
                  <div className="font-bold text-ink line-clamp-2">{bean.beanName}</div>
                  <div className="mt-auto pt-3 font-mono text-xs text-muted">
                    {t('dashboard:brewCount', { count: brewCountByBean[bean.id] })}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
