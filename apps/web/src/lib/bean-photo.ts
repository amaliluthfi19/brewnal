import { API_BASE_URL } from './api'

// The API stores photoUrl as a path relative to its own root. Only that exact
// shape is ever turned into an <img src>, and always on our own API base, so a
// stored value can never make the browser request a third-party host
const PHOTO_PATH = /^\/beans\/[a-z0-9]+\/photo(\?v=\d+)?$/

export const isBeanPhotoPath = (photoUrl: string) => PHOTO_PATH.test(photoUrl)

export const beanPhotoSrc = (photoUrl?: string | null) =>
  photoUrl && isBeanPhotoPath(photoUrl) ? `${API_BASE_URL.replace(/\/$/, '')}${photoUrl}` : undefined

// Must stay at or below the API's multipart limit
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024
const PHOTO_MAX_EDGE = 1600

// Downscale and re-encode as JPEG before upload. Phone photos are often over
// the 5 MB limit, and re-encoding through a canvas drops EXIF metadata such as
// the GPS location. Throws if the browser cannot decode the file as an image.
export async function prepareBeanPhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')
  // JPEG has no alpha: paint white first so transparent areas don't turn black
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) throw new Error('Could not encode the photo')
  return new File([blob], 'bean.jpg', { type: 'image/jpeg' })
}
