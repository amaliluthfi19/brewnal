import { useRef } from 'react'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { StarRating as Rating } from '@brewnal/types'

interface StarRatingProps {
  value: Rating | undefined
  onChange: (value: Rating | undefined) => void
  labelledBy?: string
}

const STARS: Rating[] = [1, 2, 3, 4, 5]

// Radiogroup: arrow keys move the rating, tapping the current star clears it
export function StarRating({ value, onChange, labelledBy }: StarRatingProps) {
  const { t } = useTranslation('brew')
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (star: Rating) => {
    onChange(star)
    refs.current[star - 1]?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent, star: Rating) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      select(Math.min(5, star + 1) as Rating)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      select(Math.max(1, star - 1) as Rating)
    }
  }

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex gap-1">
      {STARS.map((star) => {
        const filled = !!value && star <= value
        // Only one star is in the tab order: the selected one, or the first
        const tabbable = value ? star === value : star === 1
        return (
          <button
            key={star}
            ref={(el) => (refs.current[star - 1] = el)}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={t('wizard.starLabel', { count: star })}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => onChange(value === star ? undefined : star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            className={`p-1 rounded-lg transition-colors focus:outline-none focus-visible:bg-primary/10 ${
              filled ? 'text-pop' : 'text-border hover:text-pop'
            }`}
          >
            <Star size={32} className={filled ? 'fill-current' : ''} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
