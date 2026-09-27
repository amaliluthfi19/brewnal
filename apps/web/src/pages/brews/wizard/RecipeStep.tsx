import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { isEspressoBased } from '@brewnal/types'
import { computeRatio } from '../../../lib/brew-presets'
import { FormField, Section, inputClass, toNumber, type BrewForm, type StepProps } from './shared'

type NumericKey = 'doseGrams' | 'waterMl' | 'yieldGrams' | 'waterTempC' | 'brewTimeSec' | 'pourCount'

const MAX_POURS = 20

// "3:30" → 210, "210" → 210, anything else → undefined
function parseDuration(raw: string): number | undefined {
  const s = raw.trim()
  if (!s) return undefined
  const mmss = /^(\d{1,3}):([0-5]?\d)$/.exec(s)
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2])
  return /^\d{1,4}$/.test(s) ? Number(s) : undefined
}

const formatDuration = (sec?: number) =>
  sec === undefined ? '' : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

export function recipeRatio(form: BrewForm) {
  const output = isEspressoBased(form.drinkType) ? form.yieldGrams : form.waterMl
  return form.ratio || computeRatio(form.doseGrams, output)
}

export function RecipeStep({ form, setForm }: StepProps) {
  const { t } = useTranslation('brew')
  const espresso = isEspressoBased(form.drinkType)
  const [showPours, setShowPours] = useState(!!form.pourDetails?.length)

  const numberProps = (key: NumericKey, opts: { step?: number; max: number; placeholder: string }) => ({
    id: `brew-${key}`,
    type: 'number' as const,
    inputMode: (opts.step ? 'decimal' : 'numeric') as 'decimal' | 'numeric',
    min: 0,
    max: opts.max,
    step: opts.step ?? 1,
    value: form[key] ?? '',
    placeholder: opts.placeholder,
    className: `${inputClass} font-mono`,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: toNumber(e.target.value) })),
  })

  const autoRatio = computeRatio(form.doseGrams, espresso ? form.yieldGrams : form.waterMl)

  return (
    <div className="space-y-4">
      <Section title={t('wizard.recipe')}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t('dose')} htmlFor="brew-doseGrams">
            <input {...numberProps('doseGrams', { step: 0.1, max: 100, placeholder: espresso ? '18' : '15' })} />
          </FormField>

          {espresso ? (
            <FormField label={t('wizard.yield')} htmlFor="brew-yieldGrams">
              <input {...numberProps('yieldGrams', { step: 0.1, max: 1000, placeholder: '36' })} />
            </FormField>
          ) : (
            <FormField label={t('water')} htmlFor="brew-waterMl">
              <input {...numberProps('waterMl', { max: 3000, placeholder: '250' })} />
            </FormField>
          )}

          <FormField label={t('ratio')} htmlFor="brew-ratio" hint={autoRatio ? t('wizard.ratioAuto') : undefined}>
            <input
              id="brew-ratio"
              value={form.ratio ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, ratio: e.target.value || undefined }))}
              maxLength={20}
              placeholder={autoRatio ?? (espresso ? '1:2' : '1:16')}
              className={`${inputClass} font-mono`}
            />
          </FormField>

          <FormField label={t('temp')} htmlFor="brew-waterTempC">
            <input {...numberProps('waterTempC', { max: 100, placeholder: espresso ? '93' : '92' })} />
          </FormField>

          {espresso ? (
            <FormField label={t('wizard.extractionTime')} htmlFor="brew-brewTimeSec">
              <input {...numberProps('brewTimeSec', { max: 300, placeholder: '28' })} />
            </FormField>
          ) : (
            <DurationField
              value={form.brewTimeSec}
              onChange={(sec) => setForm((p) => ({ ...p, brewTimeSec: sec }))}
            />
          )}

          {!espresso && (
            <FormField label={t('wizard.yieldOptional')} htmlFor="brew-yieldGrams">
              <input {...numberProps('yieldGrams', { step: 0.1, max: 1000, placeholder: '220' })} />
            </FormField>
          )}
        </div>
      </Section>

      {!espresso && (
        <Section title={t('wizard.pouring')}>
          <FormField label={t('pourCount')} htmlFor="brew-pourCount">
            <input {...numberProps('pourCount', { max: MAX_POURS, placeholder: '4' })} />
          </FormField>

          {!!form.pourCount && form.pourCount > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowPours((s) => !s)}
                aria-expanded={showPours}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <ChevronDown size={16} aria-hidden className={showPours ? 'rotate-180' : ''} />
                {t('wizard.pourDetails')}
              </button>
              {showPours && <PourRows form={form} setForm={setForm} />}
            </>
          )}
        </Section>
      )}
    </div>
  )
}

function DurationField({ value, onChange }: { value?: number; onChange: (sec?: number) => void }) {
  const { t } = useTranslation('brew')
  const [text, setText] = useState(formatDuration(value))
  const [invalid, setInvalid] = useState(false)

  // Keep the text in sync when the form is filled later (edit mode)
  useEffect(() => setText(formatDuration(value)), [value])

  return (
    <FormField label={t('wizard.totalTime')} htmlFor="brew-time" hint={invalid ? t('wizard.timeInvalid') : undefined}>
      <input
        id="brew-time"
        inputMode="numeric"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const sec = parseDuration(text)
          setInvalid(!!text.trim() && sec === undefined)
          if (sec === undefined && text.trim()) return
          onChange(sec)
          setText(formatDuration(sec))
        }}
        maxLength={7}
        placeholder="3:00"
        aria-invalid={invalid}
        className={`${inputClass} font-mono ${invalid ? 'border-danger' : ''}`}
      />
    </FormField>
  )
}

function PourRows({ form, setForm }: StepProps) {
  const { t } = useTranslation('brew')
  const count = Math.min(form.pourCount ?? 0, MAX_POURS)
  const rows = Array.from({ length: count }, (_, i) => form.pourDetails?.[i] ?? {})

  const update = (i: number, key: 'time_sec' | 'amount_ml', raw: string) =>
    setForm((p) => {
      const next = Array.from({ length: count }, (_, j) => ({ ...(p.pourDetails?.[j] ?? {}) }))
      next[i][key] = toNumber(raw)
      return { ...p, pourDetails: next }
    })

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[3rem_1fr_1fr] gap-2 text-xs text-muted">
        <span />
        <span>{t('wizard.pourAt')}</span>
        <span>{t('wizard.pourAmount')}</span>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[3rem_1fr_1fr] gap-2 items-center">
          <span className="text-xs font-mono text-muted">#{i + 1}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={7200}
            value={row.time_sec ?? ''}
            onChange={(e) => update(i, 'time_sec', e.target.value)}
            aria-label={t('wizard.pourAtLabel', { n: i + 1 })}
            placeholder={String(i * 30)}
            className={`${inputClass} font-mono`}
          />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={3000}
            value={row.amount_ml ?? ''}
            onChange={(e) => update(i, 'amount_ml', e.target.value)}
            aria-label={t('wizard.pourAmountLabel', { n: i + 1 })}
            placeholder={i === 0 ? '50' : '60'}
            className={`${inputClass} font-mono`}
          />
        </div>
      ))}
    </div>
  )
}
