import { Bean as BeanIcon, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Bean } from '@brewnal/types'
import { beanPhotoSrc } from '../../lib/bean-photo'

interface BeanCardProps {
  bean: Bean
  selected?: boolean
  // When set, the whole card is a toggle button (wizard step 1)
  onSelect?: () => void
  // Footer actions (Detail / Brew / Delete on the beans page)
  actions?: React.ReactNode
}

export function BeanCard({ bean, selected, onSelect, actions }: BeanCardProps) {
  const { t } = useTranslation('beans')
  const photoSrc = beanPhotoSrc(bean.photoUrl)

  const body = (
    <>
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary/15 text-secondary-ink flex items-center justify-center">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={t('photoAlt', { name: bean.beanName })}
              className="h-full w-full object-cover"
            />
          ) : (
            <BeanIcon size={24} aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted font-mono truncate">{bean.roastery}</div>
          <div className="font-bold text-ink line-clamp-2">{bean.beanName}</div>
        </div>
        {onSelect && (
          <div
            aria-hidden
            className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
              selected ? 'bg-primary border-primary text-white' : 'border-border'
            }`}
          >
            {selected && <Check size={12} />}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {bean.originCountry && (
          <span className="px-2 py-0.5 rounded-full bg-bg border border-border text-muted text-xs">
            {bean.originCountry}
            {bean.originRegion ? ` · ${bean.originRegion}` : ''}
          </span>
        )}
        {bean.process && (
          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-ink text-xs">
            {bean.process}
          </span>
        )}
        {bean.roastLevel && (
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {bean.roastLevel}
          </span>
        )}
      </div>

      {bean.notes && <p className="text-xs text-muted line-clamp-2">{bean.notes}</p>}
    </>
  )

  const frame = `bg-surface border rounded-xl p-4 flex flex-col gap-2 text-left transition-colors ${
    selected ? 'border-primary' : 'border-border hover:border-primary'
  }`

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} aria-pressed={!!selected} className={`${frame} w-full`}>
        {body}
      </button>
    )
  }

  return (
    <div className={frame}>
      {body}
      {actions && (
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">{actions}</div>
      )}
    </div>
  )
}
