import type { CreateBrewDto, DrinkType, PourDetail } from '@brewnal/types'

// Wizard state: like CreateBrewDto, but "empty" is undefined (never null) and
// drinkType / pour rows may be half-filled while the user is typing
export type BrewForm = {
  [K in Exclude<keyof CreateBrewDto, 'drinkType' | 'pourDetails'>]?: Exclude<CreateBrewDto[K], null>
} & {
  beanId: string
  drinkType: DrinkType | ''
  pourDetails?: Partial<PourDetail>[]
}

export interface StepProps {
  form: BrewForm
  setForm: React.Dispatch<React.SetStateAction<BrewForm>>
}

export const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-surface text-ink text-sm placeholder:text-muted focus:outline-none focus:border-primary transition-colors'

export function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="text-sm text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-bold text-ink">{title}</h2>
      {children}
    </section>
  )
}

// Parses an <input type="number"> value; '' and junk become undefined
export const toNumber = (raw: string): number | undefined => {
  if (raw.trim() === '') return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}
