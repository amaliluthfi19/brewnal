import { Check } from 'lucide-react'

interface StepperProps {
  steps: string[]
  // 1-based
  current: number
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-start gap-2">
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className="flex-1 min-w-0 flex flex-col items-center gap-1.5"
          >
            <div className="flex w-full items-center">
              <div className={`h-0.5 flex-1 ${i === 0 ? 'invisible' : done || active ? 'bg-primary' : 'bg-border'}`} />
              <span
                className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                  done
                    ? 'bg-primary text-white'
                    : active
                      ? 'border-2 border-primary text-primary bg-surface'
                      : 'border border-border text-muted bg-surface'
                }`}
              >
                {done ? <Check size={14} aria-hidden /> : n}
              </span>
              <div
                className={`h-0.5 flex-1 ${i === steps.length - 1 ? 'invisible' : done ? 'bg-primary' : 'bg-border'}`}
              />
            </div>
            <span
              className={`text-[11px] leading-tight text-center truncate w-full ${
                active ? 'text-primary font-bold' : 'text-muted'
              }`}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
