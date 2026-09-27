// ================================
// BREWNAL — SHARED TYPES
// ================================

// --- User ---
export interface User {
  id: string
  email: string
  username: string
  displayName?: string
  avatarUrl?: string
  createdAt: string
  brewerIdentity?: BrewerIdentity | null
  identitySetAt?: string | null
  onboardingCompleted: boolean
}

export enum BrewerIdentity {
  BEGINNER = 'BEGINNER',
  HOME_BREWER = 'HOME_BREWER',
  BARISTA_CAFE = 'BARISTA_CAFE',
  BARISTA_COMPETITION = 'BARISTA_COMPETITION',
}

export interface AuthResponse {
  user: User
}

// --- Sensory ---
export type SensoryLevel = 1 | 2 | 3

export interface SensoryProfile {
  bodyness?: SensoryLevel
  sweetness?: SensoryLevel
  acidity?: SensoryLevel
}

// --- Bean ---
export type ProcessMethod = 'Natural' | 'Washed' | 'Honey' | 'Anaerobic' | 'Other'
export type RoastLevel = 'Light' | 'Light-Medium' | 'Medium' | 'Medium-Dark' | 'Dark'

export interface Bean {
  id: string
  userId: string
  roastery: string
  beanName: string
  originCountry: string
  originRegion?: string
  altitude?: number
  varietal?: string
  process?: ProcessMethod
  roastLevel?: RoastLevel
  roastDate?: string
  photoUrl?: string
  notes?: string
  scannedAt?: string
  expectedBodyness?: SensoryLevel
  expectedSweetness?: SensoryLevel
  expectedAcidity?: SensoryLevel
  createdAt: string
}

export interface CreateBeanDto {
  roastery: string
  beanName: string
  originCountry: string
  originRegion?: string
  altitude?: number
  varietal?: string
  process?: ProcessMethod
  roastLevel?: RoastLevel
  roastDate?: string
  photoUrl?: string
  notes?: string
  expectedBodyness?: SensoryLevel
  expectedSweetness?: SensoryLevel
  expectedAcidity?: SensoryLevel
}

// --- Brew Journal ---
export interface PourDetail {
  time_sec: number
  amount_ml: number
}

export const DRINK_TYPES = [
  'Espresso',
  'Manual Brew',
  'Magic',
  'Piccolo',
  'Americano',
  'Latte',
  'Cappuccino',
  'Flat White',
  'Cold Brew',
  'Other',
] as const
export type DrinkType = (typeof DRINK_TYPES)[number]

// Drinks pulled on an espresso machine: recipe is dose → yield in seconds, no pours
export const ESPRESSO_BASED: readonly DrinkType[] = [
  'Espresso',
  'Magic',
  'Piccolo',
  'Americano',
  'Latte',
  'Cappuccino',
  'Flat White',
]

export const isEspressoBased = (drink?: string): boolean =>
  !!drink && (ESPRESSO_BASED as readonly string[]).includes(drink)

export type StarRating = 1 | 2 | 3 | 4 | 5

export interface BrewSuggestions {
  grinders: string[]
  equipment: string[]
}

export interface BrewJournal {
  id: string
  userId: string
  beanId: string
  bean?: Bean
  drinkType: DrinkType
  equipment?: string
  grinder?: string
  grindSize?: string
  doseGrams?: number
  waterMl?: number
  yieldGrams?: number
  ratio?: string
  waterTempC?: number
  brewTimeSec?: number
  pourCount?: number
  pourDetails?: PourDetail[]
  tastingNotes: string[]
  rating?: StarRating
  notes?: string
  isPublic: boolean
  actualBodyness?: SensoryLevel
  actualSweetness?: SensoryLevel
  actualAcidity?: SensoryLevel
  createdAt: string
}

// Optional fields may be null so an edit can clear a value that was set before
export interface CreateBrewDto {
  beanId: string
  drinkType: DrinkType
  equipment?: string | null
  grinder?: string | null
  grindSize?: string | null
  doseGrams?: number | null
  waterMl?: number | null
  yieldGrams?: number | null
  ratio?: string | null
  waterTempC?: number | null
  brewTimeSec?: number | null
  pourCount?: number | null
  pourDetails?: PourDetail[] | null
  tastingNotes?: string[]
  rating?: StarRating | null
  notes?: string | null
  actualBodyness?: SensoryLevel | null
  actualSweetness?: SensoryLevel | null
  actualAcidity?: SensoryLevel | null
}

// --- AI ---
export interface ScanResult {
  roastery?: string
  beanName?: string
  originCountry?: string
  originRegion?: string
  altitude?: number
  varietal?: string
  process?: ProcessMethod
  roastLevel?: RoastLevel
  roastDate?: string
  expectedBodyness?: SensoryLevel
  expectedSweetness?: SensoryLevel
  expectedAcidity?: SensoryLevel
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  statusCode: number
}

// --- Language ---
export type Language = 'id' | 'en'
