import type { DrinkType } from '@brewnal/types'

// Validated by Fastify's built-in AJV. additionalProperties: false means any key not
// listed here (userId, id, createdAt, isPublic, ...) is stripped before the handler runs.

// @brewnal/types ships as .ts source, so only types can be imported at runtime here.
// Keying a Record by DrinkType makes the compiler flag any drink added or removed there.
const DRINK_TYPE_SET: Record<DrinkType, true> = {
  Espresso: true,
  'Manual Brew': true,
  Magic: true,
  Piccolo: true,
  Americano: true,
  Latte: true,
  Cappuccino: true,
  'Flat White': true,
  'Cold Brew': true,
  Other: true,
}
const DRINK_TYPES = Object.keys(DRINK_TYPE_SET)

const ID_PATTERN = '^[a-z0-9]{20,32}$'

const idString = { type: 'string', pattern: ID_PATTERN } as const
const text = (max: number) => ({ type: ['string', 'null'], maxLength: max }) as const
const num = (min: number, max: number) => ({ type: ['number', 'null'], minimum: min, maximum: max }) as const
const int = (min: number, max: number) => ({ type: ['integer', 'null'], minimum: min, maximum: max }) as const

const brewProperties = {
  beanId: idString,
  drinkType: { type: 'string', enum: DRINK_TYPES },
  equipment: text(80),
  grinder: text(80),
  grindSize: text(40),
  doseGrams: num(0, 100),
  waterMl: num(0, 3000),
  yieldGrams: num(0, 1000),
  ratio: text(20),
  waterTempC: int(0, 100),
  brewTimeSec: int(0, 7200),
  pourCount: int(0, 20),
  pourDetails: {
    type: ['array', 'null'],
    maxItems: 20,
    items: {
      type: 'object',
      additionalProperties: false,
      required: ['time_sec', 'amount_ml'],
      properties: {
        time_sec: { type: 'integer', minimum: 0, maximum: 7200 },
        amount_ml: { type: 'number', minimum: 0, maximum: 3000 },
      },
    },
  },
  tastingNotes: {
    type: 'array',
    maxItems: 15,
    items: { type: 'string', minLength: 1, maxLength: 40 },
  },
  rating: int(1, 5),
  notes: text(1000),
  actualBodyness: int(1, 3),
  actualSweetness: int(1, 3),
  actualAcidity: int(1, 3),
} as const

const idParams = {
  type: 'object',
  required: ['id'],
  properties: { id: idString },
} as const

export const listBrewsSchema = {
  querystring: {
    type: 'object',
    additionalProperties: false,
    properties: { beanId: idString },
  },
} as const

export const brewIdSchema = { params: idParams } as const

export const createBrewSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['beanId', 'drinkType'],
    properties: brewProperties,
  },
} as const

export const updateBrewSchema = {
  params: idParams,
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['beanId', 'drinkType'],
    properties: brewProperties,
  },
} as const
