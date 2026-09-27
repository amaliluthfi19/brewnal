import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { DRINK_TYPES, isEspressoBased } from '@brewnal/types'
import { brewsService } from '../../../services/brews.service'
import { ComboInput } from '../../../components/ui/ComboInput'
import { DRIPPER_PRESETS, GRINDER_PRESETS, MACHINE_PRESETS } from '../../../lib/brew-presets'
import { FormField, Section, inputClass, type StepProps } from './shared'

export function ToolsStep({ form, setForm }: StepProps) {
  const { t } = useTranslation('brew')

  const { data } = useQuery({
    queryKey: ['brews', 'suggestions'],
    queryFn: brewsService.getSuggestions,
  })
  const history = data?.data.data ?? { grinders: [], equipment: [] }

  const espresso = isEspressoBased(form.drinkType)
  const setText = (key: 'equipment' | 'grinder' | 'grindSize') => (value: string) =>
    setForm((p) => ({ ...p, [key]: value || undefined }))

  return (
    <div className="space-y-4">
      <Section title={t('wizard.drinkType')}>
        <div role="radiogroup" aria-label={t('wizard.drinkType')} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DRINK_TYPES.map((drink) => {
            const active = form.drinkType === drink
            return (
              <button
                key={drink}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setForm((p) => ({ ...p, drinkType: drink }))}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary border-primary text-white'
                    : 'bg-surface border-border text-ink hover:border-primary'
                }`}
              >
                {t(`wizard.drinks.${drink}`)}
              </button>
            )
          })}
        </div>
      </Section>

      <Section title={t('wizard.gear')}>
        <FormField
          label={espresso ? t('wizard.machine') : t('wizard.dripper')}
          htmlFor="brew-equipment"
        >
          <ComboInput
            id="brew-equipment"
            value={form.equipment ?? ''}
            onChange={setText('equipment')}
            options={[...history.equipment, ...(espresso ? MACHINE_PRESETS : DRIPPER_PRESETS)]}
            placeholder={espresso ? 'Gaggia Classic Pro' : 'V60'}
            className={inputClass}
          />
        </FormField>

        <FormField label={t('grinder')} htmlFor="brew-grinder" hint={t('wizard.freeTextHint')}>
          <ComboInput
            id="brew-grinder"
            value={form.grinder ?? ''}
            onChange={setText('grinder')}
            options={[...history.grinders, ...GRINDER_PRESETS]}
            placeholder="Comandante C40"
            className={inputClass}
          />
        </FormField>

        <FormField label={t('grindSize')} htmlFor="brew-grind-size">
          <input
            id="brew-grind-size"
            value={form.grindSize ?? ''}
            onChange={(e) => setText('grindSize')(e.target.value)}
            maxLength={40}
            placeholder={t('wizard.grindSizePlaceholder')}
            className={inputClass}
          />
        </FormField>
      </Section>
    </div>
  )
}
