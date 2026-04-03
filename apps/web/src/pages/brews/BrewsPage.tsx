import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { brewsService } from '../../services/brews.service'
import { beansService } from '../../services/beans.service'
import type { BrewJournal } from '@brewnal/types'

export function BrewsPage() {
  const { t } = useTranslation(['brew', 'common'])
  const qc = useQueryClient()

  const { data: brewsRes, isLoading } = useQuery({
    queryKey: ['brews'],
    queryFn: () => brewsService.getAll(),
  })

  const { data: beansRes } = useQuery({ queryKey: ['beans'], queryFn: beansService.getAll })

  const deleteMutation = useMutation({
    mutationFn: brewsService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brews'] }),
  })

  const brews = [...(brewsRes?.data.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const beanMap = Object.fromEntries((beansRes?.data.data ?? []).map((b) => [b.id, b]))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black text-ink">{t('brew:title')}</h1>
        <Link
          to="/brews/new"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          + {t('brew:add')}
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted text-center py-8">{t('common:loading')}</p>
      ) : brews.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border rounded-xl">
          <p className="text-muted">{t('brew:emptyState')}</p>
          <Link to="/brews/new" className="mt-3 inline-block text-primary font-medium hover:underline">
            {t('brew:add')}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {brews.map((brew) => {
            const bean = beanMap[brew.beanId]
            const beanLabel = bean ? `${bean.roastery} — ${bean.beanName}` : '—'
            return (
              <BrewRow
                key={brew.id}
                brew={brew}
                beanLabel={beanLabel}
                onDelete={() => deleteMutation.mutate(brew.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function BrewRow({
  brew,
  beanLabel,
  onDelete,
}: {
  brew: BrewJournal
  beanLabel: string
  onDelete: () => void
}) {
  const { t } = useTranslation('common')

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-start justify-between gap-3 hover:border-primary transition-colors">
      <Link to={`/brews/${brew.id}`} className="flex-1 min-w-0">
        <div className="text-xs text-muted font-mono truncate">{beanLabel}</div>
        <div className="font-medium text-ink">{brew.brewMethod}</div>
        <div className="text-xs text-muted mt-0.5">
          {[
            brew.doseGrams ? `${brew.doseGrams}g` : null,
            brew.waterMl ? `${brew.waterMl}ml` : null,
            brew.ratio,
            new Date(brew.createdAt).toLocaleDateString(),
          ]
            .filter(Boolean)
            .join(' · ')}
        </div>
        {brew.tastingNotes.length > 0 && (
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {brew.tastingNotes.slice(0, 4).map((n) => (
              <span
                key={n}
                className="text-xs font-mono text-secondary bg-secondary/10 px-1.5 py-0.5 rounded"
              >
                {n}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="flex flex-col items-end gap-2 shrink-0">
        {brew.rating && (
          <span className="text-pop font-mono font-bold text-sm">★ {brew.rating}</span>
        )}
        <div className="flex gap-3">
          <Link
            to={`/brews/${brew.id}/edit`}
            className="text-xs text-muted hover:text-ink transition-colors"
          >
            {t('edit')}
          </Link>
          <button
            onClick={onDelete}
            className="text-xs text-muted hover:text-danger transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
