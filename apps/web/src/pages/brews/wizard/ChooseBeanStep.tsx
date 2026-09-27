import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import { beansService } from '../../../services/beans.service'
import { BeanCard } from '../../../components/beans/BeanCard'
import coffeeIllustration from '../../../assets/illustrations/coffee-tea.svg'
import { inputClass, type StepProps } from './shared'

const ADD_BEAN_URL = '/beans/new?returnTo=/brews/new'

export function ChooseBeanStep({ form, setForm }: StepProps) {
  const { t } = useTranslation(['brew', 'beans', 'common'])
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['beans'], queryFn: beansService.getAll })
  const allBeans = data?.data.data ?? []

  const q = search.trim().toLowerCase()
  const beans = allBeans.filter(
    (b) =>
      !q ||
      [b.roastery, b.beanName, b.originCountry, b.originRegion, b.process]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
  )

  if (isLoading) return <p className="text-muted text-center py-8">{t('common:loading')}</p>

  if (allBeans.length === 0) {
    return (
      <div className="flex flex-col items-center text-center px-6 py-8 bg-surface border border-border rounded-xl">
        <img src={coffeeIllustration} alt={t('brew:wizard.noBeansIllustration')} className="w-40 max-w-full" />
        <p className="text-muted text-sm mt-4">{t('brew:wizard.noBeans')}</p>
        <Link
          to={ADD_BEAN_URL}
          className="mt-4 inline-flex items-center gap-1.5 bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} aria-hidden />
          {t('beans:add')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common:search')}
            aria-label={t('brew:wizard.searchBeans')}
            className={`${inputClass} pl-9`}
          />
        </div>
        <Link
          to={ADD_BEAN_URL}
          className="shrink-0 inline-flex items-center gap-1.5 bg-secondary/15 text-ink rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary/25 transition-colors"
        >
          <Plus size={16} aria-hidden />
          {t('brew:wizard.addBean')}
        </Link>
      </div>

      {beans.length === 0 ? (
        <p className="text-muted text-sm text-center py-8">{t('brew:wizard.noBeanMatch')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {beans.map((bean) => (
            <BeanCard
              key={bean.id}
              bean={bean}
              selected={form.beanId === bean.id}
              onSelect={() => setForm((p) => ({ ...p, beanId: bean.id }))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
