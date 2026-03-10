import Anthropic from '@anthropic-ai/sdk'
import { ScanResult } from '@brewnal/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SCAN_PROMPT = `You are an assistant that extracts information from specialty coffee packaging labels.

Extract the following data and return ONLY a JSON object. If information is not found, return null for that field. Do NOT invent data that is not visible on the packaging.

Return this exact JSON structure:
{
  "roastery": string | null,
  "beanName": string | null,
  "originCountry": string | null,
  "originRegion": string | null,
  "altitude": number | null,
  "varietal": string | null,
  "process": "Natural" | "Washed" | "Honey" | "Anaerobic" | "Other" | null,
  "roastLevel": "Light" | "Light-Medium" | "Medium" | "Medium-Dark" | "Dark" | null,
  "roastDate": "YYYY-MM-DD" | null,
  "expectedBodyness": 1 | 2 | 3 | null,
  "expectedSweetness": 1 | 2 | 3 | null,
  "expectedAcidity": 1 | 2 | 3 | null
}

For sensory levels (1=low, 2=medium, 3=high):
- Infer from tasting notes descriptions (e.g. "bright acidity" = 3, "mild acidity" = 1)
- "full body" = bodyness 3, "light body" = bodyness 1
- "high sweetness" or "sweet" = sweetness 3

Return ONLY the JSON. No explanation, no markdown, no backticks.`

export async function scanBeanLabel(imageBase64: string, mimeType: string): Promise<ScanResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: SCAN_PROMPT,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned) as ScanResult
}
