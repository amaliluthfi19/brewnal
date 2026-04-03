import { ScanResult } from '@brewnal/types'

const OCR_API_URL = 'https://api.ocr.space/parse/image'

interface OcrResponse {
  OCRExitCode: number
  ParsedResults: Array<{ ParsedText: string }>
  ErrorMessage?: string
}

async function extractTextFromImage(base64: string, mimeType: string): Promise<string> {
  const formData = new FormData()
  formData.append('base64Image', `data:${mimeType};base64,${base64}`)
  formData.append('language', 'eng')
  formData.append('isOverlayRequired', 'false')

  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    headers: { apikey: process.env.OCR_SPACE_API_KEY ?? '' },
    body: formData,
  })

  const result = (await response.json()) as OcrResponse

  if (result.OCRExitCode !== 1 || !result.ParsedResults?.length) {
    throw new Error(`OCR failed: ${result.ErrorMessage ?? 'Unknown error'}`)
  }

  return result.ParsedResults.map((r) => r.ParsedText).join('\n').trim()
}

function parseOcrText(text: string): ScanResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  // Process
  let process: ScanResult['process'] = undefined
  if (/anaerobic/i.test(text)) process = 'Anaerobic'
  else if (/natural/i.test(text)) process = 'Natural'
  else if (/fully.?washed|washed/i.test(text)) process = 'Washed'
  else if (/honey/i.test(text)) process = 'Honey'
  else if (/wet.?hull|semi.?washed|pulped/i.test(text)) process = 'Other'

  // Roast level
  let roastLevel: ScanResult['roastLevel'] = undefined
  if (/medium.?dark|medium\s*-\s*dark/i.test(text)) roastLevel = 'Medium-Dark'
  else if (/light.?medium|light\s*-\s*medium/i.test(text)) roastLevel = 'Light-Medium'
  else if (/\bdark\s*roast|\bdark\b/i.test(text)) roastLevel = 'Dark'
  else if (/\bmedium\s*roast|\bmedium\b/i.test(text)) roastLevel = 'Medium'
  else if (/\blight\s*roast|\blight\b/i.test(text)) roastLevel = 'Light'

  // Altitude
  const altMatch = text.match(/(\d{3,4})\s*(?:masl|m\.?a\.?s\.?l\.?|mdpl|meters?\s*above)/i)
  const altitude = altMatch ? parseInt(altMatch[1]) : null

  // Roast date
  let roastDate: string | null = null
  const isoMatch = text.match(/(\d{4})[\/\-.:](\d{1,2})[\/\-.:](\d{1,2})/)
  const dmyMatch = text.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/)
  if (isoMatch) {
    roastDate = `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`
  } else if (dmyMatch) {
    roastDate = `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`
  } else {
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    }
    const monthPattern = Object.keys(months).join('|')
    const m =
      text.match(new RegExp(`(\\d{1,2})\\s+(${monthPattern})[a-z]*\\.?\\s*(\\d{4})`, 'i')) ||
      text.match(new RegExp(`(${monthPattern})[a-z]*\\.?\\s*(\\d{1,2})[,\\s]+(\\d{4})`, 'i'))
    if (m) {
      if (/^\d/.test(m[1])) {
        roastDate = `${m[3]}-${months[m[2].toLowerCase().slice(0, 3)]}-${m[1].padStart(2, '0')}`
      } else {
        roastDate = `${m[3]}-${months[m[1].toLowerCase().slice(0, 3)]}-${m[2].padStart(2, '0')}`
      }
    }
  }

  // Sensory — infer from tasting notes
  let expectedAcidity: 1 | 2 | 3 | null = null
  if (/bright\s*acid|high\s*acid|acidic|zingy|citric/i.test(text)) expectedAcidity = 3
  else if (/mild\s*acid|low\s*acid|soft\s*acid/i.test(text)) expectedAcidity = 1
  else if (/acid/i.test(text)) expectedAcidity = 2

  let expectedBodyness: 1 | 2 | 3 | null = null
  if (/full.?body|heavy.?body|bold/i.test(text)) expectedBodyness = 3
  else if (/light.?body|thin\s*body/i.test(text)) expectedBodyness = 1
  else if (/body/i.test(text)) expectedBodyness = 2

  let expectedSweetness: 1 | 2 | 3 | null = null
  if (/very\s*sweet|high\s*sweet/i.test(text)) expectedSweetness = 3
  else if (/mild\s*sweet|low\s*sweet/i.test(text)) expectedSweetness = 1
  else if (/sweet/i.test(text)) expectedSweetness = 2

  // Varietal
  const varietals = [
    'Bourbon', 'Typica', 'Gesha', 'Geisha', 'Pacamara', 'Caturra', 'Catuai',
    'SL28', 'SL34', 'Catimor', 'Heirloom', 'Tim Tim', 'Sidikalang',
  ]
  const varietal = varietals.find((v) => new RegExp(v, 'i').test(text)) ?? null

  // Origin country
  const countries = [
    'Ethiopia', 'Colombia', 'Brazil', 'Guatemala', 'Kenya', 'Yemen',
    'Indonesia', 'Peru', 'Honduras', 'Costa Rica', 'Panama', 'Rwanda',
    'Burundi', 'Tanzania', 'Papua New Guinea',
  ]
  const originCountry = countries.find((c) => new RegExp(c, 'i').test(text)) ?? null

  // Origin region — line after "origin", "region", or "from"
  let originRegion: string | null = null
  const regionMatch = text.match(/(?:region|origin|from|area)[:\s]+([A-Za-z ,]+)/i)
  if (regionMatch) originRegion = regionMatch[1].trim().split('\n')[0].trim()

  // Roastery — explicit label or first line
  let roastery: string | null | undefined = null
  const roasteryMatch = text.match(/(?:roastery|roaster)[:\s]+([^\n]+)/i)
  if (roasteryMatch) roastery = roasteryMatch[1].trim()
  else if (lines[0]) roastery = lines[0]

  // Bean name — explicit label or second line
  let beanName: string | null = null
  const beanMatch = text.match(/(?:bean|coffee|nama\s*kopi)[:\s]+([^\n]+)/i)
  if (beanMatch) beanName = beanMatch[1].trim()
  else if (lines[1]) beanName = lines[1]

  return {
    roastery: roastery ?? undefined,
    beanName: beanName ?? undefined,
    originCountry: originCountry ?? undefined,
    originRegion: originRegion ?? undefined,
    altitude: altitude ?? undefined,
    varietal: varietal ?? undefined,
    process: process ?? undefined,
    roastLevel: roastLevel ?? undefined,
    roastDate: roastDate ?? undefined,
    expectedBodyness: expectedBodyness ?? undefined,
    expectedSweetness: expectedSweetness ?? undefined,
    expectedAcidity: expectedAcidity ?? undefined,
  }
}

export async function scanBeanLabel(imageBase64: string, mimeType: string): Promise<ScanResult> {
  const ocrText = await extractTextFromImage(imageBase64, mimeType)
  return parseOcrText(ocrText)
}
