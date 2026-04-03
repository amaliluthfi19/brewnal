import { useTranslation } from 'react-i18next'
import type { SensoryLevel } from '@brewnal/types'

interface SensoryInputProps {
  label: string
  value: SensoryLevel | undefined
  onChange: (value: SensoryLevel | undefined) => void
}

export function SensoryInput({ label, value, onChange }: SensoryInputProps) {
  const { t } = useTranslation('sensory')
  const levels: SensoryLevel[] = [1, 2, 3]

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted w-20 shrink-0">{label}</span>
      <div className="flex gap-1">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(value === level ? undefined : level)}
            className={`px-3 py-1 rounded-full text-xs font-mono font-medium border transition-all ${
              value === level
                ? 'bg-primary text-white border-primary'
                : 'bg-surface border-border text-muted hover:border-primary'
            }`}
          >
            {t(`level${level}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
