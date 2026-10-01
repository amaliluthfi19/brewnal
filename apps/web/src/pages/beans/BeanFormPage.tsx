import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Bean as BeanIcon, Camera, Image as ImageIcon } from 'lucide-react'
import { beansService } from '../../services/beans.service'
import { SensoryInput } from '../../components/ui/SensoryInput'
import { beanPhotoSrc, prepareBeanPhoto, PHOTO_MAX_BYTES } from '../../lib/bean-photo'
import type { CreateBeanDto, ScanResult, ProcessMethod, RoastLevel } from '@brewnal/types'

// The label scan is switched off until it moves to Gemini; the bean photo takes
// its place on the form. The API route (/ai/scan-label) is unregistered too, so
// re-enable both together.
const SCAN_ENABLED = false

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

// Where "Add bean" may send the user back to. Allowlisted so ?returnTo can't be an open redirect.
const RETURN_TARGETS = ['/brews/new'] as const

const empty = (): CreateBeanDto => ({
  roastery: '',
  beanName: '',
  originCountry: '',
})

export function BeanFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const [searchParams] = useSearchParams()
  const returnTo = RETURN_TARGETS.find((p) => p === searchParams.get('returnTo'))
  const { t } = useTranslation(['beans', 'common', 'sensory'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<CreateBeanDto>(empty())
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [error, setError] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  // The photo is only sent on save, after the bean itself is stored
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>()
  const [removePhoto, setRemovePhoto] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const { data: beanRes } = useQuery({
    queryKey: ['beans', id],
    queryFn: () => beansService.getById(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(undefined)
      return
    }
    const url = URL.createObjectURL(photoFile)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photoFile])

  const savedPhotoSrc = removePhoto ? undefined : beanPhotoSrc(beanRes?.data.data.photoUrl)
  const photoSrc = photoPreview ?? savedPhotoSrc

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
      // The API returns an ISO datetime; <input type="date"> needs YYYY-MM-DD
      roastDate: b.roastDate?.slice(0, 10),
      notes: b.notes,
      expectedBodyness: b.expectedBodyness,
      expectedSweetness: b.expectedSweetness,
      expectedAcidity: b.expectedAcidity,
    })
  }, [beanRes])

  const saveMutation = useMutation({
    mutationFn: async (data: CreateBeanDto) => {
      let beanId = id
      if (isEdit) await beansService.update(id!, data)
      else beanId = (await beansService.create(data)).data.data.id

      // The bean is saved at this point, so a photo failure is reported
      // separately instead of failing the whole save
      let photoFailure: string | undefined
      try {
        if (photoFile) await beansService.uploadPhoto(beanId!, photoFile)
        else if (removePhoto && beanRes?.data.data.photoUrl) await beansService.deletePhoto(beanId!)
      } catch (err: any) {
        photoFailure = err.response?.data?.error ?? ''
      }
      return { beanId: beanId!, photoFailure }
    },
    onSuccess: ({ beanId, photoFailure }) => {
      qc.invalidateQueries({ queryKey: ['beans'] })
      if (photoFailure !== undefined) {
        setPhotoError([t('beans:photoSaveFailed'), photoFailure].filter(Boolean).join(' '))
        // Continue on the edit form so a retry updates this bean instead of creating a duplicate
        if (!isEdit) navigate(`/beans/${beanId}/edit`, { replace: true })
        return
      }
      if (returnTo && !isEdit) {
        // Back into the brew wizard with the new bean already picked
        navigate(`${returnTo}?beanId=${encodeURIComponent(beanId)}&step=1`, { replace: true })
        return
      }
      navigate(isEdit ? `/beans/${id}` : '/beans')
    },
    onError: (err: any) => setError(err.response?.data?.error ?? 'Gagal menyimpan'),
  })

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhotoError('')
    try {
      const prepared = await prepareBeanPhoto(file)
      if (prepared.size > PHOTO_MAX_BYTES) {
        setPhotoError(t('beans:photoTooLarge'))
        return
      }
      setPhotoFile(prepared)
      setRemovePhoto(false)
    } catch {
      setPhotoError(t('beans:photoInvalid'))
    }
  }

  const handlePhotoRemove = () => {
    setPhotoError('')
    setPhotoFile(null)
    setRemovePhoto(true)
  }

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
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('common:back')}
          className="text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
        <h1 className="font-display text-2xl font-black text-ink">
          {isEdit ? t('common:edit') : t('beans:add')}
        </h1>
      </div>

      {/* Bean photo */}
      <section className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoPick}
        />
        {/* `capture` opens the rear camera directly on phones; desktop browsers
            ignore it and fall back to the file picker */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoPick}
        />
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary/15 text-secondary-ink flex items-center justify-center">
          {photoSrc ? (
            <img src={photoSrc} alt={t('beans:photoPreviewAlt')} className="h-full w-full object-cover" />
          ) : (
            <BeanIcon size={28} aria-hidden />
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-sm text-muted">{t('beans:photoHint')}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/15 text-ink text-sm font-medium hover:bg-secondary/25 transition-colors"
            >
              <Camera size={16} aria-hidden />
              {t('beans:photoCamera')}
            </button>
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/15 text-ink text-sm font-medium hover:bg-secondary/25 transition-colors"
            >
              <ImageIcon size={16} aria-hidden />
              {t('beans:photoGallery')}
            </button>
            {photoSrc && (
              <button type="button" onClick={handlePhotoRemove} className="px-2 py-2 text-sm text-danger">
                {t('beans:photoRemove')}
              </button>
            )}
          </div>
          {photoError && <p className="text-xs text-danger">{photoError}</p>}
        </div>
      </section>

      {/* AI Scan (hidden while SCAN_ENABLED is false) */}
      {SCAN_ENABLED && !isEdit && (
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/15 text-ink text-sm font-medium disabled:opacity-50 hover:bg-secondary/25 transition-colors"
          >
            {!scanning && <Camera size={16} aria-hidden />}
            {scanning ? t('beans:scanning') : t('beans:scan')}
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
