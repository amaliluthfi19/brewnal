import { useTranslation } from 'react-i18next'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const isID = i18n.language?.startsWith('id')

  const toggle = () => {
    i18n.changeLanguage(isID ? 'en' : 'id')
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-medium
                 bg-surface border border-border hover:border-primary transition-colors"
      title={isID ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
    >
      <span>{isID ? '🇮🇩' : '🇬🇧'}</span>
      <span>{isID ? 'ID' : 'EN'}</span>
    </button>
  )
}
