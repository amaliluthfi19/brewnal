import { useId } from 'react'

interface ComboInputProps {
  value: string
  onChange: (value: string) => void
  // Shown in the dropdown in this order; duplicates (case-insensitive) are dropped
  options: string[]
  placeholder?: string
  maxLength?: number
  id?: string
  className?: string
}

// Free-text input with a native dropdown of suggestions (<datalist>)
export function ComboInput({
  value,
  onChange,
  options,
  placeholder,
  maxLength = 80,
  id,
  className,
}: ComboInputProps) {
  const listId = useId()

  const seen = new Set<string>()
  const unique = options.filter((o) => {
    const key = o.trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  return (
    <>
      <input
        id={id}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        className={className}
      />
      <datalist id={listId}>
        {unique.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  )
}
