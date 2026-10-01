import type { Bean, BrewJournal, SensoryLevel } from '@brewnal/types'
import logoUrl from '../assets/logo/brewnal-logo.png'
import { api } from './api'
import { isBeanPhotoPath } from './bean-photo'

// Share cards are drawn on a canvas in the browser, so nothing is published or
// stored on the server: the image only leaves the device when the user picks a
// share target. On the web the card is 4:5 portrait, the largest shape
// Instagram/Threads feeds show uncropped. On phones it takes the screen's
// portrait ratio instead, so the background fills the screen (story-style).
export const CARD_WIDTH = 1080
const DESKTOP_HEIGHT = 1350
const MAX_HEIGHT = 2400 // 20:9, the tallest common phone screen

// Phones only: a touch screen whose short side is phone-sized. Tablets and
// desktops keep 4:5. Uses the portrait ratio whatever the current orientation.
export function shareCardHeight(): number {
  const { width, height } = window.screen
  const short = Math.min(width, height)
  const isPhone = window.matchMedia('(pointer: coarse)').matches && short > 0 && short < 768
  if (!isPhone) return DESKTOP_HEIGHT
  const h = Math.round((CARD_WIDTH * Math.max(width, height)) / short)
  return Math.min(MAX_HEIGHT, Math.max(DESKTOP_HEIGHT, h))
}

// A canvas can't read Tailwind classes. These mirror the light-theme tokens in
// index.css (design system colors_and_type.css). The card is always light so it
// looks the same whatever theme the sharer uses. Keep them in sync.
const C = {
  bg: '#F4F4F4',
  surface: '#FFFFFF',
  primary: '#0D319D',
  secondary: '#FE782F',
  secondaryInk: '#9A3D08',
  pop: '#FFBE0B',
  ink: '#1A1A2E',
  muted: '#8B8FA8',
  border: '#E0E0E0',
  primaryCh: '13 49 157',
  secondaryCh: '254 120 47',
  popCh: '255 190 11',
}

const FONT = {
  display: '"Montserrat Variable", Montserrat, sans-serif',
  sans: 'Varta, sans-serif',
  mono: '"JetBrains Mono Variable", "JetBrains Mono", monospace',
}

const PAD = 56 // outer margin
const INNER = 56 // padding inside the white card
const CARD_X = PAD
const CARD_Y = PAD
const CARD_W = CARD_WIDTH - PAD * 2
const CONTENT_X = CARD_X + INNER
const CONTENT_W = CARD_W - INNER * 2

export interface SensoryRow {
  label: string
  value?: SensoryLevel | null
}

export interface BeanCardContent {
  bean: Bean
  tags: string[]
  details: { label: string; value: string }[]
  sensoryTitle: string
  sensory: SensoryRow[]
  footer: string
}

export interface BrewCardContent {
  brew: BrewJournal
  bean?: Bean
  title: string
  date: string
  params: { label: string; value: string }[]
  sensoryTitle: string
  sensory: SensoryRow[]
  footer: string
}

// ---------- assets ----------

async function loadFonts() {
  if (!document.fonts) return
  await Promise.all([
    document.fonts.load(`900 64px ${FONT.display}`),
    document.fonts.load(`700 32px ${FONT.sans}`),
    document.fonts.load(`600 32px ${FONT.sans}`),
    document.fonts.load(`400 32px ${FONT.sans}`),
    document.fonts.load(`500 32px ${FONT.mono}`),
    document.fonts.load(`600 32px ${FONT.mono}`),
    document.fonts.load(`700 32px ${FONT.mono}`),
  ]).catch(() => undefined) // fall back to system fonts rather than fail
}

async function loadLogo(): Promise<HTMLImageElement | null> {
  const img = new Image()
  img.src = logoUrl
  try {
    await img.decode()
    return img
  } catch {
    return null
  }
}

