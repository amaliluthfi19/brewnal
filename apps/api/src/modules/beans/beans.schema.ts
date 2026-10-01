import type { ProcessMethod, RoastLevel } from '@brewnal/types'

// Validated by Fastify's built-in AJV. additionalProperties: false means any key not
// listed here (userId, id, photoUrl, createdAt, ...) is stripped before the handler runs.

// @brewnal/types ships as .ts source, so only types can be imported at runtime here.
// Keying a Record by the union makes the compiler flag any value added or removed there.
const PROCESS_SET: Record<ProcessMethod, true> = {
  Natural: true,
  Washed: true,
  Honey: true,
  Anaerobic: true,
  Other: true,
}
const ROAST_LEVEL_SET: Record<RoastLevel, true> = {
  Light: true,
  'Light-Medium': true,
  Medium: true,
  'Medium-Dark': true,
  Dark: true,
}

const ID_PATTERN = '^[a-z0-9]{20,32}$'

const idString = { type: 'string', pattern: ID_PATTERN } as const
const requiredText = (max: number) => ({ type: 'string', minLength: 1, maxLength: max }) as const
const text = (max: number) => ({ type: ['string', 'null'], maxLength: max }) as const
const int = (min: number, max: number) => ({ type: ['integer', 'null'], minimum: min, maximum: max }) as const
const oneOf = (values: string[]) => ({ type: ['string', 'null'], enum: [...values, null] }) as const

const beanProperties = {
  roastery: requiredText(120),
  beanName: requiredText(120),
  originCountry: requiredText(80),
  originRegion: text(120),
  altitude: int(0, 9000),
  varietal: text(120),
  process: oneOf(Object.keys(PROCESS_SET)),
  roastLevel: oneOf(Object.keys(ROAST_LEVEL_SET)),
  // Calendar date (YYYY-MM-DD) as sent by <input type="date">; the service turns it into a Date
  roastDate: { type: ['string', 'null'], format: 'date' },
  notes: text(1000),
  expectedBodyness: int(1, 3),
  expectedSweetness: int(1, 3),
  expectedAcidity: int(1, 3),
} as const

const idParams = {
  type: 'object',
  required: ['id'],
  properties: { id: idString },
} as const

export const beanIdSchema = { params: idParams } as const

export const createBeanSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['roastery', 'beanName', 'originCountry'],
    properties: beanProperties,
  },
} as const

export const updateBeanSchema = {
  params: idParams,
  body: {
    type: 'object',
    additionalProperties: false,
    properties: beanProperties,
  },
} as const
