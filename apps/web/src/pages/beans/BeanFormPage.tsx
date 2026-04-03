import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { beansService } from '../../services/beans.service'
import { SensoryInput } from '../../components/ui/SensoryInput'
import type { CreateBeanDto, ScanResult, ProcessMethod, RoastLevel } from '@brewnal/types'

const PROCESS_OPTIONS: ProcessMethod[] = ['Natural', 'Washed', 'Honey', 'Anaerobic', 'Other']
const ROAST_OPTIONS: RoastLevel[] = ['Light', 'Light-Medium', 'Medium', 'Medium-Dark', 'Dark']

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-bg text-ink text-sm focus:outline-none focus:border-primary transition-colors'

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-muted">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const empty = (): CreateBeanDto => ({
  roastery: '',
  beanName: '',
  originCountry: '',
})

export function BeanFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { t } = useTranslation(['beans', 'common', 'sensory'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<CreateBeanDto>(empty())
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [error, setError] = useState('')

  const { data: beanRes } = useQuery({
    queryKey: ['beans', id],
    queryFn: () => beansService.getById(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    const b = beanRes?.data.data
    if (!b) return
    setForm({
      roastery: b.roastery,
      beanName: b.beanName,
      originCountry: b.originCountry ?? '',
      originRegion: b.originRegion,
      altitude: b.altitude,
      varietal: b.varietal,
      process: b.process,
      roastLevel: b.roastLevel,
      roastDate: b.roastDate,
      notes: b.notes,
      expectedBodyness: b.expectedBodyness,
      expectedSweetness: b.expectedSweetness,
      expectedAcidity: b.expectedAcidity,
    })
  }, [beanRes])

  const saveMutation = useMutation({
    mutationFn: (data: CreateBeanDto) =>
      isEdit ? beansService.update(id!, data) : beansService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beans'] })
      navigate(isEdit ? `/beans/${id}` : '/beans')
    },
    onError: (err: any) => setError(err.response?.data?.error ?? 'Gagal menyimpan'),
  })

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanError('')
    setScanning(true)
    try {
      const res = await beansService.scanLabel(file)
      const result: ScanResult = res.data.data
      setForm((prev) => ({
        ...prev,
        roastery: result.roastery ?? prev.roastery,
        beanName: result.beanName ?? prev.beanName,
        originCountry: result.originCountry ?? prev.originCountry,
        originRegion: result.originRegion ?? prev.originRegion,
        altitude: result.altitude ?? prev.altitude,
        varietal: result.varietal ?? prev.varietal,
        process: result.process ?? prev.process,
        roastLevel: result.roastLevel ?? prev.roastLevel,
        roastDate: result.roastDate ?? prev.roastDate,
        expectedBodyness: result.expectedBodyness ?? prev.expectedBodyness,
        expectedSweetness: result.expectedSweetness ?? prev.expectedSweetness,
        expectedAcidity: result.expectedAcidity ?? prev.expectedAcidity,
      }))
    } catch {
      setScanError(t('beans:scanHint'))
    } finally {
      setScanning(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const set =
    <K extends keyof CreateBeanDto>(key: K) =>
    (val: CreateBeanDto[K] | '') => {
      setForm((prev) => ({ ...prev, [key]: val === '' ? undefined : val }))
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({
      ...form,
      altitude: form.altitude ? Number(form.altitude) : undefined,
      originRegion: form.originRegion || undefined,
      varietal: form.varietal || undefined,
      roastDate: form.roastDate || undefined,
      notes: form.notes || undefined,
    })
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted hover:text-ink text-lg">
          ←
        </button>
        <h1 className="font-display text-2xl font-black text-ink">
          {isEdit ? t('common:edit') : t('beans:add')}
        </h1>
      </div>

      {/* AI Scan */}
      {!isEdit && (
        <div className="bg-surface border border-dashed border-secondary rounded-xl p-4 text-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleScan}
          />
          <p className="text-sm text-muted mb-2">{t('beans:scanHint')}</p>
          <button
            type="button"
            disabled={scanning}
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {scanning ? t('beans:scanning') : `📷 ${t('beans:scan')}`}
          </button>
          {scanError && <p className="text-xs text-danger mt-2">{scanError}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Basic info */}
        <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-ink">Info Dasar</h2>
          <FormField label={t('beans:roastery')} required>
            <input
              value={form.roastery}
              onChange={(e) => set('roastery')(e.target.value)}
              required
              className={inputClass}
              placeholder="Anomali Coffee"
            />
          </FormField>
          <FormField label={t('beans:beanName')} required>
            <input
              value={form.beanName}
              onChange={(e) => set('beanName')(e.target.value)}
              required
              className={inputClass}
              placeholder="Flores Bajawa Natural"
            />
          </FormField>
          <FormField label={t('beans:notes')}>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => set('notes')(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </FormField>
        </section>

        {/* Origin */}
        <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-ink">Asal</h2>
          <FormField label={t('beans:originCountry')} required>
            <input
              value={form.originCountry ?? ''}
              onChange={(e) => set('originCountry')(e.target.value)}
              required
              className={inputClass}
              placeholder="Indonesia"
            />
          </FormField>
          <FormField label={t('beans:originRegion')}>
            <input
              value={form.originRegion ?? ''}
              onChange={(e) => set('originRegion')(e.target.value)}
              className={inputClass}
              placeholder="Flores, NTT"
            />
          </FormField>
          <FormField label={t('beans:altitude')}>
            <input
              type="number"
              value={form.altitude ?? ''}
              onChange={(e) => set('altitude')(e.target.value ? Number(e.target.value) : '')}
              className={inputClass}
              placeholder="1400"
            />
          </FormField>
          <FormField label={t('beans:varietal')}>
            <input
              value={form.varietal ?? ''}
              onChange={(e) => set('varietal')(e.target.value)}
              className={inputClass}
              placeholder="Typica"
            />
          </FormField>
        </section>

        {/* Roast */}
        <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-ink">Roast</h2>
          <FormField label={t('beans:process')}>
            <select
              value={form.process ?? ''}
              onChange={(e) => set('process')(e.target.value as ProcessMethod | '')}
              className={inputClass}
            >
              <option value="">—</option>
              {PROCESS_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t('beans:roastLevel')}>
            <select
              value={form.roastLevel ?? ''}
              onChange={(e) => set('roastLevel')(e.target.value as RoastLevel | '')}
              className={inputClass}
            >
              <option value="">—</option>
              {ROAST_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t('beans:roastDate')}>
            <input
              type="date"
              value={form.roastDate ?? ''}
              onChange={(e) => set('roastDate')(e.target.value)}
              className={inputClass}
            />
          </FormField>
        </section>

        {/* Expected sensory */}
        <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-ink">{t('beans:expectedProfile')}</h2>
          <SensoryInput
            label={t('sensory:bodyness')}
            value={form.expectedBodyness}
            onChange={(v) => setForm((p) => ({ ...p, expectedBodyness: v }))}
          />
          <SensoryInput
            label={t('sensory:sweetness')}
            value={form.expectedSweetness}
            onChange={(v) => setForm((p) => ({ ...p, expectedSweetness: v }))}
          />
          <SensoryInput
            label={t('sensory:acidity')}
            value={form.expectedAcidity}
            onChange={(v) => setForm((p) => ({ ...p, expectedAcidity: v }))}
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