// The photo is fetched as a blob through the authenticated API client and
// decoded locally. Drawing a cross-origin <img> would taint the canvas, and
// only the known photo path shape is ever requested.
async function loadBeanPhoto(photoUrl?: string | null): Promise<ImageBitmap | null> {
  if (!photoUrl || !isBeanPhotoPath(photoUrl)) return null
  try {
    const res = await api.get<Blob>(photoUrl, { responseType: 'blob' })
    return await createImageBitmap(res.data)
  } catch {
    return null // a card without the photo is better than no card
  }
}

// ---------- drawing helpers ----------

type Ctx = CanvasRenderingContext2D

function newCanvas(height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')
  ctx.textBaseline = 'alphabetic'
  return { canvas, ctx }
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Same soft navy / yellow / orange glows as the app background
function drawBackground(ctx: Ctx, H: number) {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, CARD_WIDTH, H)
  const glow = (cx: number, cy: number, rx: number, ry: number, ch: string, a: number) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(rx / ry, 1)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry)
    g.addColorStop(0, `rgb(${ch} / ${a})`)
    g.addColorStop(1, `rgb(${ch} / 0)`)
    ctx.fillStyle = g
    ctx.fillRect(-ry, -ry, ry * 2, ry * 2)
    ctx.restore()
  }
  glow(CARD_WIDTH * 0.16, H * 0.06, CARD_WIDTH * 0.55, H * 0.32, C.primaryCh, 0.55)
  glow(CARD_WIDTH * 0.58, 0, CARD_WIDTH * 0.4, H * 0.16, C.popCh, 0.45)
  glow(CARD_WIDTH, H * 0.14, CARD_WIDTH * 0.5, H * 0.4, C.secondaryCh, 0.55)
  glow(0, H, CARD_WIDTH * 0.5, H * 0.3, C.secondaryCh, 0.25)
}

function drawCardSurface(ctx: Ctx, top: number, bottom: number) {
  roundRect(ctx, CARD_X, top, CARD_W, bottom - top, 40)
  ctx.fillStyle = C.surface
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = C.border
  ctx.stroke()
}

function fitText(ctx: Ctx, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let s = text
  while (s.length > 1 && ctx.measureText(`${s}…`).width > maxWidth) s = s.slice(0, -1)
  return `${s.trimEnd()}…`
}

// Word-wraps into at most maxLines, ellipsizing the last line. Returns new y.
function drawWrapped(ctx: Ctx, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i]
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test
      continue
    }
    lines.push(line)
    line = words[i]
    if (lines.length === maxLines) {
      line = ''
      lines[maxLines - 1] = fitText(ctx, `${lines[maxLines - 1]} ${words.slice(i).join(' ')}`, maxWidth)
      break
    }
  }
  if (line) lines.push(line)
  lines.forEach((l, i) => ctx.fillText(fitText(ctx, l, maxWidth), x, y + i * lineHeight))
  return y + (lines.length - 1) * lineHeight
}

type ChipStyle = 'origin' | 'process' | 'roast' | 'tasting'

const CHIP: Record<ChipStyle, { bg: string; fg: string; border?: string; font: string; radius: number }> = {
  origin: { bg: C.bg, fg: C.muted, border: C.border, font: `600 28px ${FONT.sans}`, radius: 999 },
  process: { bg: `rgb(${C.secondaryCh} / 0.15)`, fg: C.ink, font: `600 28px ${FONT.sans}`, radius: 999 },
  roast: { bg: `rgb(${C.primaryCh} / 0.1)`, fg: C.primary, font: `600 28px ${FONT.sans}`, radius: 999 },
  tasting: { bg: `rgb(${C.secondaryCh} / 0.1)`, fg: C.secondaryInk, font: `500 28px ${FONT.mono}`, radius: 10 },
}

