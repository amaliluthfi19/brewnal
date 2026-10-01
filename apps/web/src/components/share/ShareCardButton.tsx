import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Share2, X } from 'lucide-react'
import { CARD_WIDTH, shareCardHeight } from '../../lib/share-card'

interface ShareCardButtonProps {
  // Draws the card at the given height. Called each time the dialog opens so it
  // reflects current data.
  render: (height: number) => Promise<Blob>
  // Without extension, e.g. "brewnal-bean-gayo"
  fileName: string
  shareTitle: string
}

const slug = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 60) || 'card'

export function ShareCardButton({ render, fileName, shareTitle }: ShareCardButtonProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [error, setError] = useState(false)
  const [height, setHeight] = useState(shareCardHeight)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Render when the dialog opens. The finished file is kept so the Share click
  // can call navigator.share directly, while the browser still counts it as a
  // user gesture.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    let url: string | undefined
    setFile(null)
    setError(false)
    // Re-read on open: the phone may have been rotated or the window resized
    const h = shareCardHeight()
    setHeight(h)
    render(h)
      .then((blob) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setFile(new File([blob], `${slug(fileName)}.png`, { type: 'image/png' }))
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
      setPreviewUrl(undefined)
    }
    // render is recreated on every parent render; only re-run on open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const canShareFile = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

  const share = async () => {
    if (!file) return
    try {
      await navigator.share({ files: [file], title: shareTitle })
    } catch (err) {
      // AbortError = the user closed the share sheet; anything else falls back to download
      if ((err as DOMException)?.name !== 'AbortError') download()
    }
  }

  const download = () => {
    if (!file || !previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = file.name
    a.click()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('share.open')}
        className="p-2 rounded-lg border border-border text-ink hover:border-primary transition-colors"
      >
        <Share2 size={16} aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-card-title"
            className="w-full max-w-sm bg-surface border border-border rounded-xl p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 id="share-card-title" className="font-bold text-ink">
                {t('share.title')}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label={t('share.close')}
                className="p-1 rounded-lg text-muted hover:text-ink transition-colors"
              >
                <X size={20} aria-hidden />
              </button>
            </div>

            <div
              className="mx-auto rounded-lg overflow-hidden border border-border bg-bg flex items-center justify-center"
              // Largest box with the card's shape that fits the dialog width and 60% of the screen height
              style={{ aspectRatio: `${CARD_WIDTH} / ${height}`, width: `min(100%, ${(60 * CARD_WIDTH) / height}dvh)` }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt={t('share.previewAlt')} className="h-full w-full object-contain" />
              ) : (
                <p className={`text-sm ${error ? 'text-danger' : 'text-muted'}`}>
                  {error ? t('share.failed') : t('share.preparing')}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {canShareFile && (
                <button
                  type="button"
                  onClick={share}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white rounded-lg px-4 py-2 font-medium hover:bg-primary-hover transition-colors"
                >
                  <Share2 size={16} aria-hidden />
                  {t('share.share')}
                </button>
              )}
              <button
                type="button"
                onClick={download}
                disabled={!file}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50 ${
                  canShareFile
                    ? 'border border-border text-muted hover:border-primary'
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
              >
                <Download size={16} aria-hidden />
                {t('share.download')}
              </button>
            </div>
            {!canShareFile && file && <p className="text-xs text-muted text-center">{t('share.downloadHint')}</p>}
          </div>
        </div>
      )}
    </>
  )
}
