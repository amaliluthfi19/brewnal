import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { brewsService } from '../../services/brews.service'
import { beansService } from '../../services/beans.service'

export function BrewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation(['brew', 'beans', 'common', 'sensory'])
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: brewRes, isLoading } = useQuery({
    queryKey: ['brews', id],
    queryFn: () => brewsService.getById(id!),
  })

  const brew = brewRes?.data.data

  const { data: beanRes } = useQuery({
    queryKey: ['beans', brew?.beanId],
    queryFn: () => beansService.getById(brew!.beanId),
    enabled: !!brew,
  })

  const deleteMutation = useMutation({
    mutationFn: () => brewsService.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brews'] })
      navigate('/brews')
    },
  })

  if (isLoading) return <p className="text-muted text-center py-12">{t('common:loading')}</p>
  if (!brew) return <p className="text-danger text-center py-12">{t('brew:emptyState')}</p>

  const bean = beanRes?.data.data

  const params = [
    { label: t('brew:grinder'), value: brew.grinder },
    { label: t('brew:grindSize'), value: brew.grindSize },
    { label: t('brew:dose'), value: brew.doseGrams ? `${brew.doseGrams}g` : undefined },
    { label: t('brew:water'), value: brew.waterMl ? `${brew.waterMl}ml` : undefined },
    { label: t('brew:ratio'), value: brew.ratio },
    { label: t('brew:temp'), value: brew.waterTempC ? `${brew.waterTempC}°C` : undefined },
    { label: t('brew:brewTime'), value: brew.brewTimeSec ? `${brew.brewTimeSec}s` : undefined },
    { label: t('brew:pourCount'), value: brew.pourCount?.toString() },
  ].filter(({ value }) => value)

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {bean && (
            <Link
              to={`/beans/${bean.id}`}
              className="text-xs text-muted font-mono hover:text-primary transition-colors"
            >
              {bean.roastery} — {bean.beanName}
            </Link>
          )}
          <h1 className="font-display text-2xl font-black text-ink">{brew.brewMethod}</h1>
          <p className="text-xs text-muted">{new Date(brew.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            to={`/brews/${id}/edit`}
            className="px-3 py-1.5 rounded-lg border border-border text-sm text-ink hover:border-primary transition-colors"
          >
            {t('common:edit')}
          </Link>
          <button
            onClick={() => deleteMutation.mutate()}
            className="px-3 py-1.5 rounded-lg border border-danger/30 text-sm text-danger hover:bg-danger/10 transition-colors"
          >
            {t('common:delete')}
          </button>
        </div>
      </div>

      {/* Brew params */}
      {params.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4 grid grid-cols-2 gap-3">
          {params.map(({ label, value }) => (
            <div key={label}>
              <div className="text-xs text-muted">{label}</div>
              <div className="text-sm font-medium font-mono text-ink">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pour details */}
      {brew.pourDetails && brew.pourDetails.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-sm font-bold text-ink mb-2">Pour Details</h2>
          <div className="space-y-1">
            {brew.pourDetails.map((p, i) => (
              <div key={i} className="flex justify-between text-xs font-mono text-muted">
                <span>Pour {i + 1}</span>
                <span>{p.time_sec}s</span>
                <span>{p.amount_ml}ml</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating + tasting */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        {brew.rating && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">{t('brew:rating')}</span>
            <span className="text-pop font-mono font-bold text-xl">★ {brew.rating}/10</span>
          </div>
        )}

        {brew.tastingNotes.length > 0 && (
          <div>
            <p className="text-xs text-muted mb-2">{t('brew:tastingNotes')}</p>
            <div className="flex flex-wrap gap-1.5">
              {brew.tastingNotes.map((n) => (
                <span
                  key={n}
                  className="px-2.5 py-1 rounded-full bg-secondary/20 text-ink text-xs font-mono"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {brew.notes && <p className="text-sm text-muted">{brew.notes}</p>}
      </div>

      {/* Actual sensory */}
      {(brew.actualBodyness || brew.actualSweetness || brew.actualAcidity) && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-sm font-bold text-ink mb-3">{t('brew:actualProfile')}</h2>
          <div className="flex gap-6">
            {[
              { label: t('sensory:bodyness'), value: brew.actualBodyness },
              { label: t('sensory:sweetness'), value: brew.actualSweetness },
              { label: t('sensory:acidity'), value: brew.actualAcidity },
            ]
              .filter(({ value }) => value)
              .map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted">{label}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full ${
                          i <= (value ?? 0) ? 'bg-secondary' : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