// Lays chips out in rows. Returns the y just below the last row.
function drawChips(ctx: Ctx, chips: { text: string; style: ChipStyle }[], x: number, y: number, maxWidth: number, maxRows = 2) {
  const h = 52
  const gap = 14
  let cx = x
  let row = 0
  for (const chip of chips) {
    const s = CHIP[chip.style]
    ctx.font = s.font
    const text = fitText(ctx, chip.text, maxWidth - 48)
    const w = ctx.measureText(text).width + 48
    if (cx + w > x + maxWidth && cx > x) {
      if (++row >= maxRows) break
      cx = x
    }
    const cy = y + row * (h + gap)
    roundRect(ctx, cx, cy, w, h, Math.min(s.radius, h / 2))
    ctx.fillStyle = s.bg
    ctx.fill()
    if (s.border) {
      ctx.lineWidth = 2
      ctx.strokeStyle = s.border
      ctx.stroke()
    }
    ctx.fillStyle = s.fg
    ctx.fillText(text, cx + 24, cy + 36)
    cx += w + gap
  }
  return y + (row + 1) * (h + gap)
}

const GRID_COLS = 3
const GRID_ROW_H = 92

// Label/value grid. Returns the y below it.
function drawGrid(ctx: Ctx, items: { label: string; value: string }[], y: number, mono: boolean) {
  const colW = CONTENT_W / GRID_COLS
  items.forEach(({ label, value }, i) => {
    const x = CONTENT_X + (i % GRID_COLS) * colW
    const top = y + Math.floor(i / GRID_COLS) * GRID_ROW_H
    ctx.fillStyle = C.muted
    ctx.font = `400 24px ${FONT.sans}`
    ctx.fillText(fitText(ctx, label, colW - 20), x, top + 24)
    ctx.fillStyle = C.ink
    ctx.font = mono ? `600 30px ${FONT.mono}` : `700 32px ${FONT.sans}`
    ctx.fillText(fitText(ctx, value, colW - 20), x, top + 64)
  })
  return y + Math.ceil(items.length / GRID_COLS) * GRID_ROW_H
}

const SENSORY_H = 150

// Grid then sensory, each behind a divider, dropping grid rows (and then the
// sensory block) that would run past the card bottom. Returns the y below them.
function drawDetails(
  ctx: Ctx,
  y: number,
  bottom: number,
  items: { label: string; value: string }[],
  mono: boolean,
  sensoryTitle: string,
  sensory: SensoryRow[],
  sensoryFill: string,
) {
  const limit = bottom - INNER
  const hasSensory = sensory.some((r) => r.value)
  const rowsFit = Math.floor((limit - y - 36 - (hasSensory ? SENSORY_H + 36 : 0)) / GRID_ROW_H)
  const shown = items.slice(0, Math.max(0, rowsFit) * GRID_COLS)
  if (shown.length) {
    drawDivider(ctx, y)
    y = drawGrid(ctx, shown, y + 36, mono)
  }
  if (hasSensory && limit - y >= SENSORY_H + 36) {
    drawDivider(ctx, y + 4)
    y = drawSensory(ctx, sensoryTitle, sensory, y + 36, sensoryFill)
  }
  return y
}

function drawSensory(ctx: Ctx, title: string, rows: SensoryRow[], y: number, fill: string) {
  const shown = rows.filter((r) => r.value)
  if (shown.length === 0) return y
  ctx.fillStyle = C.ink
  ctx.font = `700 30px ${FONT.sans}`
  ctx.fillText(title, CONTENT_X, y + 30)
  const colW = CONTENT_W / 3
  shown.forEach(({ label, value }, i) => {
    const x = CONTENT_X + i * colW
    ctx.fillStyle = C.muted
    ctx.font = `400 26px ${FONT.sans}`
    ctx.fillText(fitText(ctx, label, colW - 16), x, y + 84)
    for (let d = 1; d <= 3; d++) {
      ctx.beginPath()
      ctx.arc(x + 14 + (d - 1) * 40, y + 120, 13, 0, Math.PI * 2)
      ctx.fillStyle = d <= (value ?? 0) ? fill : C.border
      ctx.fill()
    }
  })
  return y + SENSORY_H
}

