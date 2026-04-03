import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { brewsService } from '../../services/brews.service'
import { beansService } from '../../services/beans.service'
import { SensoryInput } from '../../components/ui/SensoryInput'
import { TastingNoteInput } from '../../components/ui/TastingNoteInput'
import type { CreateBrewDto } from '@brewnal/types'

const BREW_METHODS = [
  'V60', 'Aeropress', 'Chemex', 'French Press', 'Moka Pot',
  'Espresso', 'Clever Dripper', 'Cold Brew', 'Lainnya',
]

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-bg text-ink text-sm focus:outline-none focus:border-primary transition-colors'

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-muted">{label}</label>
      {children}
    </div>
  )
}

const empty = (beanId?: string): CreateBrewDto => ({
  beanId: beanId ?? '',
  brewMethod: '',
  tastingNotes: [],
})

export function BrewFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isEdit = !!id
  const { t } = useTranslation(['brew', 'common', 'sensory'])
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [form, setForm] = useState<CreateBrewDto>(empty(searchParams.get('beanId') ?? undefined))
  const [error, setError] = useState('')

  const { data: beansRes } = useQuery({ queryKey: ['beans'], queryFn: beansService.getAll })

  const { data: brewRes } = useQuery({
    queryKey: ['brews', id],
    queryFn: () => brewsService.getById(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    const b = brewRes?.data.data
    if (!b) return
    setForm({
      beanId: b.beanId,
      brewMethod: b.brewMethod,
      grinder: b.grinder,
      grindSize: b.grindSize,
      doseGrams: b.doseGrams,
      waterMl: b.waterMl,
      ratio: b.ratio,
      waterTempC: b.waterTempC,
      brewTimeSec: b.brewTimeSec,
      pourCount: b.pourCount,
      tastingNotes: b.tastingNotes,
      rating: b.rating,
      notes: b.notes,
      actualBodyness: b.actualBodyness,
      actualSweetness: b.actualSweetness,
      actualAcidity: b.actualAcidity,
    })
  }, [brewRes])

  const saveMutation = useMutation({
    mutationFn: (data: CreateBrewDto) =>
      isEdit ? brewsService.update(id!, data) : brewsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brews'] })
      navigate('/brews')
    },
    onError: (err: any) => setError(err.response?.data?.error ?? 'Gagal menyimpan'),
  })

  const setField =
    <K extends keyof CreateBrewDto>(key: K) =>
    (val: CreateBrewDto[K] | '') => {
      setForm((prev) => ({ ...prev, [key]: val === '' ? undefined : val }))
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({
      ...form,
      grinder: form.grinder || undefined,
      grindSize: form.grindSize || undefined,
      ratio: form.ratio || undefined,
      notes: form.notes || undefined,
    })
  }

  const beans = beansRes?.data.data ?? []

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted hover:text-ink text-lg">
          ←
        </button>
        <h1 className="font-display text-2xl font-black text-ink">
          {isEdit ? t('common:edit') : t('brew:add')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Bean */}
        <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-ink">Biji Kopi</h2>
          <FormField label="Pilih Beans *">
            <select
              value={form.beanId}
              onChange={(e) => setField('beanId')(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">— Pilih beans —</option>
              {beans.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.roastery} — {b.beanName}
                </option>
              ))}
            </select>
            {beans.length === 0 && (
              <p className="text-xs text-muted mt-1">
                Belum ada beans.{' '}
                <Link to="/beans/new" className="text-primary hover:underline">
                  Tambah dulu
                </Link>
              </p>
            )}
          </FormField>
        </section>

        {/* Brew setup */}
        <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-ink">Setup Brew</h2>

          <FormField label={`${t('brew:method')} *`}>
            <select
              value={form.brewMethod}
              onChange={(e) => setField('brewMethod')(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">—</option>
              {BREW_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('brew:dose')}>
              <input
                type="number"
                step="0.1"
                value={form.doseGrams ?? ''}
                onChange={(e) =>
                  setField('doseGrams')(e.target.value ? Number(e.target.value) : '')
                }
                className={inputClass}
                placeholder="18"
              />
            </FormField>
            <FormField label={t('brew:water')}>
              <input
                type="number"
                value={form.waterMl ?? ''}
                onChange={(e) =>
                  setField('waterMl')(e.target.value ? Number(e.target.value) : '')
                }
                className={inputClass}
                placeholder="300"
              />
            </FormField>
            <FormField label={t('brew:ratio')}>
              <input
                value={form.ratio ?? ''}
                onChange={(e) => setField('ratio')(e.target.value)}
                className={inputClass}
                placeholder="1:16"
              />
            </FormField>
            <FormField label={t('brew:temp')}>
              <input
                type="number"
                value={form.waterTempC ?? ''}
                onChange={(e) =>
                  setField('waterTempC')(e.target.value ? Number(e.target.value) : '')
                }
                className={inputClass}
                placeholder="93"
              />
            </FormField>
          </div>

          <FormField label={t('brew:grinder')}>
            <input
              value={form.grinder ?? ''}
              onChange={(e) => setField('grinder')(e.target.value)}
              className={inputClass}
              placeholder="Comandante C40"
            />
          </FormField>

          <FormField label={t('brew:grindSize')}>
            <input
              value={form.grindSize ?? ''}
              onChange={(e) => setField('grindSize')(e.target.value)}
              className={inputClass}
              placeholder="25 clicks / angka / kasar"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={`${t('brew:brewTime')} (detik)`}>
              <input
                type="number"
                value={form.brewTimeSec ?? ''}
                onChange={(e) =>
                  setField('brewTimeSec')(e.target.value ? Number(e.target.value) : '')
                }
                className={inputClass}
                placeholder="240"
              />
            </FormField>
            <FormField label={t('brew:pourCount')}>
              <input
                type="number"
                value={form.pourCount ?? ''}
                onChange={(e) =>
                  setField('pourCount')(e.target.value ? Number(e.target.value) : '')
                }
                className={inputClass}
                placeholder="4"
              />
            </FormField>
          </div>
        </section>

        {/* Tasting */}
        <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-ink">Hasil</h2>

          <FormField label={`${t('brew:rating')} (1–10)`}>
            <input
              type="number"
              min={1}
              max={10}
              value={form.rating ?? ''}
              onChange={(e) =>
                setField('rating')(e.target.value ? Number(e.target.value) : '')
              }
              className={inputClass}
              placeholder="8"
            />
          </FormField>

          <FormField label={t('brew:tastingNotes')}>
            <TastingNoteInput
              value={form.tastingNotes ?? []}
              onChange={(notes) => setForm((p) => ({ ...p, tastingNotes: notes }))}
              placeholder="fruity, chocolatey, citrus..."
            />
          </FormField>

          <FormField label="Catatan">
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => setField('notes')(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Kesan bebas tentang seduhan ini..."
            />
          </FormField>
        </section>

        {/* Actual sensory */}
        <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-ink">{t('brew:actualProfile')}</h2>
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
        </section>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="w-full py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {saveMutation.isPending ? t('common:loading') : t('common:save')}
        </button>
      </form>
    </div>
  )
}
