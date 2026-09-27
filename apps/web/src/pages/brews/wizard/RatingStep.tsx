import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { StarRating } from '../../../components/ui/StarRating'
import { TastingNoteInput } from '../../../components/ui/TastingNoteInput'
import { SensoryInput } from '../../../components/ui/SensoryInput'
import { FormField, Section, inputClass, type StepProps } from './shared'

const MAX_NOTES = 15
const MAX_COMMENT = 1000

export function RatingStep({ form, setForm }: StepProps) {
  const { t } = useTranslation(['brew', 'sensory'])
  const hasSensory = !!(form.actualBodyness || form.actualSweetness || form.actualAcidity)
  const [showSensory, setShowSensory] = useState(hasSensory)

  return (
    <div className="space-y-4">
      <Section title={t('brew:wizard.ratingTitle')}>
        <div className="flex flex-col items-center gap-1 py-2">
          <span id="brew-rating-label" className="sr-only">
            {t('brew:rating')}
          </span>
          <StarRating
            labelledBy="brew-rating-label"
            value={form.rating}
            onChange={(rating) => setForm((p) => ({ ...p, rating }))}
          />
          <span className="text-xs text-muted font-mono h-4">
            {form.rating ? `${form.rating}/5` : t('brew:wizard.tapToRate')}
          </span>
        </div>
      </Section>

      <Section title={t('brew:tastingNotes')}>
        <TastingNoteInput
          value={form.tastingNotes ?? []}
          onChange={(notes) =>
            setForm((p) => ({
              ...p,
              tastingNotes: notes.slice(0, MAX_NOTES).map((n) => n.slice(0, 40)),
            }))
          }
          placeholder={t('brew:wizard.tastingPlaceholder')}
        />
      </Section>

      <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <button
          type="button"
          onClick={() => setShowSensory((s) => !s)}
          aria-expanded={showSensory}
          className="flex w-full items-center justify-between text-sm font-bold text-ink"
        >
          {t('brew:actualProfile')}
          <ChevronDown size={16} aria-hidden className={`text-muted ${showSensory ? 'rotate-180' : ''}`} />
        </button>
        {showSensory && (
          <>
            <SensoryInput
              label={t('sensory:bodyness')}
              value={form.actualBodyness}
              onChange={(v) => setForm((p) => ({ ...p, actualBodyness: v }))}
            />
            <SensoryInput
              label={t('sensory:sweetness')}
              value={form.actualSweetness}
              onChange={(v) => setForm((p) => ({ ...p, actualSweetness: v }))}
            />
            <SensoryInput
              label={t('sensory:acidity')}
              value={form.actualAcidity}
              onChange={(v) => setForm((p) => ({ ...p, actualAcidity: v }))}
            />
          </>
        )}
      </section>

      <Section title={t('brew:wizard.comment')}>
        <FormField label={t('brew:wizard.commentLabel')} htmlFor="brew-notes">
          <textarea
            id="brew-notes"
            value={form.notes ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value || undefined }))}
            rows={4}
            maxLength={MAX_COMMENT}
            placeholder={t('brew:wizard.commentPlaceholder')}
            className={inputClass}
          />
        </FormField>
      </Section>
    </div>
  )
}