function drawStar(ctx: Ctx, cx: number, cy: number, r: number, filled: boolean) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    ctx.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a))
  }
  ctx.closePath()
  ctx.lineJoin = 'round'
  if (filled) {
    ctx.fillStyle = C.pop
    ctx.fill()
  }
  ctx.lineWidth = 3
  ctx.strokeStyle = filled ? C.pop : C.border
  ctx.stroke()
}

function drawDivider(ctx: Ctx, y: number) {
  ctx.fillStyle = C.border
  ctx.fillRect(CONTENT_X, y, CONTENT_W, 2)
}

// Logo bottom-left of the canvas, caption bottom-right
function drawFooter(ctx: Ctx, H: number, logo: HTMLImageElement | null, caption: string) {
  const baseline = H - PAD - 4
  if (logo) {
    const h = 64
    const w = (logo.naturalWidth / logo.naturalHeight) * h
    ctx.drawImage(logo, CARD_X, H - PAD - h + 8, w, h)
  } else {
    ctx.fillStyle = C.primary
    ctx.font = `900 48px ${FONT.display}`
    ctx.fillText('brewnal', CARD_X, baseline)
  }
  ctx.fillStyle = C.ink
  ctx.font = `600 26px ${FONT.sans}`
  ctx.textAlign = 'right'
  ctx.fillText(fitText(ctx, caption, CARD_W / 2), CARD_X + CARD_W, baseline - 8)
  ctx.textAlign = 'left'
}

// Lowest y the white card may reach once the footer is reserved
const cardBottom = (H: number) => H - PAD - 88

// Fills the top of the white card edge to edge, cropping to cover
function drawPhotoBanner(ctx: Ctx, img: ImageBitmap, y: number, h: number) {
  const [x, w] = [CARD_X, CARD_W]
  const scale = Math.max(w / img.width, h / img.height)
  const sw = w / scale
  const sh = h / scale
  ctx.save()
  roundRect(ctx, x, y, w, h + 40, 40) // only the top corners show rounded
  ctx.clip()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h)
  ctx.restore()
}

function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode the card'))), 'image/png'),
  )
}

// ---------- cards ----------

// Everything below the photo. Drawn once on a scratch canvas to measure it, so
// the photo can take whatever height is left.
function drawBeanBody(ctx: Ctx, content: BeanCardContent, y: number, bottom: number, compact: boolean) {
  const { bean } = content
  ctx.fillStyle = C.muted
  ctx.font = `500 30px ${FONT.mono}`
  ctx.fillText(fitText(ctx, bean.roastery, CONTENT_W), CONTENT_X, y + 24)
  y += 44

  ctx.fillStyle = C.ink
  const size = compact ? 60 : 80
  const lineH = size + 10
  ctx.font = `900 ${size}px ${FONT.display}`
  y = drawWrapped(ctx, bean.beanName, CONTENT_X, y + lineH - 10, CONTENT_W, lineH, 2) + 36

  const chips: { text: string; style: ChipStyle }[] = [
    ...content.tags.map((text) => ({ text, style: 'origin' as const })),
    ...(bean.process ? [{ text: bean.process, style: 'process' as const }] : []),
    ...(bean.roastLevel ? [{ text: bean.roastLevel, style: 'roast' as const }] : []),
  ]
  if (chips.length) y = drawChips(ctx, chips, CONTENT_X, y, CONTENT_W) + 20

  return drawDetails(ctx, y, bottom, content.details, false, content.sensoryTitle, content.sensory, C.primary)
}

const PHOTO_MIN_H = 240
const PHOTO_MAX_H = 720

