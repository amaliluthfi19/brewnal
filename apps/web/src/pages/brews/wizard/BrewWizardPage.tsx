import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CircleAlert } from 'lucide-react'
import { isEspressoBased, type CreateBrewDto, type DrinkType, type PourDetail } from '@brewnal/types'
import { brewsService } from '../../../services/brews.service'
import { Stepper } from '../../../components/ui/Stepper'
import { ChooseBeanStep } from './ChooseBeanStep'
import { ToolsStep } from './ToolsStep'
import { RecipeStep, recipeRatio } from './RecipeStep'
import { RatingStep } from './RatingStep'
import type { BrewForm } from './shared'

const TOTAL_STEPS = 4

const int = (n?: number) => (n === undefined ? null : Math.round(n))

function toPayload(form: BrewForm): CreateBrewDto {
  const espresso = isEspressoBased(form.drinkType)
  const pours = espresso
    ? []
    : (form.pourDetails ?? [])
        .slice(0, form.pourCount ?? 0)
        .filter((r): r is PourDetail => r.time_sec !== undefined && r.amount_ml !== undefined)
        .map((r) => ({ time_sec: Math.round(r.time_sec), amount_ml: r.amount_ml }))

  return {
    beanId: form.beanId,
    drinkType: form.drinkType as DrinkType,
    equipment: form.equipment?.trim() || null,
    grinder: form.grinder?.trim() || null,
    grindSize: form.grindSize?.trim() || null,
    doseGrams: form.doseGrams ?? null,
    // Water and pours only make sense for manual brews
    waterMl: espresso ? null : (form.waterMl ?? null),
    yieldGrams: form.yieldGrams ?? null,
    ratio: recipeRatio(form) ?? null,
    waterTempC: int(form.waterTempC),
    brewTimeSec: int(form.brewTimeSec),
    pourCount: espresso ? null : int(form.pourCount),
    pourDetails: pours.length ? pours : null,
    tastingNotes: form.tastingNotes ?? [],
    rating: form.rating ?? null,
    notes: form.notes?.trim() || null,
    actualBodyness: form.actualBodyness ?? null,
    actualSweetness: form.actualSweetness ?? null,
    actualAcidity: form.actualAcidity ?? null,
  }
}

export function BrewWizardPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation(['brew', 'common'])
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [form, setForm] = useState<BrewForm>(() => ({
    beanId: searchParams.get('beanId') ?? '',
    drinkType: '',
    tastingNotes: [],
  }))
  const [loaded, setLoaded] = useState(!isEdit)
  const [error, setError] = useState('')

  const rawStep = Number(searchParams.get('step'))
  const step = rawStep >= 1 && rawStep <= TOTAL_STEPS ? rawStep : isEdit ? 2 : 1

  const goTo = (n: number, replace = false) => {
    setError('')
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('step', String(n))
        return next
      },
      { replace },
    )
    window.scrollTo({ top: 0 })
  }

  const { data: brewRes, isError: loadFailed } = useQuery({
    queryKey: ['brews', id],
    queryFn: () => brewsService.getById(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    const b = brewRes?.data.data
    if (!b || loaded) return
    setForm({
      beanId: b.beanId,
      drinkType: b.drinkType,
      equipment: b.equipment ?? undefined,
      grinder: b.grinder ?? undefined,
      grindSize: b.grindSize ?? undefined,
      doseGrams: b.doseGrams ?? undefined,
      waterMl: b.waterMl ?? undefined,
      yieldGrams: b.yieldGrams ?? undefined,
      ratio: b.ratio ?? undefined,
      waterTempC: b.waterTempC ?? undefined,
      brewTimeSec: b.brewTimeSec ?? undefined,
      pourCount: b.pourCount ?? undefined,
      pourDetails: b.pourDetails ?? undefined,
      tastingNotes: b.tastingNotes,
      rating: b.rating ?? undefined,
      notes: b.notes ?? undefined,
      actualBodyness: b.actualBodyness ?? undefined,
      actualSweetness: b.actualSweetness ?? undefined,
      actualAcidity: b.actualAcidity ?? undefined,
    })
    setLoaded(true)
  }, [brewRes, loaded])

  // A deep link or refresh can land on a later step with nothing filled in: send it back
  useEffect(() => {
    if (!loaded) return
    if (step > 1 && !form.beanId) goTo(1, true)
    else if (step > 2 && !form.drinkType) goTo(2, true)
  }, [loaded, step, form.beanId, form.drinkType])

  const saveMutation = useMutation({
    mutationFn: async (data: CreateBrewDto) => {
      if (isEdit) {
        await brewsService.update(id!, data)
        return id!
      }
      const res = await brewsService.create(data)
      return res.data.data.id
    },
    onSuccess: (brewId) => {
      qc.invalidateQueries({ queryKey: ['brews'] })
      qc.invalidateQueries({ queryKey: ['beans'] })
      navigate(`/brews/${brewId}`, { replace: true })
    },
    onError: (err: any) => setError(err.response?.data?.error ?? t('brew:wizard.saveFailed')),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1 && !form.beanId) return setError(t('brew:wizard.errorBean'))
    if (step === 2 && !form.drinkType) return setError(t('brew:wizard.errorDrink'))
    if (step < TOTAL_STEPS) return goTo(step + 1)
    saveMutation.mutate(toPayload(form))
  }

  const stepLabels = [
    t('brew:wizard.steps.bean'),
    t('brew:wizard.steps.tools'),
    t('brew:wizard.steps.recipe'),
    t('brew:wizard.steps.rating'),
  ]

  if (loadFailed) return <p className="text-danger text-center py-12">{t('brew:wizard.loadFailed')}</p>
  if (!loaded) return <p className="text-muted text-center py-12">{t('common:loading')}</p>

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step > 1 ? goTo(step - 1) : navigate(-1))}
          aria-label={t('common:back')}
          className="text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-black text-ink truncate">
            {isEdit ? t('brew:wizard.editTitle') : t('brew:add')}
          </h1>
          <p className="text-xs text-muted">
            {t('brew:wizard.stepOf', { step, total: TOTAL_STEPS })} · {stepLabels[step - 1]}
          </p>
        </div>
      </div>

      <Stepper steps={stepLabels} current={step} />

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && <ChooseBeanStep form={form} setForm={setForm} />}
        {step === 2 && <ToolsStep form={form} setForm={setForm} />}
        {step === 3 && <RecipeStep form={form} setForm={setForm} />}
        {step === 4 && <RatingStep form={form} setForm={setForm} />}

        {error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
            <CircleAlert size={16} aria-hidden className="shrink-0" />
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          {step > 1 && (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="flex-1 py-2.5 rounded-lg border border-border text-muted text-sm font-medium hover:text-ink transition-colors"
            >
              {t('common:back')}
            </button>
          )}
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex-[2] py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {step < TOTAL_STEPS
              ? t('common:next')
              : saveMutation.isPending
                ? t('common:loading')
                : t('common:save')}
          </button>
        </div>
      </form>
    </div>
  )
}
