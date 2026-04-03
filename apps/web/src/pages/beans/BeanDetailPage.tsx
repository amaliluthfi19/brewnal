import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { beansService } from '../../services/beans.service'
import { brewsService } from '../../services/brews.service'

export function BeanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation(['beans', 'brew', 'common', 'sensory'])
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: beanRes, isLoading } = useQuery({
    queryKey: ['beans', id],
    queryFn: () => beansService.getById(id!),
  })

  const { data: brewsRes } = useQuery({
    queryKey: ['brews', { beanId: id }],
    queryFn: () => brewsService.getAll(id),
  })

  const deleteMutation = useMutation({
    mutationFn: () => beansService.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beans'] })
      navigate('/beans')
    },
  })

  if (isLoading) return <p className="text-muted text-center py-12">{t('common:loading')}</p>

  const bean = beanRes?.data.data
  if (!bean) return <p className="text-danger text-center py-12">{t('beans:emptyState')}</p>

  const brews = brewsRes?.data.data ?? []

  const details = [
    { label: t('beans:originCountry'), value: bean.originCountry },
    { label: t('beans:originRegion'), value: bean.originRegion },
    { label: t('beans:altitude'), value: bean.altitude ? `${bean.altitude} mdpl` : undefined },
    { label: t('beans:varietal'), value: bean.varietal },
    { label: t('beans:process'), value: bean.process },
    { label: t('beans:roastLevel'), value: bean.roastLevel },
    { label: t('beans:roastDate'), value: bean.roastDate },
  ].filter(({ value }) => value)

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted font-mono">{bean.roastery}</p>
          <h1 className="font-display text-2xl font-black text-ink">{bean.beanName}</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            to={`/beans/${id}/edit`}
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

      {/* Details grid */}
      {details.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4 grid grid-cols-2 gap-3">
          {details.map(({ label, value }) => (
            <div key={label}>
              <div className="text-xs text-muted">{label}</div>
              <div className="text-sm font-medium text-ink">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {bean.notes && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-sm text-muted">{bean.notes}</p>
        </div>
      )}

      {/* Expected sensory */}
      {(bean.expectedBodyness || bean.expectedSweetness || bean.expectedAcidity) && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-sm font-bold text-ink mb-3">{t('beans:expectedProfile')}</h2>
          <div className="flex gap-6">
            {[
              { label: t('sensory:bodyness'), value: bean.expectedBodyness },
              { label: t('sensory:sweetness'), value: bean.expectedSweetness },
              { label: t('sensory:acidity'), value: bean.expectedAcidity },
            ]
              .filter(({ value }) => value)
              .map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted">{label}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full ${i <= (value ?? 0) ? 'bg-primary' : 'bg-border'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Brews */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-ink">{t('brew:title')}</h2>
          <Link
            to={`/brews/new?beanId=${id}`}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
          >
            + {t('brew:add')}
          </Link>
        </div>

        {brews.length === 0 ? (
          <p className="text-muted text-sm text-center py-6">{t('brew:emptyState')}</p>
        ) : (
          <div className="space-y-2">
            {brews.map((brew) => (
              <Link
                key={brew.id}
                to={`/brews/${brew.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border hover:border-primary transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-ink">{brew.brewMethod}</div>
                  <div className="text-xs text-muted">
                    {[brew.doseGrams ? `${brew.doseGrams}g` : null, brew.waterMl ? `${brew.waterMl}ml` : null]
                      .filter(Boolean)
                      .join(' · ')}{' '}
                    · {new Date(brew.createdAt).toLocaleDateString()}
                  </div>
                  {brew.tastingNotes.length > 0 && (
                    <div className="flex gap-1.5 mt-1">
                      {brew.tastingNotes.slice(0, 3).map((n) => (
                        <span key={n} className="text-xs font-mono text-secondary">
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {brew.rating && (
                  <span className="text-pop font-mono font-bold shrink-0">★ {brew.rating}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
