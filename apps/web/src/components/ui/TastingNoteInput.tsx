import { useState, KeyboardEvent } from 'react'

interface TastingNoteInputProps {
  value: string[]
  onChange: (notes: string[]) => void
  placeholder?: string
}

export function TastingNoteInput({ value, onChange, placeholder = 'Add note...' }: TastingNoteInputProps) {
  const [input, setInput] = useState('')

  const addNote = () => {
    const note = input.trim()
    if (note && !value.includes(note)) {
      onChange([...value, note])
    }
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addNote()
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border bg-surface min-h-10 focus-within:border-primary transition-colors">
      {value.map((note) => (
        <span
          key={note}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-ink text-xs font-mono"
        >
          {note}
          <button
            type="button"
            onClick={() => onChange(value.filter((n) => n !== note))}
            className="text-muted hover:text-danger leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addNote}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-24 bg-transparent text-sm text-ink placeholder:text-muted outline-none"
      />
    </div>
  )
}
