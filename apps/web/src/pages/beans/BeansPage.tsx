import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Bean } from 'lucide-react'
import { beansService } from '../../services/beans.service'
import { BeanCard } from '../../components/beans/BeanCard'

export function BeansPage() {
  const { t } = useTranslation(['beans', 'common'])
  const qc = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['beans'], queryFn: beansService.getAll })

  const deleteMutation = useMutation({
    mutationFn: beansService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['beans'] }),
  })

  const beans = (data?.data.data ?? []).filter(
    (b) =>
      !search ||
      b.roastery.toLowerCase().includes(search.toLowerCase()) ||
      b.beanName.toLowerCase().includes(search.toLowerCase()) ||
      (b.originCountry ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black text-ink">{t('beans:title')}</h1>
        <Link
          to="/beans/new"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          + {t('beans:add')}
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('common:search')}
        className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-ink placeholder:text-muted text-sm focus:outline-none focus:border-primary transition-colors"
      />

      {isLoading ? (
        <p className="text-muted text-center py-8">{t('common:loading')}</p>
      ) : beans.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border rounded-xl">
          <Bean size={32} className="mx-auto mb-3 text-muted" aria-hidden />
          <p className="text-muted">{t('beans:emptyState')}</p>
          <Link to="/beans/new" className="mt-3 inline-block text-primary font-medium hover:underline">
            {t('beans:add')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {beans.map((bean) => (
            <BeanCard
              key={bean.id}
              bean={bean}
              actions={
                <>
                  <Link
                    to={`/beans/${bean.id}`}
                    className="flex-1 text-center text-xs font-medium text-ink hover:text-primary transition-colors"
                  >
                    Detail
                  </Link>
                  <Link
                    to={`/brews/new?beanId=${bean.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Brew
                    <ArrowRight size={12} aria-hidden />
                  </Link>
                  <button
                    onClick={() => deleteMutation.mutate(bean.id)}
                    className="flex-1 text-center text-xs font-medium text-muted hover:text-danger transition-colors"
                  >
                    {t('common:delete')}
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