// Cards shrink to their content and sit centered above the footer, so a short
// brew (or a tall phone-shaped canvas) doesn't leave a mostly empty card.
// drawBody draws from the given top and returns the y it ended at; it runs
// once on a scratch canvas to measure, then for real.
function drawFittedCard(ctx: Ctx, H: number, drawBody: (ctx: Ctx, top: number, bottom: number) => number) {
  const bottom = cardBottom(H)
  const fullH = bottom - CARD_Y
  const contentH = drawBody(newCanvas(H).ctx, CARD_Y, bottom) - CARD_Y
  const cardH = Math.min(fullH, Math.max(CARD_MIN_H, contentH + INNER))
  const top = CARD_Y + Math.round((fullH - cardH) / 2)
  drawCardSurface(ctx, top, top + cardH)
  // Shift the limit with the card so the same rows get dropped as when measuring
  drawBody(ctx, top, bottom + (top - CARD_Y))
}

const CARD_MIN_H = 360

export async function renderBeanCard(content: BeanCardContent, H = shareCardHeight()): Promise<Blob> {
  const [, logo, photo] = await Promise.all([loadFonts(), loadLogo(), loadBeanPhoto(content.bean.photoUrl)])
  const { canvas, ctx } = newCanvas(H)

  drawBackground(ctx, H)

  if (photo) {
    // Give the photo whatever height the body leaves, within limits
    const bottom = cardBottom(H)
    const bodyH = drawBeanBody(newCanvas(H).ctx, content, CARD_Y + 40, bottom, true) - (CARD_Y + 40)
    const photoH = Math.max(PHOTO_MIN_H, Math.min(PHOTO_MAX_H, bottom - INNER - CARD_Y - 40 - bodyH))
    drawFittedCard(ctx, H, (c, top, limit) => {
      drawPhotoBanner(c, photo, top, photoH)
      return drawBeanBody(c, content, top + photoH + 40, limit, true)
    })
    photo.close()
  } else {
    drawFittedCard(ctx, H, (c, top, limit) => drawBeanBody(c, content, top + INNER, limit, false))
  }

  drawFooter(ctx, H, logo, content.footer)
  return toBlob(canvas)
}

function drawBrewBody(ctx: Ctx, content: BrewCardContent, y: number, bottom: number) {
  const { brew, bean } = content
  if (bean) {
    ctx.fillStyle = C.muted
    ctx.font = `500 30px ${FONT.mono}`
    ctx.fillText(fitText(ctx, `${bean.roastery} — ${bean.beanName}`, CONTENT_W), CONTENT_X, y + 30)
    y += 52
  }

  ctx.fillStyle = C.ink
  ctx.font = `900 80px ${FONT.display}`
  y = drawWrapped(ctx, content.title, CONTENT_X, y + 80, CONTENT_W, 90, 2)

  ctx.fillStyle = C.muted
  ctx.font = `400 28px ${FONT.sans}`
  ctx.fillText(fitText(ctx, content.date, CONTENT_W), CONTENT_X, y + 52)
  y += 84

  if (brew.rating) {
    for (let i = 1; i <= 5; i++) drawStar(ctx, CONTENT_X + 30 + (i - 1) * 72, y + 30, 30, i <= brew.rating)
    ctx.fillStyle = C.ink
    ctx.font = `700 40px ${FONT.mono}`
    ctx.fillText(`${brew.rating}/5`, CONTENT_X + 5 * 72 + 16, y + 44)
    y += 92
  }

  if (brew.tastingNotes.length) {
    y = drawChips(ctx, brew.tastingNotes.map((text) => ({ text, style: 'tasting' })), CONTENT_X, y + 8, CONTENT_W) + 16
  }

  return drawDetails(ctx, y, bottom, content.params, true, content.sensoryTitle, content.sensory, C.secondary)
}

export async function renderBrewCard(content: BrewCardContent, H = shareCardHeight()): Promise<Blob> {
  const [, logo] = await Promise.all([loadFonts(), loadLogo()])
  const { canvas, ctx } = newCanvas(H)

  drawBackground(ctx, H)
  drawFittedCard(ctx, H, (c, top, limit) => drawBrewBody(c, content, top + INNER, limit))
  drawFooter(ctx, H, logo, content.footer)
  return toBlob(canvas)
}
